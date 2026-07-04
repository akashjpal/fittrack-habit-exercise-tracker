import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { workoutsApi } from "../api/workouts.client.js";
import { toToolError } from "../utils/errors.js";
import {
    createWorkoutShape,
    createWorkoutBatchShape,
    setWorkoutStatusShape,
    idShape,
    sectionIdShape,
    weekRangeShape,
} from "../schemas/workout.schema.js";

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerWorkoutTools(server: McpServer) {
    server.registerTool(
        "list_workouts",
        { title: "List workouts", description: "List all workouts for the current user." },
        async () => {
            try {
                return json(await workoutsApi.list());
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
                return json(await workoutsApi.listByWeek(startDate, endDate));
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
                return json(await workoutsApi.listBySection(sectionId));
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
                return json(await workoutsApi.create(args));
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
                return json(await workoutsApi.createBatch(sectionId, workouts));
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
                return json(await workoutsApi.setStatus(id, completed));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "delete_workout",
        { title: "Delete workout", description: "Delete a workout by id.", inputSchema: idShape },
        async ({ id }) => {
            try {
                await workoutsApi.remove(id);
                return json({ deleted: true, id });
            } catch (err) {
                return toToolError(err);
            }
        },
    );
}
