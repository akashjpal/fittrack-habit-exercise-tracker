import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSectionTools } from "./sections.tools.js";
import { registerWorkoutTools } from "./workouts.tools.js";
import { registerHabitTools } from "./habits.tools.js";
import { registerAnalyticsTools } from "./analytics.tools.js";

export function registerAllTools(server: McpServer) {
    registerSectionTools(server);
    registerWorkoutTools(server);
    registerHabitTools(server);
    registerAnalyticsTools(server);
}
