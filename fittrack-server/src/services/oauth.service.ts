import { randomUUID, randomBytes, createHash } from "node:crypto";
import type { IOAuthRepository } from "../repositories/interfaces/IOAuthRepository";
import type { OAuthClientRow, RegisterClientRequest } from "../shared/index";
import { AppError } from "../utils/errors";
import { createUserClient } from "../config/insforge";
import { verifyCodeChallenge } from "../oauth/pkce";

const AUTHORIZATION_CODE_TTL_MS = 60_000;
const DEFAULT_EXPIRES_IN_SECONDS = 900;

function hashSecret(secret: string): string {
    return createHash("sha256").update(secret).digest("hex");
}

function decodeJwtExpiry(token: string): number | undefined {
    try {
        const payload = token.split(".")[1];
        if (!payload) return undefined;
        const json = Buffer.from(payload, "base64url").toString("utf8");
        const parsed = JSON.parse(json) as { exp?: number };
        return typeof parsed.exp === "number" ? parsed.exp : undefined;
    } catch {
        return undefined;
    }
}

function expiresInFromAccessToken(accessToken: string): number {
    const exp = decodeJwtExpiry(accessToken);
    if (!exp) return DEFAULT_EXPIRES_IN_SECONDS;
    const seconds = exp - Math.floor(Date.now() / 1000);
    return seconds > 0 ? seconds : DEFAULT_EXPIRES_IN_SECONDS;
}

export interface IssueAuthorizationCodeParams {
    clientId: string;
    redirectUri: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    resource?: string;
    userId: string;
    insforgeAccessToken: string;
    insforgeRefreshToken: string;
}

export interface ExchangeAuthorizationCodeParams {
    code: string;
    codeVerifier: string | undefined;
    clientId: string;
    redirectUri: string | undefined;
}

export interface RefreshAccessTokenParams {
    refreshToken: string;
    clientId: string;
}

export interface TokenResult {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export class OAuthService {
    constructor(private readonly oauthRepo: IOAuthRepository) { }

    async registerClient(dto: RegisterClientRequest): Promise<{
        client_id: string;
        client_secret: string;
        client_name?: string;
        redirect_uris: string[];
    }> {
        const clientId = randomUUID();
        const clientSecret = randomBytes(32).toString("base64url");

        const row = await this.oauthRepo.createClient({
            client_id: clientId,
            client_secret_hash: hashSecret(clientSecret),
            client_name: dto.client_name,
            redirect_uris: dto.redirect_uris,
        });

        return {
            client_id: row.client_id,
            client_secret: clientSecret,
            client_name: row.client_name ?? undefined,
            redirect_uris: row.redirect_uris,
        };
    }

    async validateClient(clientId: string, redirectUri: string): Promise<OAuthClientRow> {
        const client = await this.oauthRepo.findClientByClientId(clientId);
        if (!client) throw AppError.badRequest("Unknown client_id");
        if (!client.redirect_uris.includes(redirectUri)) {
            throw AppError.badRequest("redirect_uri does not match a registered redirect URI");
        }
        return client;
    }

    async authenticateClient(clientId: string | undefined, clientSecret: string | undefined): Promise<OAuthClientRow> {
        if (!clientId || !clientSecret) throw AppError.unauthorized("Missing client credentials");
        const client = await this.oauthRepo.findClientByClientId(clientId);
        if (!client || client.client_secret_hash !== hashSecret(clientSecret)) {
            throw AppError.unauthorized("Invalid client credentials");
        }
        return client;
    }

    async issueAuthorizationCode(params: IssueAuthorizationCodeParams): Promise<string> {
        const code = randomBytes(32).toString("base64url");
        const expiresAt = new Date(Date.now() + AUTHORIZATION_CODE_TTL_MS).toISOString();

        await this.oauthRepo.createAuthorizationCode({
            code,
            client_id: params.clientId,
            user_id: params.userId,
            redirect_uri: params.redirectUri,
            code_challenge: params.codeChallenge,
            code_challenge_method: params.codeChallengeMethod,
            resource: params.resource,
            insforge_access_token: params.insforgeAccessToken,
            insforge_refresh_token: params.insforgeRefreshToken,
            expires_at: expiresAt,
        });

        return code;
    }

    async exchangeAuthorizationCode(params: ExchangeAuthorizationCodeParams): Promise<TokenResult> {
        const row = await this.oauthRepo.findAuthorizationCodeByCode(params.code);
        if (!row) throw AppError.badRequest("Invalid or expired authorization code");
        if (row.used) throw AppError.badRequest("Authorization code already used");
        if (new Date(row.expires_at).getTime() < Date.now()) {
            throw AppError.badRequest("Authorization code expired");
        }
        if (row.client_id !== params.clientId) throw AppError.badRequest("client_id mismatch");
        if (params.redirectUri && row.redirect_uri !== params.redirectUri) {
            throw AppError.badRequest("redirect_uri mismatch");
        }
        if (!verifyCodeChallenge(params.codeVerifier ?? "", row.code_challenge, row.code_challenge_method)) {
            throw AppError.badRequest("Invalid code_verifier");
        }

        await this.oauthRepo.markAuthorizationCodeUsed(row.id);

        const opaqueRefreshToken = randomBytes(32).toString("base64url");
        await this.oauthRepo.createRefreshToken({
            refresh_token: opaqueRefreshToken,
            client_id: row.client_id,
            user_id: row.user_id,
            insforge_refresh_token: row.insforge_refresh_token,
        });

        return {
            accessToken: row.insforge_access_token,
            refreshToken: opaqueRefreshToken,
            expiresIn: expiresInFromAccessToken(row.insforge_access_token),
        };
    }

    async refreshAccessToken(params: RefreshAccessTokenParams): Promise<TokenResult> {
        const row = await this.oauthRepo.findRefreshTokenByToken(params.refreshToken);
        if (!row || row.revoked) throw AppError.unauthorized("Invalid refresh token");
        if (row.client_id !== params.clientId) throw AppError.unauthorized("Invalid refresh token");

        const client = createUserClient("");
        const { data, error } = await client.auth.refreshSession({ refreshToken: row.insforge_refresh_token });
        if (error || !data?.accessToken) {
            throw AppError.unauthorized("Failed to refresh InsForge session");
        }

        if (data.refreshToken && data.refreshToken !== row.insforge_refresh_token) {
            await this.oauthRepo.updateRefreshTokenInsforgeToken(row.id, data.refreshToken);
        }

        return {
            accessToken: data.accessToken,
            refreshToken: params.refreshToken,
            expiresIn: expiresInFromAccessToken(data.accessToken),
        };
    }
}
