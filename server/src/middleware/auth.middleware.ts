import { Request, Response, NextFunction } from "express";
import { createUserClient } from "../config/insforge";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
    userId: string;
    userEmail: string;
    accessToken: string;
    params: Record<string, string>;
}

export async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw AppError.unauthorized("Missing or invalid authorization header");
        }

        const token = authHeader.slice(7);
        const userClient = createUserClient(token);
        const { data, error } = await userClient.auth.getCurrentUser();

        if (error || !data?.user) {
            logger.warn(`Auth: getCurrentUser failed: ${JSON.stringify(error)}`, "Auth");
            throw AppError.unauthorized("Invalid or expired token");
        }

        const authReq = req as AuthenticatedRequest;
        authReq.userId = data.user.id;
        authReq.userEmail = data.user.email;
        authReq.accessToken = token;

        next();
    } catch (err) {
        if (err instanceof AppError) {
            next(err);
        } else {
            logger.error(`Auth error: ${(err as Error).message}`, "Auth");
            next(AppError.unauthorized("Authentication failed"));
        }
    }
}
