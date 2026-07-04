import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const method = req.method;
        const url = req.originalUrl;
        const logMessage = `${method} ${url} ${status} ${duration}ms`;

        if (status >= 500) {
            logger.error(logMessage, "HTTP");
        } else if (status >= 400) {
            logger.warn(logMessage, "HTTP");
        } else {
            logger.info(logMessage, "HTTP");
        }
    });

    next();
}
