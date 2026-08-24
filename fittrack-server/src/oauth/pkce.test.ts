import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { verifyCodeChallenge } from "./pkce";

describe("verifyCodeChallenge", () => {
    it("accepts a correct S256 verifier/challenge pair", () => {
        const verifier = "test-verifier-12345678901234567890123456789012345";
        const challenge = createHash("sha256").update(verifier).digest("base64url");

        expect(verifyCodeChallenge(verifier, challenge, "S256")).toBe(true);
    });

    it("rejects a mismatched verifier", () => {
        const challenge = createHash("sha256").update("real-verifier").digest("base64url");

        expect(verifyCodeChallenge("wrong-verifier", challenge, "S256")).toBe(false);
    });

    it("rejects a non-S256 method", () => {
        const verifier = "some-verifier";
        const challenge = createHash("sha256").update(verifier).digest("base64url");

        expect(verifyCodeChallenge(verifier, challenge, "plain")).toBe(false);
    });

    it("rejects an empty verifier", () => {
        expect(verifyCodeChallenge("", "anything", "S256")).toBe(false);
    });
});
