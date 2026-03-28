import { getStoredAccessToken } from "./tokenStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function getAccessToken(): string | null {
    return getStoredAccessToken();
}

async function request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
): Promise<T> {
    const token = getAccessToken();
    const url = `${API_BASE}${path}`;

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (body) headers["Content-Type"] = "application/json";

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
        window.dispatchEvent(new Event("unauthorized"));
        throw new Error("Unauthorized");
    }

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`${res.status}: ${text}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return res.json() as Promise<T>;
    }
    return undefined as unknown as T;
}

/** Typed API methods - all add auth headers automatically */
export const api = {
    get: <T = unknown>(path: string) => request<T>("GET", path),
    post: <T = unknown>(path: string, body?: unknown) => request<T>("POST", path, body),
    patch: <T = unknown>(path: string, body?: unknown) => request<T>("PATCH", path, body),
    delete: <T = unknown>(path: string) => request<T>("DELETE", path),

    /** For file uploads (voice log) */
    upload: async <T = unknown>(path: string, formData: FormData): Promise<T> => {
        const token = getAccessToken();
        const url = `${API_BASE}${path}`;

        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        // Don't set Content-Type for FormData - browser sets it with boundary

        const res = await fetch(url, {
            method: "POST",
            headers,
            body: formData,
        });

        if (res.status === 401) {
            window.dispatchEvent(new Event("unauthorized"));
            throw new Error("Unauthorized");
        }

        if (!res.ok) {
            const text = await res.text().catch(() => res.statusText);
            throw new Error(`${res.status}: ${text}`);
        }

        return res.json() as Promise<T>;
    },
};

/**
 * Query function factory for TanStack Query.
 * Usage: queryKey: ["/api/sections"] → GET /api/sections
 */
export function createQueryFn<T>(on401: "returnNull" | "throw" = "throw") {
    return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
        const path = queryKey.join("/");
        try {
            return await api.get<T>(path);
        } catch (err: unknown) {
            if (on401 === "returnNull" && err instanceof Error && err.message.startsWith("401")) {
                return null as T;
            }
            throw err;
        }
    };
}

/**
 * Backward-compatible apiRequest that returns a Response object.
 * Pages that call `apiRequest("GET", "/api/foo").then(res => res.json())` keep working.
 * Handles both full URLs and relative paths.
 */
export async function apiRequest(
    method: string,
    url: string,
    data?: unknown,
): Promise<Response> {
    const token = await getAccessToken();

    // If url is already a full URL (http/https), use it directly; otherwise prepend API_BASE
    const fullUrl = url.startsWith("http")
        ? url
        : `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (data) headers["Content-Type"] = "application/json";

    const res = await fetch(fullUrl, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    });

    if (res.status === 401) {
        window.dispatchEvent(new Event("unauthorized"));
    }

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`${res.status}: ${text}`);
    }

    return res;
}
