import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
    it("joins simple class name strings", () => {
        expect(cn("a", "b")).toBe("a b");
    });

    it("drops falsy values", () => {
        expect(cn("a", false && "b", null, undefined, "", "c")).toBe("a c");
    });

    it("merges conflicting tailwind utility classes, keeping the last one", () => {
        expect(cn("p-2", "p-4")).toBe("p-4");
    });

    it("merges conditional object syntax from clsx", () => {
        expect(cn("base", { active: true, hidden: false })).toBe("base active");
    });

    it("resolves conflicts across array and string arguments together", () => {
        expect(cn(["text-sm", "text-lg"], "font-bold")).toBe("text-lg font-bold");
    });
});
