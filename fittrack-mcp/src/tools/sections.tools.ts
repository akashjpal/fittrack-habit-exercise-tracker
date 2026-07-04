import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sectionsApi } from "../api/sections.client.js";
import { toToolError } from "../utils/errors.js";
import {
    createSectionShape,
    createLibrarySectionShape,
    updateSectionShape,
    idShape,
    weekRangeShape,
    libraryIdShape,
} from "../schemas/section.schema.js";

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerSectionTools(server: McpServer) {
    server.registerTool(
        "list_sections",
        { title: "List sections", description: "List all non-archived, non-library exercise sections for the current user." },
        async () => {
            try {
                return json(await sectionsApi.list());
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "get_section",
        { title: "Get section", description: "Get a single exercise section by id.", inputSchema: idShape },
        async ({ id }) => {
            try {
                return json(await sectionsApi.getById(id));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "list_sections_by_week",
        {
            title: "List sections by week",
            description: "List exercise sections whose date falls within the given range.",
            inputSchema: weekRangeShape,
        },
        async ({ startDate, endDate }) => {
            try {
                return json(await sectionsApi.listByWeek(startDate, endDate));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "list_library_sections",
        { title: "List library sections", description: "List all reusable section templates (isLibrary: true)." },
        async () => {
            try {
                return json(await sectionsApi.listLibrary());
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "list_active_library_sections",
        {
            title: "List active library sections",
            description: "List non-archived reusable section templates.",
        },
        async () => {
            try {
                return json(await sectionsApi.listActiveLibrary());
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "list_sections_by_library_id",
        {
            title: "List sections by library template",
            description: "List section instances created from a given library template.",
            inputSchema: libraryIdShape,
        },
        async ({ libraryId }) => {
            try {
                return json(await sectionsApi.listByLibraryId(libraryId));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "create_section",
        {
            title: "Create section",
            description:
                "Create a new exercise section for a given date. Use this to find/create today's section before logging a workout with log_workout.",
            inputSchema: createSectionShape,
        },
        async (args) => {
            try {
                return json(await sectionsApi.create(args));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "create_library_section",
        {
            title: "Create library section template",
            description: "Create a reusable section template (e.g. 'Push Day') that instances can reference later.",
            inputSchema: createLibrarySectionShape,
        },
        async ({ name }) => {
            try {
                return json(await sectionsApi.createLibrary(name));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "update_section",
        {
            title: "Update section",
            description: "Partially update a section's name, target sets, or archived state.",
            inputSchema: updateSectionShape,
        },
        async ({ id, ...body }) => {
            try {
                return json(await sectionsApi.update(id, body));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "delete_section",
        {
            title: "Delete section",
            description: "Delete a section by id. Note: the server does not check ownership, so any valid id works.",
            inputSchema: idShape,
        },
        async ({ id }) => {
            try {
                await sectionsApi.remove(id);
                return json({ deleted: true, id });
            } catch (err) {
                return toToolError(err);
            }
        },
    );
}
