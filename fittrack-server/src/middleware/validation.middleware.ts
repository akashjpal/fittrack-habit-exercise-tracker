import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../utils/errors";

export function validateBody(schema: z.ZodSchema) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
            next(AppError.badRequest(`Validation failed: ${messages.join(", ")}`));
            return;
        }
        req.body = result.data;
        next();
    };
}
