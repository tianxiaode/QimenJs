import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerFileTools } from './tools/file-tools';
import { registerSymbolTools } from './tools/symbol-tools';
import { registerGraphTools } from './tools/graph-tools';

/**
 * QimenJs src MCP server (stdio transport).
 *
 * Exposes the project's `src/` code with filesystem tools and a TypeScript
 * LanguageService for semantic / call-graph analysis. Designed to be spawned
 * directly by an MCP client (Trae / Claude Desktop / Cursor) via stdio.
 *
 * Run: `npm run mcp` (ts-node, --transpile-only, uses mcp-server/tsconfig.json)
 */

const server = new McpServer({
    name: 'qimen-src',
    version: '0.1.0',
});

registerFileTools(server);
registerSymbolTools(server);
registerGraphTools(server);

const transport = new StdioServerTransport();

// stdio transport MUST own stdout; route any stray logs to stderr. Wrap the
// async connect in an IIFE because top-level await is not allowed under
// CommonJS (the mcp-server tsconfig emits CJS for SDK require() compatibility).
void (async () => {
    try {
        await server.connect(transport);
    } catch (e) {
        process.stderr.write(`MCP server failed to start: ${e instanceof Error ? e.message : String(e)}\n`);
        process.exit(1);
    }
})();
