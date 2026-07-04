import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api, createQueryFn, apiRequest } from "./api";
import { setAccessToken } from "./tokenStore";

function jsonResponse(status: number, body: unknown) {
    return {
        status,
        ok: status >= 200 && status < 300,
        statusText: `Status ${status}`,
        headers: { get: () => "application/json" },
        json: async () => body,
        text: async () => JSON.stringify(body),
    } as unknown as Response;
}

function textResponse(status: number, body: string) {
    return {
        status,
        ok: status >= 200 && status < 300,
        statusText: `Status ${status}`,
        headers: { get: () => "text/plain" },
        json: async () => { throw new Error("not json"); },
        text: async () => body,
    } as unknown as Response;
}

describe("api client", () => {
    let fetchMock: ReturnType<typeof vi.fn>;
    let dispatchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        dispatchSpy = vi.spyOn(window, "dispatchEvent");
    });

    afterEach(() => {
        setAccessToken(null);
        vi.unstubAllGlobals();
        dispatchSpy.mockRestore();
    });

    describe("api.get/post/patch/delete", () => {
        it("does not send an Authorization header when no token is stored", async () => {
            fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

            await api.get("/api/sections");

            const [, init] = fetchMock.mock.calls[0];
            expect(init.headers.Authorization).toBeUndefined();
        });

        it("sends a Bearer Authorization header once a token is stored", async () => {
            setAccessToken("tok-123");
            fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

            await api.get("/api/sections");

            const [, init] = fetchMock.mock.calls[0];
            expect(init.headers.Authorization).toBe("Bearer tok-123");
        });

        it("GET request hits the requested path and returns parsed JSON", async () => {
            fetchMock.mockResolvedValue(jsonResponse(200, { id: "s1" }));

            const result = await api.get<{ id: string }>("/api/sections/s1");

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toContain("/api/sections/s1");
            expect(init.method).toBe("GET");
            expect(result).toEqual({ id: "s1" });
        });

        it("POST serializes the body as JSON and sets Content-Type", async () => {
            fetchMock.mockResolvedValue(jsonResponse(201, { id: "w1" }));

            await api.post("/api/workouts", { sets: 3 });

            const [, init] = fetchMock.mock.calls[0];
            expect(init.method).toBe("POST");
            expect(init.headers["Content-Type"]).toBe("application/json");
            expect(init.body).toBe(JSON.stringify({ sets: 3 }));
        });

        it("PATCH and DELETE use the correct HTTP method", async () => {
            fetchMock.mockResolvedValue(jsonResponse(200, {}));
            await api.patch("/api/workouts/w1", { completed: true });
            expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");

            fetchMock.mockResolvedValue(jsonResponse(204, undefined));
            await api.delete("/api/workouts/w1");
            expect(fetchMock.mock.calls[1][1].method).toBe("DELETE");
        });

        it("returns undefined for non-JSON responses instead of throwing", async () => {
            fetchMock.mockResolvedValue(textResponse(204, ""));
            const result = await api.get("/api/health");
            expect(result).toBeUndefined();
        });

        it("dispatches an 'unauthorized' event and throws on 401", async () => {
            fetchMock.mockResolvedValue(jsonResponse(401, { error: "nope" }));

            await expect(api.get("/api/sections")).rejects.toThrow("Unauthorized");
            expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "unauthorized" }));
        });

        it("throws an error containing the status and body text on other failures", async () => {
            fetchMock.mockResolvedValue(textResponse(500, "boom"));
            await expect(api.get("/api/sections")).rejects.toThrow("500: boom");
        });
    });

    describe("api.upload", () => {
        it("sends FormData without a Content-Type header but with auth", async () => {
            setAccessToken("tok-456");
            fetchMock.mockResolvedValue(jsonResponse(200, { workouts: [] }));
            const form = new FormData();
            form.append("audio", new Blob(["x"]));

            await api.upload("/api/ai/voice-log", form);

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toContain("/api/ai/voice-log");
            expect(init.method).toBe("POST");
            expect(init.headers["Content-Type"]).toBeUndefined();
            expect(init.headers.Authorization).toBe("Bearer tok-456");
            expect(init.body).toBe(form);
        });

        it("dispatches 'unauthorized' and throws on a 401 upload response", async () => {
            fetchMock.mockResolvedValue(jsonResponse(401, {}));
            await expect(api.upload("/api/ai/voice-log", new FormData())).rejects.toThrow("Unauthorized");
            expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "unauthorized" }));
        });
    });

    describe("createQueryFn", () => {
        it("joins the queryKey array into a path and GETs it", async () => {
            fetchMock.mockResolvedValue(jsonResponse(200, [{ id: "1" }]));
            const queryFn = createQueryFn("throw");

            const result = await queryFn({ queryKey: ["/api", "sections"] } as any);

            expect(fetchMock.mock.calls[0][0]).toContain("/api/sections");
            expect(result).toEqual([{ id: "1" }]);
        });

        it("throws on 401 when configured with 'throw'", async () => {
            fetchMock.mockResolvedValue(jsonResponse(401, {}));
            const queryFn = createQueryFn("throw");
            await expect(queryFn({ queryKey: ["/api", "sections"] } as any)).rejects.toThrow();
        });

        it("returns null on 401 when configured with 'returnNull'", async () => {
            fetchMock.mockResolvedValue(jsonResponse(401, {}));
            const queryFn = createQueryFn("returnNull");
            const result = await queryFn({ queryKey: ["/api", "sections"] } as any);
            expect(result).toBeNull();
        });
    });

    describe("apiRequest", () => {
        it("prefixes relative paths with the API base and returns the raw Response", async () => {
            fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
            const res = await apiRequest("GET", "/api/sections");
            expect(fetchMock.mock.calls[0][0]).toContain("/api/sections");
            expect(await res.json()).toEqual({ ok: true });
        });

        it("uses an absolute URL as-is without prefixing", async () => {
            fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
            await apiRequest("GET", "https://tasks.googleapis.com/tasks/v1/users/@me/lists");
            expect(fetchMock.mock.calls[0][0]).toBe("https://tasks.googleapis.com/tasks/v1/users/@me/lists");
        });

        it("dispatches 'unauthorized' on 401 and still throws since the response is not ok", async () => {
            fetchMock.mockResolvedValue(textResponse(401, "expired"));
            await expect(apiRequest("GET", "/api/sections")).rejects.toThrow("401: expired");
            expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "unauthorized" }));
        });
    });
});
