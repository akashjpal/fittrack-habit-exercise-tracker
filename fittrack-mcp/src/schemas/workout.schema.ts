import { z } from "zod";

export const createWorkoutShape = {
    sectionId: z.string().uuid().describe("Existing section this workout belongs to — use list_sections or create_section first"),
    exerciseType: z.string().min(1).max(100).describe("Free-text exercise name, e.g. 'Bench Press'"),
    sets: z.number().int().nonnegative(),
    reps: z.number().int().nonnegative(),
    weight: z.number().nonnegative().optional().describe("Weight per set (default 0)"),
    unit: z.string().optional().describe("Weight unit, e.g. 'kg' or 'lbs' (default 'kg')"),
    completed: z.boolean().optional().describe("Whether this workout is marked completed (default true)"),
    date: z.string().optional().describe("ISO date string; defaults to now if omitted"),
};

const batchWorkoutItem = z.object({
    exerciseType: z.string().min(1).max(100),
    sets: z.number().int().nonnegative(),
    reps: z.number().int().nonnegative(),
    weight: z.number().nonnegative().optional(),
    unit: z.string().optional(),
    completed: z.boolean().optional(),
});

export const createWorkoutBatchShape = {
    sectionId: z.string().uuid(),
    workouts: z
        .array(batchWorkoutItem)
        .min(1)
        .describe("One or more exercises to log at once. Note: all rows are timestamped now(), no per-item date override."),
};

export const setWorkoutStatusShape = {
    id: z.string().uuid(),
    completed: z.boolean(),
};

export const idShape = {
    id: z.string().uuid(),
};

export const sectionIdShape = {
    sectionId: z.string().uuid(),
};

export const weekRangeShape = {
    startDate: z.string().describe("ISO date string, start of range"),
    endDate: z.string().describe("ISO date string, end of range"),
};
