import { z } from "zod";

// --- Database schemas (snake_case, matching PostgreSQL columns) ---

export const habitSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1),
    frequency: z.enum(["daily", "weekly"]),
    created_at: z.string(),
    updated_at: z.string(),
});

export const createHabitSchema = z.object({
    name: z.string().min(1).max(200),
    frequency: z.enum(["daily", "weekly"]),
});

export const habitCompletionSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    habit_id: z.string().uuid(),
    date: z.string(),
    created_at: z.string(),
});

export const createCompletionSchema = z.object({
    habit_id: z.string().uuid(),
    date: z.string(),
});

// DB-level types (snake_case)
export type HabitRow = z.infer<typeof habitSchema>;
export type CreateHabitDto = z.infer<typeof createHabitSchema>;
export type HabitCompletionRow = z.infer<typeof habitCompletionSchema>;
export type CreateCompletionDto = z.infer<typeof createCompletionSchema>;

// --- Client-facing types (camelCase, matching what the API returns after transformation) ---

export interface Habit {
    id: string;
    userId: string;
    name: string;
    frequency: "daily" | "weekly";
    createdAt: string;
    updatedAt: string;
}

export interface HabitCompletion {
    id: string;
    userId: string;
    habitId: string;
    date: string;
    createdAt: string;
}
