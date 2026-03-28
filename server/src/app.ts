import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { requestLogger } from "./middleware/logger.middleware";
import { caseTransformMiddleware } from "./middleware/caseTransform.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { bootstrap } from "./container";
import { createApiRouter } from "./routes/index";

export function createApp() {
    const app = express();

    // Security & parsing
    app.use(helmet());
    app.use(
        cors({
            origin: env.CLIENT_URL,
            credentials: true,
        }),
    );
    app.use(express.json({ limit: "10mb" }));

    // Logging
    app.use(requestLogger);

    // camelCase <-> snake_case transform
    app.use(caseTransformMiddleware);

    // DI & routes
    const { controllers } = bootstrap();
    const apiRouter = createApiRouter(controllers);
    app.use("/api", apiRouter);

    // Error handling (must be last)
    app.use(errorMiddleware);

    return app;
}
