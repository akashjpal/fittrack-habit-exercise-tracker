import { randomUUID } from "node:crypto";
import { Router, Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { resolveAuthContext, type AuthContext } from "../middleware/auth.middleware";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";
import { createMcpServer, type McpServices } from "./server";

interface McpSession {
    transport: StreamableHTTPServerTransport;
    userId: string;
}

function sendAuthError(res: Response, err: unknown) {
    const appErr = err instanceof AppError ? err : AppError.unauthorized("Authentication failed");
    res.status(appErr.statusCode).json({ error: { code: appErr.code, message: appErr.message } });
}

function sessionIdFrom(req: Request): string | undefined {
    const header = req.headers["mcp-session-id"];
    return Array.isArray(header) ? header[0] : header;
}

export function createMcpRouter(services: McpServices): Router {
    const router = Router();
    const sessions = new Map<string, McpSession>();

    async function authenticate(req: Request, res: Response): Promise<AuthContext | undefined> {
        try {
            return await resolveAuthContext(req.headers.authorization);
        } catch (err) {
            sendAuthError(res, err);
            return undefined;
        }
    }

    router.post("/", async (req, res) => {
        const authCtx = await authenticate(req, res);
        if (!authCtx) return;

        const sessionId = sessionIdFrom(req);

        if (sessionId) {
            const session = sessions.get(sessionId);
            if (!session) {
                res.status(404).json({ error: { code: "NOT_FOUND", message: "Unknown MCP session" } });
                return;
            }
            if (session.userId !== authCtx.userId) {
                res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Session does not belong to this user" } });
                return;
            }
            await session.transport.handleRequest(req, res, req.body);
            return;
        }

        if (!isInitializeRequest(req.body)) {
            res.status(400).json({ error: { code: "BAD_REQUEST", message: "Missing Mcp-Session-Id header" } });
            return;
        }

        const server = createMcpServer({ userId: authCtx.userId, userEmail: authCtx.userEmail }, services);
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sid) => {
                sessions.set(sid, { transport, userId: authCtx.userId });
            },
            onsessionclosed: (sid) => {
                sessions.delete(sid);
            },
        });

        transport.onclose = () => {
            if (transport.sessionId) sessions.delete(transport.sessionId);
        };
        transport.onerror = (err) => {
            logger.error(`MCP transport error: ${err.message}`, "MCP");
        };

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    });

    async function handleSessionRequest(req: Request, res: Response) {
        const authCtx = await authenticate(req, res);
        if (!authCtx) return;

        const sessionId = sessionIdFrom(req);
        const session = sessionId ? sessions.get(sessionId) : undefined;
        if (!session) {
            res.status(400).json({ error: { code: "BAD_REQUEST", message: "Missing or invalid Mcp-Session-Id header" } });
            return;
        }
        if (session.userId !== authCtx.userId) {
            res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Session does not belong to this user" } });
            return;
        }
        await session.transport.handleRequest(req, res);
    }

    router.get("/", handleSessionRequest);
    router.delete("/", handleSessionRequest);

    return router;
}
