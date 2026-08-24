import { z } from "zod";

// --- Database schemas (snake_case, matching PostgreSQL columns) ---

export const oauthClientSchema = z.object({
    id: z.string().uuid(),
    client_id: z.string(),
    client_secret_hash: z.string(),
    client_name: z.string().nullable(),
    redirect_uris: z.array(z.string()),
    created_at: z.string(),
});

export const oauthAuthorizationCodeSchema = z.object({
    id: z.string().uuid(),
    code: z.string(),
    client_id: z.string(),
    user_id: z.string().uuid(),
    redirect_uri: z.string(),
    code_challenge: z.string(),
    code_challenge_method: z.string(),
    resource: z.string().nullable(),
    insforge_access_token: z.string(),
    insforge_refresh_token: z.string(),
    used: z.boolean(),
    expires_at: z.string(),
    created_at: z.string(),
});

export const oauthRefreshTokenSchema = z.object({
    id: z.string().uuid(),
    refresh_token: z.string(),
    client_id: z.string(),
    user_id: z.string().uuid(),
    insforge_refresh_token: z.string(),
    revoked: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
});

// DB-level types (snake_case)
export type OAuthClientRow = z.infer<typeof oauthClientSchema>;
export type OAuthAuthorizationCodeRow = z.infer<typeof oauthAuthorizationCodeSchema>;
export type OAuthRefreshTokenRow = z.infer<typeof oauthRefreshTokenSchema>;

// --- Repository DTOs (snake_case, matching insert payloads) ---

export interface CreateOAuthClientDto {
    client_id: string;
    client_secret_hash: string;
    client_name?: string;
    redirect_uris: string[];
}

export interface CreateAuthorizationCodeDto {
    code: string;
    client_id: string;
    user_id: string;
    redirect_uri: string;
    code_challenge: string;
    code_challenge_method: string;
    resource?: string;
    insforge_access_token: string;
    insforge_refresh_token: string;
    expires_at: string;
}

export interface CreateRefreshTokenDto {
    refresh_token: string;
    client_id: string;
    user_id: string;
    insforge_refresh_token: string;
}

// --- Wire-format schemas (OAuth spec field names, snake_case by spec — not run through caseTransformMiddleware) ---

export const registerClientRequestSchema = z.object({
    redirect_uris: z.array(z.string().url()).min(1),
    client_name: z.string().optional(),
});
export type RegisterClientRequest = z.infer<typeof registerClientRequestSchema>;

export const authorizeQuerySchema = z.object({
    response_type: z.literal("code"),
    client_id: z.string(),
    redirect_uri: z.string().url(),
    code_challenge: z.string(),
    code_challenge_method: z.literal("S256"),
    state: z.string().optional(),
    resource: z.string().optional(),
    scope: z.string().optional(),
});
export type AuthorizeQuery = z.infer<typeof authorizeQuerySchema>;

export const consentRequestSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    client_id: z.string(),
    redirect_uri: z.string().url(),
    code_challenge: z.string(),
    code_challenge_method: z.literal("S256"),
    state: z.string().optional(),
    resource: z.string().optional(),
    allow: z.boolean(),
});
export type ConsentRequest = z.infer<typeof consentRequestSchema>;
