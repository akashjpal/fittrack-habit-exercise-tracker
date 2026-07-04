import { describe, it, expect, afterEach } from "vitest";
import { setAccessToken, getStoredAccessToken } from "./tokenStore";

describe("tokenStore", () => {
    afterEach(() => {
        setAccessToken(null);
    });

    it("returns null before any token is set", () => {
        expect(getStoredAccessToken()).toBeNull();
    });

    it("returns whatever token was last set", () => {
        setAccessToken("abc123");
        expect(getStoredAccessToken()).toBe("abc123");
    });

    it("allows clearing the token by setting null", () => {
        setAccessToken("abc123");
        setAccessToken(null);
        expect(getStoredAccessToken()).toBeNull();
    });

    it("persists across separate calls without re-importing (module-level singleton)", () => {
        setAccessToken("token-1");
        expect(getStoredAccessToken()).toBe("token-1");
        setAccessToken("token-2");
        expect(getStoredAccessToken()).toBe("token-2");
    });
});
