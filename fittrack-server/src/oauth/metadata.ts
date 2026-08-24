import type { Request, Response } from "express";
import { env } from "../config/env";

export function protectedResourceMetadata(_req: Request, res: Response): void {
    res.json({
        resource: `${env.PUBLIC_URL}/mcp`,
        authorization_servers: [env.PUBLIC_URL],
    });
}

export function authorizationServerMetadata(_req: Request, res: Response): void {
    res.json({
        issuer: env.PUBLIC_URL,
        authorization_endpoint: `${env.PUBLIC_URL}/oauth/authorize`,
        token_endpoint: `${env.PUBLIC_URL}/oauth/token`,
        registration_endpoint: `${env.PUBLIC_URL}/oauth/register`,
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code", "refresh_token"],
        code_challenge_methods_supported: ["S256"],
        token_endpoint_auth_methods_supported: ["client_secret_post"],
    });
}
