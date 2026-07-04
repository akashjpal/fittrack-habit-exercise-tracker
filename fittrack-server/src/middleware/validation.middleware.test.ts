import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validateBody } from "./validation.middleware";
import { AppError } from "../utils/errors";
import type { Request, Response, NextFunction } from "express";

const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().nonnegative(),
});

describe("validateBody", () => {
    it("calls next() with no error and assigns parsed data on success", () => {
        const req = { body: { name: "Alice", age: 30 } } as unknown as Request;
        const next = vi.fn();

        validateBody(schema)(req, {} as Response, next as NextFunction);

        expect(next).toHaveBeenCalledWith();
        expect(req.body).toEqual({ name: "Alice", age: 30 });
    });

    it("strips unknown behavior aside: applies defaults declared in the schema", () => {
        const withDefault = z.object({ unit: z.string().default("kg") });
        const req = { body: {} } as unknown as Request;
        const next = vi.fn();

        validateBody(withDefault)(req, {} as Response, next as NextFunction);

        expect(req.body).toEqual({ unit: "kg" });
    });

    it("calls next(AppError.badRequest) with a joined message on validation failure", () => {
        const req = { body: { name: "", age: -1 } } as unknown as Request;
        const next = vi.fn();

        validateBody(schema)(req, {} as Response, next as NextFunction);

        expect(next).toHaveBeenCalledTimes(1);
        const err = next.mock.calls[0][0];
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain("name");
        expect(err.message).toContain("age");
    });

    it("does not mutate req.body when validation fails", () => {
        const original = { name: "" };
        const req = { body: original } as unknown as Request;
        validateBody(schema)(req, {} as Response, vi.fn() as unknown as NextFunction);
        expect(req.body).toBe(original);
    });
});
