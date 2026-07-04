import { describe, it, expect } from "vitest";
import { createSectionSchema, updateSectionSchema } from "./section.schema";

describe("createSectionSchema", () => {
    it("accepts a minimal valid section and defaults target_sets/is_library", () => {
        const result = createSectionSchema.safeParse({ name: "Push Day", date: "2026-07-01" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.target_sets).toBe(10);
            expect(result.data.is_library).toBe(false);
        }
    });

    it("rejects an empty name", () => {
        const result = createSectionSchema.safeParse({ name: "", date: "2026-07-01" });
        expect(result.success).toBe(false);
    });

    it("rejects a missing date", () => {
        const result = createSectionSchema.safeParse({ name: "Push Day" });
        expect(result.success).toBe(false);
    });

    it("rejects a negative target_sets", () => {
        const result = createSectionSchema.safeParse({ name: "Push Day", date: "2026-07-01", target_sets: -5 });
        expect(result.success).toBe(false);
    });

    it("allows an explicit null library_section_id", () => {
        const result = createSectionSchema.safeParse({ name: "Push Day", date: "2026-07-01", library_section_id: null });
        expect(result.success).toBe(true);
    });
});

describe("updateSectionSchema", () => {
    it("accepts an empty patch (all fields optional)", () => {
        const result = updateSectionSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it("accepts a partial patch of just archived", () => {
        const result = updateSectionSchema.safeParse({ archived: true });
        expect(result.success).toBe(true);
    });

    it("rejects a name exceeding max length", () => {
        const result = updateSectionSchema.safeParse({ name: "a".repeat(101) });
        expect(result.success).toBe(false);
    });
});
