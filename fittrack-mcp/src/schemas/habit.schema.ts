import { z } from "zod";

export const createHabitShape = {
    name: z.string().min(1).max(200),
    frequency: z.enum(["daily", "weekly"]),
};

export const idShape = {
    id: z.string().uuid(),
};

export const habitIdShape = {
    habitId: z.string().uuid(),
};

export const completeHabitShape = {
    habitId: z.string().uuid(),
    date: z
        .string()
        .optional()
        .describe("Date in YYYY-MM-DD form; defaults to today. Skips creating a duplicate if already marked complete for this date."),
};

export const deleteCompletionShape = {
    habitId: z.string().uuid(),
    date: z.string().describe("Must exactly match the date string stored on the completion (YYYY-MM-DD)"),
};
