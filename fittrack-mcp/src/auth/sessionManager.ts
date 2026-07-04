import { insforge } from "./insforgeClient.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

interface Session {
    accessToken: string;
    refreshToken: string;
}

let session: Session | null = null;

async function signIn(): Promise<Session> {
    const { data, error } = await insforge.auth.signInWithPassword({
        email: env.FITTRACK_USER_EMAIL,
        password: env.FITTRACK_USER_PASSWORD,
    });

    if (error || !data) {
        throw AppError.unauthorized(
            `FitTrack sign-in failed: ${error?.message ?? "unknown error"} — check FITTRACK_USER_EMAIL/FITTRACK_USER_PASSWORD`,
        );
    }
    if (!data.refreshToken) {
        throw AppError.internal("InsForge sign-in did not return a refreshToken (unexpected in server mode)");
    }

    logger.info(`Signed in to InsForge as ${env.FITTRACK_USER_EMAIL}`, "auth");
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

export async function getAccessToken(): Promise<string> {
    if (!session) {
        session = await signIn();
    }
    return session.accessToken;
}

export async function refreshAccessToken(): Promise<string> {
    if (session) {
        const { data, error } = await insforge.auth.refreshSession({ refreshToken: session.refreshToken });
        if (data) {
            session = {
                accessToken: data.accessToken,
                // InsForge may rotate the refresh token; keep the old one if a new one wasn't issued
                refreshToken: data.refreshToken ?? session.refreshToken,
            };
            logger.info("Refreshed InsForge access token", "auth");
            return session.accessToken;
        }
        logger.warn(`Refresh failed (${error?.message ?? "unknown error"}), retrying full sign-in`, "auth");
    }

    session = await signIn();
    return session.accessToken;
}
