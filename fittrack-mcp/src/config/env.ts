import dotenv from "dotenv";

// quiet: true — dotenv v17 otherwise prints a banner straight to stdout,
// which would corrupt the MCP JSON-RPC stream over the stdio transport.
dotenv.config({ quiet: true });

function required(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required env var: ${key}`);
    return value;
}

export const env = {
    FITTRACK_API_BASE_URL: process.env.FITTRACK_API_BASE_URL || "http://localhost:5000",
    INSFORGE_BASE_URL: required("INSFORGE_BASE_URL"),
    INSFORGE_ANON_KEY: required("INSFORGE_ANON_KEY"),
    FITTRACK_USER_EMAIL: required("FITTRACK_USER_EMAIL"),
    FITTRACK_USER_PASSWORD: required("FITTRACK_USER_PASSWORD"),
    NODE_ENV: process.env.NODE_ENV || "development",
};
