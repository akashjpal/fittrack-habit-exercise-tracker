import { describe, it, expect } from "vitest";
import { createHabitSchema, createCompletionSchema } from "./habit.schema";

const validHabitId = "22222222-2222-2222-2222-222222222222";

describe("createHabitSchema", () => {
    it("accepts a valid daily habit", () => {
        const result = createHabitSchema.safeParse({ name: "Meditate", frequency: "daily" });
        expect(result.success).toBe(true);
    });

    it("accepts a valid weekly habit", () => {
        const result = createHabitSchema.safeParse({ name: "Long run", frequency: "weekly" });
        expect(result.success).toBe(true);
    });

    it("rejects an empty name", () => {
        const result = createHabitSchema.safeParse({ name: "", frequency: "daily" });
        expect(result.success).toBe(false);
    });

    it("rejects a name over 200 characters", () => {
        const result = createHabitSchema.safeParse({ name: "a".repeat(201), frequency: "daily" });
        expect(result.success).toBe(false);
    });

    it("rejects an invalid frequency value", () => {
        const result = createHabitSchema.safeParse({ name: "Meditate", frequency: "monthly" });
        expect(result.success).toBe(false);
    });
});

describe("createCompletionSchema", () => {
    it("accepts a valid completion", () => {
        const result = createCompletionSchema.safeParse({ habit_id: validHabitId, date: "2026-07-01T00:00:00.000Z" });
        expect(result.success).toBe(true);
    });

    it("rejects a non-uuid habit_id", () => {
        const result = createCompletionSchema.safeParse({ habit_id: "not-a-uuid", date: "2026-07-01" });
        expect(result.success).toBe(false);
    });

    it("rejects a missing date", () => {
        const result = createCompletionSchema.safeParse({ habit_id: validHabitId });
        expect(result.success).toBe(false);
    });
});
