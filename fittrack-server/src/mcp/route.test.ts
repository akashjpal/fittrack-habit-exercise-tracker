import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { AppError } from "../utils/errors";

vi.mock("../middleware/auth.middleware", () => ({
    resolveAuthContext: vi.fn(),
}));

import { resolveAuthContext } from "../middleware/auth.middleware";
import { createMcpRouter } from "./route";
import type { McpServices } from "./server";

describe("MCP route", () => {
    let server: Server;
    let baseUrl: string;

    beforeAll(async () => {
        const app = express();
        app.use(express.json());
        app.use("/mcp", createMcpRouter({} as McpServices));

        server = app.listen(0);
        await new Promise<void>((resolve) => server.once("listening", resolve));
        const address = server.address();
        if (address && typeof address === "object") {
            baseUrl = `http://127.0.0.1:${address.port}/mcp`;
        }
    });

    afterAll(() => {
        server.close();
    });

    it("rejects a request with no Authorization header", async () => {
        (resolveAuthContext as ReturnType<typeof vi.fn>).mockRejectedValue(
            AppError.unauthorized("Missing or invalid authorization header"),
        );

        const res = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1, params: {} }),
        });

        expect(res.status).toBe(401);
        const body = (await res.json()) as { error: { code: string } };
        expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects a non-initialize request that has no session id", async () => {
        (resolveAuthContext as ReturnType<typeof vi.fn>).mockResolvedValue({
            userId: "user-1",
            userEmail: "u@example.com",
            accessToken: "token",
        });

        const res = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", method: "tools/call", id: 1, params: {} }),
        });

        expect(res.status).toBe(400);
        const body = (await res.json()) as { error: { code: string } };
        expect(body.error.code).toBe("BAD_REQUEST");
    });

    it("rejects GET requests with an unknown session id", async () => {
        (resolveAuthContext as ReturnType<typeof vi.fn>).mockResolvedValue({
            userId: "user-1",
            userEmail: "u@example.com",
            accessToken: "token",
        });

        const res = await fetch(baseUrl, {
            method: "GET",
            headers: { "mcp-session-id": "does-not-exist" },
        });

        expect(res.status).toBe(400);
    });
});
