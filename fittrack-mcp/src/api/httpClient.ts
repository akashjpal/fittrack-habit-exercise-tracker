import { env } from "../config/env.js";
import { getAccessToken, refreshAccessToken } from "../auth/sessionManager.js";
import { AppError } from "../utils/errors.js";

async function request<T>(method: string, path: string, body?: unknown, isRetry = false): Promise<T> {
    const token = isRetry ? await refreshAccessToken() : await getAccessToken();

    const res = await fetch(`${env.FITTRACK_API_BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && !isRetry) {
        return request<T>(method, path, body, true);
    }

    if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
        const code = payload?.error?.code ?? "UNKNOWN_ERROR";
        const message = payload?.error?.message ?? res.statusText;
        throw new AppError(res.status, message, code);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
}

export const httpClient = {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
    patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
    delete: <T>(path: string) => request<T>("DELETE", path),
};
