import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import type { IOAuthRepository } from "../repositories/interfaces/IOAuthRepository";
import { AppError } from "../utils/errors";

const refreshSessionMock = vi.fn();
vi.mock("../config/insforge", () => ({
    createUserClient: vi.fn(() => ({ auth: { refreshSession: refreshSessionMock } })),
}));

import { OAuthService } from "./oauth.service";

function makeJwt(exp: number): string {
    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
    return `${header}.${payload}.sig`;
}

describe("OAuthService", () => {
    let repo: IOAuthRepository;
    let service: OAuthService;

    beforeEach(() => {
        vi.clearAllMocks();
        repo = {
            createClient: vi.fn(),
            findClientByClientId: vi.fn(),
            createAuthorizationCode: vi.fn(),
            findAuthorizationCodeByCode: vi.fn(),
            markAuthorizationCodeUsed: vi.fn(),
            createRefreshToken: vi.fn(),
            findRefreshTokenByToken: vi.fn(),
            updateRefreshTokenInsforgeToken: vi.fn(),
            revokeRefreshToken: vi.fn(),
        };
        service = new OAuthService(repo);
    });

    describe("registerClient", () => {
        it("generates a client_id/secret pair and stores the secret's hash, not the plaintext", async () => {
            (repo.createClient as ReturnType<typeof vi.fn>).mockImplementation(async (dto) => ({
                id: "row-1",
                client_name: dto.client_name ?? null,
                created_at: "2026-01-01T00:00:00Z",
                ...dto,
            }));

            const result = await service.registerClient({ redirect_uris: ["https://claude.ai/cb"], client_name: "Claude" });

            expect(result.client_id).toBeTruthy();
            expect(result.client_secret).toBeTruthy();
            const createCall = (repo.createClient as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(createCall.client_secret_hash).not.toBe(result.client_secret);
            expect(createCall.client_secret_hash).toBe(createHash("sha256").update(result.client_secret).digest("hex"));
        });
    });

    describe("validateClient", () => {
        it("throws when the client does not exist", async () => {
            (repo.findClientByClientId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(service.validateClient("missing", "https://claude.ai/cb")).rejects.toThrow(AppError);
        });

        it("throws when redirect_uri is not registered", async () => {
            (repo.findClientByClientId as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: "1", client_id: "c1", client_secret_hash: "h", client_name: null,
                redirect_uris: ["https://claude.ai/cb"], created_at: "now",
            });
            await expect(service.validateClient("c1", "https://evil.example/cb")).rejects.toThrow(AppError);
        });

        it("returns the client row when valid", async () => {
            const row = {
                id: "1", client_id: "c1", client_secret_hash: "h", client_name: null,
                redirect_uris: ["https://claude.ai/cb"], created_at: "now",
            };
            (repo.findClientByClientId as ReturnType<typeof vi.fn>).mockResolvedValue(row);
            await expect(service.validateClient("c1", "https://claude.ai/cb")).resolves.toEqual(row);
        });
    });

    describe("exchangeAuthorizationCode", () => {
        const baseRow = {
            id: "code-1",
            code: "abc",
            client_id: "c1",
            user_id: "u1",
            redirect_uri: "https://claude.ai/cb",
            code_challenge: createHash("sha256").update("verifier").digest("base64url"),
            code_challenge_method: "S256",
            resource: null,
            insforge_access_token: makeJwt(Math.floor(Date.now() / 1000) + 300),
            insforge_refresh_token: "insforge-refresh",
            used: false,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            created_at: "now",
        };

        it("exchanges a valid code for the stored InsForge access token and a new opaque refresh token", async () => {
            (repo.findAuthorizationCodeByCode as ReturnType<typeof vi.fn>).mockResolvedValue(baseRow);
            (repo.createRefreshToken as ReturnType<typeof vi.fn>).mockResolvedValue({});

            const result = await service.exchangeAuthorizationCode({
                code: "abc",
                codeVerifier: "verifier",
                clientId: "c1",
                redirectUri: "https://claude.ai/cb",
            });

            expect(result.accessToken).toBe(baseRow.insforge_access_token);
            expect(result.refreshToken).toBeTruthy();
            expect(result.expiresIn).toBeGreaterThan(0);
            expect(repo.markAuthorizationCodeUsed).toHaveBeenCalledWith("code-1");
            expect(repo.createRefreshToken).toHaveBeenCalledWith(expect.objectContaining({
                client_id: "c1",
                user_id: "u1",
                insforge_refresh_token: "insforge-refresh",
            }));
        });

        it("rejects a wrong code_verifier", async () => {
            (repo.findAuthorizationCodeByCode as ReturnType<typeof vi.fn>).mockResolvedValue(baseRow);
            await expect(service.exchangeAuthorizationCode({
                code: "abc", codeVerifier: "wrong", clientId: "c1", redirectUri: "https://claude.ai/cb",
            })).rejects.toThrow(AppError);
        });

        it("rejects a code that was already used", async () => {
            (repo.findAuthorizationCodeByCode as ReturnType<typeof vi.fn>).mockResolvedValue({ ...baseRow, used: true });
            await expect(service.exchangeAuthorizationCode({
                code: "abc", codeVerifier: "verifier", clientId: "c1", redirectUri: "https://claude.ai/cb",
            })).rejects.toThrow(AppError);
        });

        it("rejects an expired code", async () => {
            (repo.findAuthorizationCodeByCode as ReturnType<typeof vi.fn>).mockResolvedValue({
                ...baseRow, expires_at: new Date(Date.now() - 1000).toISOString(),
            });
            await expect(service.exchangeAuthorizationCode({
                code: "abc", codeVerifier: "verifier", clientId: "c1", redirectUri: "https://claude.ai/cb",
            })).rejects.toThrow(AppError);
        });

        it("rejects a client_id mismatch", async () => {
            (repo.findAuthorizationCodeByCode as ReturnType<typeof vi.fn>).mockResolvedValue(baseRow);
            await expect(service.exchangeAuthorizationCode({
                code: "abc", codeVerifier: "verifier", clientId: "other-client", redirectUri: "https://claude.ai/cb",
            })).rejects.toThrow(AppError);
        });
    });

    describe("refreshAccessToken", () => {
        it("mints a fresh InsForge access token via refreshSession and keeps the same opaque refresh token", async () => {
            (repo.findRefreshTokenByToken as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: "rt-1", refresh_token: "opaque-1", client_id: "c1", user_id: "u1",
                insforge_refresh_token: "insforge-rt", revoked: false, created_at: "now", updated_at: "now",
            });
            refreshSessionMock.mockResolvedValue({
                data: { accessToken: makeJwt(Math.floor(Date.now() / 1000) + 300) },
                error: null,
            });

            const result = await service.refreshAccessToken({ refreshToken: "opaque-1", clientId: "c1" });

            expect(result.refreshToken).toBe("opaque-1");
            expect(result.accessToken).toBeTruthy();
            expect(refreshSessionMock).toHaveBeenCalledWith({ refreshToken: "insforge-rt" });
        });

        it("rejects a revoked refresh token", async () => {
            (repo.findRefreshTokenByToken as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: "rt-1", refresh_token: "opaque-1", client_id: "c1", user_id: "u1",
                insforge_refresh_token: "insforge-rt", revoked: true, created_at: "now", updated_at: "now",
            });
            await expect(service.refreshAccessToken({ refreshToken: "opaque-1", clientId: "c1" })).rejects.toThrow(AppError);
        });

        it("rejects a client_id mismatch", async () => {
            (repo.findRefreshTokenByToken as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: "rt-1", refresh_token: "opaque-1", client_id: "c1", user_id: "u1",
                insforge_refresh_token: "insforge-rt", revoked: false, created_at: "now", updated_at: "now",
            });
            await expect(service.refreshAccessToken({ refreshToken: "opaque-1", clientId: "other" })).rejects.toThrow(AppError);
        });
    });
});
