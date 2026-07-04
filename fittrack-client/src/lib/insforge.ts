import { createClient } from "@insforge/sdk";

const insforge = createClient({
    baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL,
    anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
});

export default insforge;
