import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required env var: ${key}`);
    return value;
}

export const env = {
    PORT: process.env.PORT || "5000",
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    INSFORGE_BASE_URL: required("INSFORGE_BASE_URL"),
    INSFORGE_ANON_KEY: required("INSFORGE_ANON_KEY"),
    INSFORGE_SERVICE_KEY: required("INSFORGE_SERVICE_KEY"),
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
};
