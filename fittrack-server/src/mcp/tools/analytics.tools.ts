import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpContext, McpServices } from "../server";
import { toToolError } from "../toolError";
import { deepSnakeToCamel } from "../caseTransform";

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerAnalyticsTools(server: McpServer, ctx: McpContext, services: McpServices) {
    server.registerTool(
        "get_dashboard",
        {
            title: "Get dashboard summary",
            description:
                "Get the current habit streak, total completed/target sets, and per-section progress summary.",
        },
        async () => {
            try {
                return json(deepSnakeToCamel(await services.analytics.getDashboard(ctx.userId)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );

    server.registerTool(
        "get_progress",
        {
            title: "Get workout volume progress",
            description: "Get weekly workout volume (total sets, broken down by exercise type) for the last 4 weeks.",
        },
        async () => {
            try {
                return json(deepSnakeToCamel(await services.analytics.getProgress(ctx.userId)));
            } catch (err) {
                return toToolError(err);
            }
        },
    );
}
