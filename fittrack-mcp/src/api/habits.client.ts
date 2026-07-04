import { httpClient } from "./httpClient.js";
import type { Habit, HabitCompletion } from "../types.js";

export const habitsApi = {
    list: () => httpClient.get<Habit[]>("/api/habits"),

    create: (body: { name: string; frequency: "daily" | "weekly" }) => httpClient.post<Habit>("/api/habits", body),

    remove: (id: string) => httpClient.delete<void>(`/api/habits/${id}`),
};

export const completionsApi = {
    list: () => httpClient.get<HabitCompletion[]>("/api/completions"),

    listByHabit: (habitId: string) => httpClient.get<HabitCompletion[]>(`/api/completions/${habitId}`),

    create: (body: { habitId: string; date: string }) => httpClient.post<HabitCompletion>("/api/completions", body),

    remove: (habitId: string, date: string) =>
        httpClient.delete<void>(`/api/completions/${habitId}/${encodeURIComponent(date)}`),
};
