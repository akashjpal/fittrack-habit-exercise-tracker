import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SectionService } from "../services/section.service";
import type { WorkoutService } from "../services/workout.service";
import type { HabitService } from "../services/habit.service";
import type { AnalyticsService } from "../services/analytics.service";
import { registerAllTools } from "./tools/index";

export interface McpContext {
    userId: string;
    userEmail: string;
}

export interface McpServices {
    section: SectionService;
    workout: WorkoutService;
    habit: HabitService;
    analytics: AnalyticsService;
}

export function createMcpServer(ctx: McpContext, services: McpServices): McpServer {
    const server = new McpServer(
        { name: "fittrack-mcp", version: "1.0.0" },
        { capabilities: { tools: {} } },
    );

    registerAllTools(server, ctx, services);

    return server;
}
