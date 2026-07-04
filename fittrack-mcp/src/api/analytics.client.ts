import { httpClient } from "./httpClient.js";
import type { DashboardData, ProgressData } from "../types.js";

export const analyticsApi = {
    getDashboard: () => httpClient.get<DashboardData>("/api/analytics/dashboard"),
    getProgress: () => httpClient.get<ProgressData>("/api/analytics/progress"),
};
