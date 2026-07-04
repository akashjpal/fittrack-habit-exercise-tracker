import { describe, it, expect, vi } from "vitest";
import { caseTransformMiddleware } from "./caseTransform.middleware";
import type { Request, Response, NextFunction } from "express";

function makeReq(body?: unknown): Request {
    return { body } as unknown as Request;
}

function makeRes(): Response & { json: ReturnType<typeof vi.fn> } {
    const res: any = {};
    res.json = vi.fn().mockImplementation(() => res);
    return res;
}

describe("caseTransformMiddleware", () => {
    it("converts incoming camelCase body keys to snake_case", () => {
        const req = makeReq({ sectionId: "abc", exerciseType: "Squat", isLibrary: true });
        const res = makeRes();
        const next = vi.fn();

        caseTransformMiddleware(req, res, next as NextFunction);

        expect(req.body).toEqual({ section_id: "abc", exercise_type: "Squat", is_library: true });
        expect(next).toHaveBeenCalledOnce();
    });

    it("recurses into nested objects and arrays", () => {
        const req = makeReq({
            workoutList: [{ exerciseType: "Row", subInfo: { targetSets: 3 } }],
        });
        const res = makeRes();
        caseTransformMiddleware(req, res, vi.fn() as unknown as NextFunction);

        expect(req.body).toEqual({
            workout_list: [{ exercise_type: "Row", sub_info: { target_sets: 3 } }],
        });
    });

    it("leaves non-object bodies untouched", () => {
        const req = makeReq(undefined);
        const res = makeRes();
        const next = vi.fn();
        caseTransformMiddleware(req, res, next as NextFunction);
        expect(req.body).toBeUndefined();
        expect(next).toHaveBeenCalledOnce();
    });

    it("wraps res.json to convert outgoing snake_case keys to camelCase", () => {
        const req = makeReq({});
        const res = makeRes();
        const originalJsonSpy = res.json; // reference before middleware replaces res.json
        caseTransformMiddleware(req, res, vi.fn() as unknown as NextFunction);

        res.json({ section_id: "abc", exercise_type: "Squat", nested: { target_sets: 5 } });

        expect(originalJsonSpy).toHaveBeenCalledWith({
            sectionId: "abc",
            exerciseType: "Squat",
            nested: { targetSets: 5 },
        });
    });

    it("passes arrays returned from res.json through camelCase conversion element-wise", () => {
        const req = makeReq({});
        const res = makeRes();
        const originalJsonSpy = res.json;
        caseTransformMiddleware(req, res, vi.fn() as unknown as NextFunction);

        res.json([{ habit_id: "1" }, { habit_id: "2" }]);

        expect(originalJsonSpy).toHaveBeenCalledWith([{ habitId: "1" }, { habitId: "2" }]);
    });

    it("passes primitive/non-object res.json payloads through unchanged", () => {
        const req = makeReq({});
        const res = makeRes();
        const originalJsonSpy = res.json;
        caseTransformMiddleware(req, res, vi.fn() as unknown as NextFunction);

        res.json(null);
        expect(originalJsonSpy).toHaveBeenCalledWith(null);
    });
});
