import type { Request, Response, NextFunction } from "express";
import { authorizeQuerySchema } from "../shared/index";
import type { OAuthService } from "../services/oauth.service";
import { AppError } from "../utils/errors";
import { env } from "../config/env";

export function createAuthorizeHandler(oauthService: OAuthService) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = authorizeQuerySchema.safeParse(req.query);
            if (!parsed.success) {
                throw AppError.badRequest(`Validation failed: ${parsed.error.errors.map((e) => e.message).join(", ")}`);
            }
            const query = parsed.data;

            await oauthService.validateClient(query.client_id, query.redirect_uri);

            const clientAppUrl = new URL("/oauth/authorize", env.CLIENT_URL[0]);
            for (const [key, value] of Object.entries(query)) {
                if (value !== undefined) clientAppUrl.searchParams.set(key, value);
            }

            res.redirect(clientAppUrl.toString());
        } catch (err) {
            next(err);
        }
    };
}
