import dotenv from "dotenv";

// Reads .env from the repo/process root (server/ when run standalone)
dotenv.config();

function required(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required env var: ${key}`);
    return value;
}

export const env = {
    PORT: process.env.PORT || "5000",
    NODE_ENV: process.env.NODE_ENV || "development",
    // First entry doubles as the canonical client app origin OAuth /authorize redirects to.
    CLIENT_URL: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((u) => u.trim()),
    // Canonical public URL of this server, used for OAuth issuer/metadata URLs (not inferred from
    // request headers, which aren't reliable behind Render's proxy).
    PUBLIC_URL: process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || "5000"}`,
    INSFORGE_BASE_URL: required("INSFORGE_BASE_URL"),
    INSFORGE_ANON_KEY: required("INSFORGE_ANON_KEY"),
    INSFORGE_SERVICE_KEY: required("INSFORGE_SERVICE_KEY"),
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
};
