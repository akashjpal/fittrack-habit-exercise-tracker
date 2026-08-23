import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpContext, McpServices } from "../server";
import { registerSectionTools } from "./sections.tools";
import { registerWorkoutTools } from "./workouts.tools";
import { registerHabitTools } from "./habits.tools";
import { registerAnalyticsTools } from "./analytics.tools";

export function registerAllTools(server: McpServer, ctx: McpContext, services: McpServices) {
    registerSectionTools(server, ctx, services);
    registerWorkoutTools(server, ctx, services);
    registerHabitTools(server, ctx, services);
    registerAnalyticsTools(server, ctx, services);
}
