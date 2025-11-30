import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Shared state for token refreshing
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include", // Always send cookies
  };

  let res = await fetch(url, fetchOptions);

  // If unauthorized and not already trying to refresh (and not the refresh endpoint itself)
  if (res.status === 401 && !url.endsWith("/api/auth/refresh")) {
    if (!isRefreshing) {
      isRefreshing = true;
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      const refreshUrl = `${baseUrl}/api/auth/refresh`;
      refreshPromise = fetch(refreshUrl, { ...fetchOptions, method: "POST" })
        .then(async (refreshRes) => {
          if (!refreshRes.ok) {
            throw new Error("Refresh failed");
          }
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    if (refreshPromise) {
      try {
        await refreshPromise;
        // Retry the original request
        res = await fetch(url, fetchOptions);
      } catch (error) {
        // Refresh failed, redirect to login
        window.dispatchEvent(new Event("unauthorized"));
        return res;
      }
    }
  }

  return res;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const fullUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;

  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const res = await authenticatedFetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      const url = queryKey.join("/") as string;
      const fullUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;

      const res = await authenticatedFetch(fullUrl);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
