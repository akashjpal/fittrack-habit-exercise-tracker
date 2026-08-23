import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpContext, McpServices } from "../server";
import { toToolError } from "../toolError";
import { deepCamelToSnake, deepSnakeToCamel } from "../caseTransform";
import { createHabitSchema, createCompletionSchema } from "../../shared/index";
import { createHabitShape, idShape, habitIdShape, completeHabitShape, deleteCompletionShape } from "../schemas/habit.schema";

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function today(): string {
    return new Date().toISOString().split("T")[0];
}

export function registerHabitTools(server: McpServer, ctx: McpContext, services: McpServices) {
    server.registerTool("list_habits", { title: "List habits", description: "List all habits for the current user." }, async () => {
        try {
            return json(deepSnakeToCamel(await services.habit.getAllHabits(ctx.userId)));
        } catch (err) {
            return toToolError(err);
        }
    });

    server.registerTool(
        "create_habit",
        {
            title: "Create habit",
            description: "Create a new habit to track, with a daily or weekly frequency.",
            inputSchema: createHabitShape,
        },
        async (args) => {
            try {
                const dto = createHabitSchema.parse(deepCamelToSnake(args));
                return json(deepSnakeToCamel(await services.habit.createHabit(ctx.userId, dto)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "delete_habit",
        { title: "Delete habit", description: "Delete a habit by id.", inputSchema: idShape },
        async ({ id }) => {
            try {
                await services.habit.deleteHabit(id);
                return json({ deleted: true, id });
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "list_completions",
        { title: "List all habit completions", description: "List every habit completion record for the current user." },
        async () => {
            try {
                return json(deepSnakeToCamel(await services.habit.getAllCompletions(ctx.userId)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "list_completions_by_habit",
        {
            title: "List completions for a habit",
            description: "List completion records for a single habit.",
            inputSchema: habitIdShape,
        },
        async ({ habitId }) => {
            try {
                return json(deepSnakeToCamel(await services.habit.getCompletionsByHabit(habitId)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "complete_habit",
        {
            title: "Mark habit complete",
            description:
                "Mark a habit as completed for a given date (defaults to today). Checks existing completions first and will not create a duplicate if already marked complete for that date.",
            inputSchema: completeHabitShape,
        },
        async ({ habitId, date }) => {
            try {
                const targetDate = date ?? today();
                const existing = await services.habit.getCompletionsByHabit(habitId);
                const alreadyDone = existing.some((c) => c.date.split("T")[0] === targetDate);
                if (alreadyDone) {
                    return json({ created: false, message: `Already marked complete for ${targetDate}` });
                }
                const dto = createCompletionSchema.parse(deepCamelToSnake({ habitId, date: targetDate }));
                const completion = await services.habit.createCompletion(ctx.userId, dto);
                return json({ created: true, completion: deepSnakeToCamel(completion) });
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "delete_completion",
        {
            title: "Delete habit completion",
            description: "Remove a completion record for a habit on a specific date. The date must exactly match the stored value.",
            inputSchema: deleteCompletionShape,
        },
        async ({ habitId, date }) => {
            try {
                await services.habit.deleteCompletion(habitId, date);
                return json({ deleted: true, habitId, date });
            } catch (err) {
                return toToolError(err);
            }
        },
    );
}
