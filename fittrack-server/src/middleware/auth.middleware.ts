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

export interface AuthContext {
    userId: string;
    userEmail: string;
    accessToken: string;
}

export async function resolveAuthContext(authHeader: string | undefined): Promise<AuthContext> {
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

    return { userId: data.user.id, userEmail: data.user.email, accessToken: token };
}

export async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ctx = await resolveAuthContext(req.headers.authorization);

        const authReq = req as AuthenticatedRequest;
        authReq.userId = ctx.userId;
        authReq.userEmail = ctx.userEmail;
        authReq.accessToken = ctx.accessToken;

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
