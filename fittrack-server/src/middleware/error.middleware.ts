import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

export function errorMiddleware(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    if (err instanceof AppError) {
        logger.warn(`${err.code}: ${err.message}`, "ErrorMiddleware");
        res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
            },
        });
        return;
    }

    logger.error(`Unhandled error: ${err.message}\n${err.stack}`, "ErrorMiddleware");
    res.status(500).json({
        error: {
            code: "INTERNAL_ERROR",
            message: err.message || "An unexpected error occurred",
        },
    });
}
