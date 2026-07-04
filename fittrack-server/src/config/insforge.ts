import { createClient } from "@insforge/sdk";
import { env } from "./env";

// Admin client (service key) - for server-side operations
export const insforgeAdmin = createClient({
    baseUrl: env.INSFORGE_BASE_URL,
    anonKey: env.INSFORGE_SERVICE_KEY,
    isServerMode: true,
});

// Create a per-request client with user's access token
export function createUserClient(accessToken: string) {
    return createClient({
        baseUrl: env.INSFORGE_BASE_URL,
        anonKey: env.INSFORGE_ANON_KEY,
        isServerMode: true,
        edgeFunctionToken: accessToken,
    });
}
