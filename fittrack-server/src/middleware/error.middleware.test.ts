import { describe, it, expect, vi } from "vitest";
import { errorMiddleware } from "./error.middleware";
import { AppError } from "../utils/errors";
import type { Request, Response, NextFunction } from "express";

function makeRes() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe("errorMiddleware", () => {
    it("responds with the AppError's own status code and code for known errors", () => {
        const res = makeRes();
        const err = AppError.notFound("Habit not found");

        errorMiddleware(err, {} as Request, res, vi.fn() as unknown as NextFunction);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: { code: "NOT_FOUND", message: "Habit not found" },
        });
    });

    it("falls back to a 500 INTERNAL_ERROR for unrecognized errors", () => {
        const res = makeRes();
        const err = new Error("boom");

        errorMiddleware(err, {} as Request, res, vi.fn() as unknown as NextFunction);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: { code: "INTERNAL_ERROR", message: "boom" },
        });
    });

    it("uses a generic message when an unrecognized error has no message", () => {
        const res = makeRes();
        const err = new Error();

        errorMiddleware(err, {} as Request, res, vi.fn() as unknown as NextFunction);

        expect(res.json).toHaveBeenCalledWith({
            error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
        });
    });
});
