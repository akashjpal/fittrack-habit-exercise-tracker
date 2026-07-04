import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { analyticsApi } from "../api/analytics.client.js";
import { toToolError } from "../utils/errors.js";

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerAnalyticsTools(server: McpServer) {
    server.registerTool(
        "get_dashboard",
        {
            title: "Get dashboard summary",
            description:
                "Get the current habit streak, total completed/target sets, and per-section progress summary.",
        },
        async () => {
            try {
                return json(await analyticsApi.getDashboard());
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
                return json(await analyticsApi.getProgress());
            } catch (err) {
                return toToolError(err);
            }
        },
    );
}
