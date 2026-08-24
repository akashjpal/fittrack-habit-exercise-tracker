import { createHash } from "node:crypto";

export function verifyCodeChallenge(verifier: string, challenge: string, method: string): boolean {
    if (method !== "S256") return false;
    if (!verifier) return false;
    const hash = createHash("sha256").update(verifier).digest("base64url");
    return hash === challenge;
}
