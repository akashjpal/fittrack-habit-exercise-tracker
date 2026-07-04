import { createClient } from "@insforge/sdk";
import { env } from "../config/env.js";

// isServerMode: true — Node has no cookie jar, so the SDK returns the
// access/refresh tokens in the response body instead of setting httpOnly
// cookies. This is still the plain anon-key client, never the service key.
export const insforge = createClient({
    baseUrl: env.INSFORGE_BASE_URL,
    anonKey: env.INSFORGE_ANON_KEY,
    isServerMode: true,
});
