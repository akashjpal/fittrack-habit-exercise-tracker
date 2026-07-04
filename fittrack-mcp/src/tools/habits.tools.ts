import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { habitsApi, completionsApi } from "../api/habits.client.js";
import { toToolError } from "../utils/errors.js";
import { createHabitShape, idShape, habitIdShape, completeHabitShape, deleteCompletionShape } from "../schemas/habit.schema.js";

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function today(): string {
    return new Date().toISOString().split("T")[0];
}

export function registerHabitTools(server: McpServer) {
    server.registerTool("list_habits", { title: "List habits", description: "List all habits for the current user." }, async () => {
        try {
            return json(await habitsApi.list());
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
                return json(await habitsApi.create(args));
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
                await habitsApi.remove(id);
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
                return json(await completionsApi.list());
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
                return json(await completionsApi.listByHabit(habitId));
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
                const existing = await completionsApi.listByHabit(habitId);
                const alreadyDone = existing.some((c) => c.date.split("T")[0] === targetDate);
                if (alreadyDone) {
                    return json({ created: false, message: `Already marked complete for ${targetDate}` });
                }
                const completion = await completionsApi.create({ habitId, date: targetDate });
                return json({ created: true, completion });
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
                await completionsApi.remove(habitId, date);
                return json({ deleted: true, habitId, date });
            } catch (err) {
                return toToolError(err);
            }
        },
    );
}
