import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpContext, McpServices } from "../server";
import { toToolError } from "../toolError";
import { deepCamelToSnake, deepSnakeToCamel } from "../caseTransform";
import { createWorkoutSchema, batchCreateWorkoutSchema } from "../../shared/index";
import {
    createWorkoutShape,
    createWorkoutBatchShape,
    setWorkoutStatusShape,
    idShape,
    sectionIdShape,
    weekRangeShape,
} from "../schemas/workout.schema";

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerWorkoutTools(server: McpServer, ctx: McpContext, services: McpServices) {
    server.registerTool(
        "list_workouts",
        { title: "List workouts", description: "List all workouts for the current user." },
        async () => {
            try {
                return json(deepSnakeToCamel(await services.workout.getAllWorkouts(ctx.userId)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "list_workouts_by_week",
        {
            title: "List workouts by week",
            description: "List workouts whose date falls within the given range.",
            inputSchema: weekRangeShape,
        },
        async ({ startDate, endDate }) => {
            try {
                return json(deepSnakeToCamel(await services.workout.getWorkoutsByWeek(ctx.userId, startDate, endDate)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "list_workouts_by_section",
        {
            title: "List workouts by section",
            description: "List all workouts logged under a given section.",
            inputSchema: sectionIdShape,
        },
        async ({ sectionId }) => {
            try {
                return json(deepSnakeToCamel(await services.workout.getWorkoutsBySection(sectionId)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "log_workout",
        {
            title: "Log workout",
            description:
                "Log a single exercise (sets/reps/weight) under an existing section. Requires a valid sectionId — use list_sections or create_section first to get/create today's section.",
            inputSchema: createWorkoutShape,
        },
        async (args) => {
            try {
                const dto = createWorkoutSchema.parse(deepCamelToSnake(args));
                return json(deepSnakeToCamel(await services.workout.createWorkout(ctx.userId, dto)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "log_workout_batch",
        {
            title: "Log multiple workouts at once",
            description:
                "Log several exercises at once under one section (e.g. a full workout session). Note: all rows are timestamped now(), there is no per-item date override.",
            inputSchema: createWorkoutBatchShape,
        },
        async ({ sectionId, workouts }) => {
            try {
                const dto = batchCreateWorkoutSchema.parse(deepCamelToSnake({ sectionId, workouts }));
                return json(
                    deepSnakeToCamel(await services.workout.createBatchWorkouts(ctx.userId, dto.section_id, dto.workouts)),
                );
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "set_workout_status",
        {
            title: "Set workout completed status",
            description: "Mark a workout as completed or not completed.",
            inputSchema: setWorkoutStatusShape,
        },
        async ({ id, completed }) => {
            try {
                return json(deepSnakeToCamel(await services.workout.toggleWorkoutStatus(id, ctx.userId, completed)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "delete_workout",
        { title: "Delete workout", description: "Delete a workout by id. Only workouts owned by the current user can be deleted.", inputSchema: idShape },
        async ({ id }) => {
            try {
                await services.workout.deleteWorkout(id, ctx.userId);
                return json({ deleted: true, id });
            } catch (err) {
                return toToolError(err);
            }
        },
    );
}
