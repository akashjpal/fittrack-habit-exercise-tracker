import { Request, Response, NextFunction } from "express";
import { createUserClient } from "../config/insforge";
import { AppError } from "../utils/errors";

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
        const user = await userClient.auth.getCurrentUser();

        if (!user) {
            throw AppError.unauthorized("Invalid or expired token");
        }

        const authReq = req as AuthenticatedRequest;
        authReq.userId = user.id;
        authReq.userEmail = user.email;
        authReq.accessToken = token;

        next();
    } catch (err) {
        if (err instanceof AppError) {
            next(err);
        } else {
            next(AppError.unauthorized("Authentication failed"));
        }
    }
}
