import { describe, it, expect } from "vitest";
import { AppError } from "./errors";

describe("AppError", () => {
    it("badRequest produces a 400 with BAD_REQUEST code", () => {
        const err = AppError.badRequest("nope");
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe("BAD_REQUEST");
        expect(err.message).toBe("nope");
        expect(err).toBeInstanceOf(Error);
    });

    it("unauthorized defaults message when none given", () => {
        const err = AppError.unauthorized();
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe("UNAUTHORIZED");
        expect(err.message).toBe("Unauthorized");
    });

    it("forbidden defaults message when none given", () => {
        const err = AppError.forbidden();
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe("FORBIDDEN");
    });

    it("notFound defaults message when none given", () => {
        const err = AppError.notFound();
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe("NOT_FOUND");
    });

    it("internal defaults message when none given", () => {
        const err = AppError.internal();
        expect(err.statusCode).toBe(500);
        expect(err.code).toBe("INTERNAL_ERROR");
    });

    it("sets name to AppError so it is identifiable in logs", () => {
        const err = AppError.badRequest("x");
        expect(err.name).toBe("AppError");
    });
});
