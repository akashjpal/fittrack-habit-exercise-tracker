import { describe, it, expect } from "vitest";
import { createWorkoutSchema, batchCreateWorkoutSchema } from "./workout.schema";

const validSectionId = "11111111-1111-1111-1111-111111111111";

describe("createWorkoutSchema", () => {
    it("accepts a fully specified valid workout", () => {
        const result = createWorkoutSchema.safeParse({
            section_id: validSectionId,
            exercise_type: "Bench Press",
            sets: 3,
            reps: 10,
            weight: 40,
            unit: "kg",
            completed: true,
            date: "2026-07-01",
        });
        expect(result.success).toBe(true);
    });

    it("defaults weight to 0, unit to kg, and completed to true when omitted", () => {
        const result = createWorkoutSchema.safeParse({
            section_id: validSectionId,
            exercise_type: "Bench Press",
            sets: 3,
            reps: 10,
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.weight).toBe(0);
            expect(result.data.unit).toBe("kg");
            expect(result.data.completed).toBe(true);
        }
    });

    it("rejects a non-uuid section_id", () => {
        const result = createWorkoutSchema.safeParse({
            section_id: "not-a-uuid",
            exercise_type: "Bench Press",
            sets: 3,
            reps: 10,
        });
        expect(result.success).toBe(false);
    });

    it("rejects an empty exercise_type", () => {
        const result = createWorkoutSchema.safeParse({
            section_id: validSectionId,
            exercise_type: "",
            sets: 3,
            reps: 10,
        });
        expect(result.success).toBe(false);
    });

    it("rejects negative sets/reps", () => {
        const result = createWorkoutSchema.safeParse({
            section_id: validSectionId,
            exercise_type: "Bench Press",
            sets: -1,
            reps: 10,
        });
        expect(result.success).toBe(false);
    });

    it("rejects non-integer sets", () => {
        const result = createWorkoutSchema.safeParse({
            section_id: validSectionId,
            exercise_type: "Bench Press",
            sets: 3.5,
            reps: 10,
        });
        expect(result.success).toBe(false);
    });
});

describe("batchCreateWorkoutSchema", () => {
    it("accepts a batch of workouts sharing one section_id", () => {
        const result = batchCreateWorkoutSchema.safeParse({
            section_id: validSectionId,
            workouts: [
                { exercise_type: "Row", sets: 3, reps: 10 },
                { exercise_type: "Curl", sets: 3, reps: 12, weight: 15, unit: "lbs" },
            ],
        });
        expect(result.success).toBe(true);
    });

    it("rejects a batch containing an invalid workout entry", () => {
        const result = batchCreateWorkoutSchema.safeParse({
            section_id: validSectionId,
            workouts: [{ exercise_type: "", sets: 3, reps: 10 }],
        });
        expect(result.success).toBe(false);
    });

    it("accepts an empty workouts array", () => {
        const result = batchCreateWorkoutSchema.safeParse({
            section_id: validSectionId,
            workouts: [],
        });
        expect(result.success).toBe(true);
    });
});
