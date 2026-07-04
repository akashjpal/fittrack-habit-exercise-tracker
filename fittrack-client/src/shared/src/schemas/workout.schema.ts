import { z } from "zod";

// --- Database schemas (snake_case, matching PostgreSQL columns) ---

export const workoutSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    section_id: z.string().uuid(),
    exercise_type: z.string().min(1),
    sets: z.number().int().nonnegative(),
    reps: z.number().int().nonnegative(),
    weight: z.number().nonnegative(),
    unit: z.string().default("kg"),
    completed: z.boolean().default(true),
    date: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const createWorkoutSchema = z.object({
    section_id: z.string().uuid(),
    exercise_type: z.string().min(1).max(100),
    sets: z.number().int().nonnegative(),
    reps: z.number().int().nonnegative(),
    weight: z.number().nonnegative().default(0),
    unit: z.string().default("kg"),
    completed: z.boolean().optional().default(true),
    date: z.string().optional(),
});

export const batchCreateWorkoutSchema = z.object({
    section_id: z.string().uuid(),
    workouts: z.array(z.object({
        exercise_type: z.string().min(1).max(100),
        sets: z.number().int().nonnegative(),
        reps: z.number().int().nonnegative(),
        weight: z.number().nonnegative().default(0),
        unit: z.string().default("kg"),
        completed: z.boolean().optional().default(true),
    })),
});

// DB-level types (snake_case)
export type WorkoutRow = z.infer<typeof workoutSchema>;
export type CreateWorkoutDto = z.infer<typeof createWorkoutSchema>;
export type BatchCreateWorkoutDto = z.infer<typeof batchCreateWorkoutSchema>;

// --- Client-facing types (camelCase, matching what the API returns after transformation) ---

export interface Workout {
    id: string;
    userId: string;
    sectionId: string;
    exerciseType: string;
    sets: number;
    reps: number;
    weight: number;
    unit: string;
    completed: boolean;
    date: string;
    createdAt: string;
    updatedAt: string;
}
