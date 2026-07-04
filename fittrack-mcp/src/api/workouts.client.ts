import { httpClient } from "./httpClient.js";
import type { Workout } from "../types.js";

export const workoutsApi = {
    list: () => httpClient.get<Workout[]>("/api/workouts"),

    listByWeek: (startDate: string, endDate: string) =>
        httpClient.get<Workout[]>(
            `/api/workouts/week?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
        ),

    listBySection: (sectionId: string) => httpClient.get<Workout[]>(`/api/workouts/section/${sectionId}`),

    create: (body: {
        sectionId: string;
        exerciseType: string;
        sets: number;
        reps: number;
        weight?: number;
        unit?: string;
        completed?: boolean;
        date?: string;
    }) => httpClient.post<Workout>("/api/workouts", body),

    createBatch: (
        sectionId: string,
        workouts: {
            exerciseType: string;
            sets: number;
            reps: number;
            weight?: number;
            unit?: string;
            completed?: boolean;
        }[],
    ) => httpClient.post<Workout[]>("/api/workouts/batch", { sectionId, workouts }),

    setStatus: (id: string, completed: boolean) => httpClient.patch<Workout>(`/api/workouts/${id}/status`, { completed }),

    remove: (id: string) => httpClient.delete<void>(`/api/workouts/${id}`),
};
