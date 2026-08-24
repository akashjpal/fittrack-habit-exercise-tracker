import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { requestLogger } from "./middleware/logger.middleware";
import { caseTransformMiddleware } from "./middleware/caseTransform.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { bootstrap } from "./container";
import { createApiRouter } from "./routes/index";
import { createMcpRouter } from "./mcp/route";
import { createOAuthRouter, createOAuthMetadataRouter } from "./oauth/route";

export function createApp() {
    const app = express();

    // Security & parsing
    app.use(helmet());
    app.use(
        cors({
            origin: env.NODE_ENV === "development" ? true : env.CLIENT_URL,
            credentials: true,
            exposedHeaders: ["Mcp-Session-Id"],
            allowedHeaders: ["Content-Type", "Authorization", "Mcp-Session-Id"],
        }),
    );
    app.use(express.json({ limit: "10mb" }));

    // Logging
    app.use(requestLogger);

    // DI & routes
    const { controllers, services } = bootstrap();

    // REST API — camelCase <-> snake_case transform is scoped to /api only
    const apiRouter = createApiRouter(controllers);
    app.use("/api", caseTransformMiddleware, apiRouter);

    // MCP — tool handlers do their own case conversion, no REST middleware applies here
    app.use("/mcp", createMcpRouter(services));

    // OAuth 2.1 authorization server (RFC 9728/8414/7591) — lets claude.ai's custom
    // connector UI authenticate against /mcp. Wire format is standard OAuth snake_case,
    // so caseTransformMiddleware does not apply here either.
    app.use(createOAuthMetadataRouter());
    app.use("/oauth", createOAuthRouter(services.oauth));

    // Error handling (must be last)
    app.use(errorMiddleware);

    return app;
}
