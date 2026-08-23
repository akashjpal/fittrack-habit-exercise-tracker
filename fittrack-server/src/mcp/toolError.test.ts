import { describe, it, expect } from "vitest";
import { toToolError } from "./toolError";
import { AppError } from "../utils/errors";

describe("toToolError", () => {
    it("formats an AppError as `[CODE] message`", () => {
        const result = toToolError(AppError.notFound("no such section"));
        expect(result.isError).toBe(true);
        expect(result.content).toEqual([{ type: "text", text: "[NOT_FOUND] no such section" }]);
    });

    it("formats a plain Error using its message", () => {
        const result = toToolError(new Error("boom"));
        expect(result.content).toEqual([{ type: "text", text: "boom" }]);
    });

    it("stringifies non-Error throwables", () => {
        const result = toToolError("plain string failure");
        expect(result.content).toEqual([{ type: "text", text: "plain string failure" }]);
    });
});
