import { QueryClient } from "@tanstack/react-query";
import { createQueryFn, apiRequest } from "./api";

// Re-export for backward compatibility with existing pages
export { apiRequest };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: createQueryFn("throw"),
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
