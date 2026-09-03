import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpContext, McpServices } from "../server";
import { toToolError } from "../toolError";
import { deepCamelToSnake, deepSnakeToCamel } from "../caseTransform";
import { createSectionSchema, updateSectionSchema } from "../../shared/index";
import {
    createSectionShape,
    createLibrarySectionShape,
    updateSectionShape,
    idShape,
    weekRangeShape,
    libraryIdShape,
} from "../schemas/section.schema";

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerSectionTools(server: McpServer, ctx: McpContext, services: McpServices) {
    server.registerTool(
        "list_sections",
        { title: "List sections", description: "List all non-archived, non-library exercise sections for the current user." },
        async () => {
            try {
                return json(deepSnakeToCamel(await services.section.getAllSections(ctx.userId)));
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
                return json(deepSnakeToCamel(await services.section.getSectionById(id)));
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
                return json(deepSnakeToCamel(await services.section.getSectionsByWeek(ctx.userId, startDate, endDate)));
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
                return json(deepSnakeToCamel(await services.section.getLibrary(ctx.userId)));
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
                return json(deepSnakeToCamel(await services.section.getActiveLibrary(ctx.userId)));
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
                return json(deepSnakeToCamel(await services.section.getSectionsByLibraryId(libraryId)));
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
                const dto = createSectionSchema.parse(deepCamelToSnake(args));
                return json(deepSnakeToCamel(await services.section.createSection(ctx.userId, dto)));
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
                return json(deepSnakeToCamel(await services.section.createLibrarySection(ctx.userId, name)));
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
                const dto = updateSectionSchema.parse(deepCamelToSnake(body));
                return json(deepSnakeToCamel(await services.section.updateSection(id, ctx.userId, dto)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "delete_section",
        {
            title: "Delete section",
            description: "Delete a section by id. Only sections owned by the current user can be deleted.",
            inputSchema: idShape,
        },
        async ({ id }) => {
            try {
                await services.section.deleteSection(id, ctx.userId);
                return json({ deleted: true, id });
            } catch (err) {
                return toToolError(err);
            }
        },
    );
}
