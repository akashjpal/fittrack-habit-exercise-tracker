import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSectionTools } from "./sections.tools";
import type { McpContext, McpServices } from "../server";

function makeServer() {
    return new McpServer({ name: "test", version: "0.0.0" }, { capabilities: { tools: {} } });
}

function getHandler(server: McpServer, name: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (server as any)._registeredTools[name].handler;
}

describe("section MCP tools", () => {
    const ctx: McpContext = { userId: "user-1", userEmail: "u@example.com" };
    let services: McpServices;

    beforeEach(() => {
        services = {
            section: {
                getAllSections: vi.fn(),
                getSectionById: vi.fn(),
                getSectionsByWeek: vi.fn(),
                getLibrary: vi.fn(),
                getActiveLibrary: vi.fn(),
                getSectionsByLibraryId: vi.fn(),
                createSection: vi.fn(),
                createLibrarySection: vi.fn(),
                updateSection: vi.fn(),
                deleteSection: vi.fn(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            workout: {} as never,
            habit: {} as never,
            analytics: {} as never,
        };
    });

    it("list_sections calls the service with the authenticated userId and returns camelCase JSON", async () => {
        const server = makeServer();
        (services.section.getAllSections as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "s1", user_id: "user-1", name: "Push Day", target_sets: 10, is_library: false },
        ]);
        registerSectionTools(server, ctx, services);

        const result = await getHandler(server, "list_sections")({});

        expect(services.section.getAllSections).toHaveBeenCalledWith("user-1");
        const payload = JSON.parse(result.content[0].text);
        expect(payload).toEqual([{ id: "s1", userId: "user-1", name: "Push Day", targetSets: 10, isLibrary: false }]);
    });

    it("create_section converts camelCase args to a snake_case DTO with schema defaults applied", async () => {
        const server = makeServer();
        (services.section.createSection as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "s2",
            name: "Leg Day",
            target_sets: 10,
            date: "2026-08-23",
            is_library: false,
        });
        registerSectionTools(server, ctx, services);

        const result = await getHandler(server, "create_section")({ name: "Leg Day", date: "2026-08-23" });

        expect(services.section.createSection).toHaveBeenCalledWith("user-1", {
            name: "Leg Day",
            target_sets: 10,
            date: "2026-08-23",
            is_library: false,
        });
        const payload = JSON.parse(result.content[0].text);
        expect(payload).toEqual({ id: "s2", name: "Leg Day", targetSets: 10, date: "2026-08-23", isLibrary: false });
    });

    it("delete_section reports a tool error instead of throwing when the service rejects", async () => {
        const server = makeServer();
        const { AppError } = await import("../../utils/errors");
        (services.section.deleteSection as ReturnType<typeof vi.fn>).mockRejectedValue(AppError.notFound("no such section"));
        registerSectionTools(server, ctx, services);

        const result = await getHandler(server, "delete_section")({ id: "00000000-0000-0000-0000-000000000000" });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe("[NOT_FOUND] no such section");
    });
});
