import type { Request, Response, NextFunction } from "express";
import type { OAuthService } from "../services/oauth.service";
import { AppError } from "../utils/errors";

function toResponse(result: { accessToken: string; refreshToken: string; expiresIn: number }) {
    return {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        token_type: "Bearer",
        expires_in: result.expiresIn,
    };
}

export function createTokenHandler(oauthService: OAuthService) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as Record<string, string | undefined>;
            const client = await oauthService.authenticateClient(body.client_id, body.client_secret);

            if (body.grant_type === "authorization_code") {
                if (!body.code) throw AppError.badRequest("Missing code");
                const result = await oauthService.exchangeAuthorizationCode({
                    code: body.code,
                    codeVerifier: body.code_verifier,
                    clientId: client.client_id,
                    redirectUri: body.redirect_uri,
                });
                res.json(toResponse(result));
                return;
            }

            if (body.grant_type === "refresh_token") {
                if (!body.refresh_token) throw AppError.badRequest("Missing refresh_token");
                const result = await oauthService.refreshAccessToken({
                    refreshToken: body.refresh_token,
                    clientId: client.client_id,
                });
                res.json(toResponse(result));
                return;
            }

            throw AppError.badRequest("Unsupported grant_type");
        } catch (err) {
            next(err);
        }
    };
}
