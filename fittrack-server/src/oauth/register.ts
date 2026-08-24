import type { Request, Response, NextFunction } from "express";
import { registerClientRequestSchema } from "../shared/index";
import type { OAuthService } from "../services/oauth.service";
import { AppError } from "../utils/errors";

export function createRegisterHandler(oauthService: OAuthService) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = registerClientRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                throw AppError.badRequest(`Validation failed: ${parsed.error.errors.map((e) => e.message).join(", ")}`);
            }
            const client = await oauthService.registerClient(parsed.data);

            res.status(201).json({
                client_id: client.client_id,
                client_secret: client.client_secret,
                client_name: client.client_name,
                redirect_uris: client.redirect_uris,
                token_endpoint_auth_method: "client_secret_post",
                grant_types: ["authorization_code", "refresh_token"],
                response_types: ["code"],
            });
        } catch (err) {
            next(err);
        }
    };
}
