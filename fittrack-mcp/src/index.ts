import "./config/env.js"; // fail fast on missing env vars before anything else runs
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";
import { logger } from "./utils/logger.js";

async function main() {
    const server = new McpServer(
        { name: "fittrack-mcp", version: "1.0.0" },
        { capabilities: { tools: {} } },
    );

    registerAllTools(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info("fittrack-mcp server connected over stdio", "startup");
}

main().catch((err) => {
    logger.error(`Fatal startup error: ${err instanceof Error ? err.message : String(err)}`, "startup");
    process.exit(1);
});
