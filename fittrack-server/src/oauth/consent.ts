import type { Request, Response, NextFunction } from "express";
import { consentRequestSchema } from "../shared/index";
import type { OAuthService } from "../services/oauth.service";
import { resolveAuthContext } from "../middleware/auth.middleware";
import { AppError } from "../utils/errors";

export function createConsentHandler(oauthService: OAuthService) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = consentRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                throw AppError.badRequest(`Validation failed: ${parsed.error.errors.map((e) => e.message).join(", ")}`);
            }
            const body = parsed.data;

            await oauthService.validateClient(body.client_id, body.redirect_uri);

            if (!body.allow) {
                const denyUrl = new URL(body.redirect_uri);
                denyUrl.searchParams.set("error", "access_denied");
                if (body.state) denyUrl.searchParams.set("state", body.state);
                res.json({ redirect_uri: denyUrl.toString() });
                return;
            }

            const authCtx = await resolveAuthContext(`Bearer ${body.access_token}`);

            const code = await oauthService.issueAuthorizationCode({
                clientId: body.client_id,
                redirectUri: body.redirect_uri,
                codeChallenge: body.code_challenge,
                codeChallengeMethod: body.code_challenge_method,
                resource: body.resource,
                userId: authCtx.userId,
                insforgeAccessToken: body.access_token,
                insforgeRefreshToken: body.refresh_token,
            });

            const redirectUrl = new URL(body.redirect_uri);
            redirectUrl.searchParams.set("code", code);
            if (body.state) redirectUrl.searchParams.set("state", body.state);

            res.json({ redirect_uri: redirectUrl.toString() });
        } catch (err) {
            next(err);
        }
    };
}
