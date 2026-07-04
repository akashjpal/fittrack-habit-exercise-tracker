import { httpClient } from "./httpClient.js";
import type { ExerciseSection } from "../types.js";

export const sectionsApi = {
    list: () => httpClient.get<ExerciseSection[]>("/api/sections"),

    listByWeek: (startDate: string, endDate: string) =>
        httpClient.get<ExerciseSection[]>(
            `/api/sections/week?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
        ),

    getById: (id: string) => httpClient.get<ExerciseSection>(`/api/sections/${id}`),

    listLibrary: () => httpClient.get<ExerciseSection[]>("/api/sections/library"),

    listActiveLibrary: () => httpClient.get<ExerciseSection[]>("/api/sections/library/active"),

    listByLibraryId: (libraryId: string) => httpClient.get<ExerciseSection[]>(`/api/sections/by-library/${libraryId}`),

    create: (body: {
        name: string;
        targetSets?: number;
        date: string;
        isLibrary?: boolean;
        librarySectionId?: string | null;
    }) => httpClient.post<ExerciseSection>("/api/sections", body),

    createLibrary: (name: string) => httpClient.post<ExerciseSection>("/api/sections/library", { name }),

    update: (id: string, body: { name?: string; targetSets?: number; archived?: boolean }) =>
        httpClient.patch<ExerciseSection>(`/api/sections/${id}`, body),

    remove: (id: string) => httpClient.delete<void>(`/api/sections/${id}`),
};
