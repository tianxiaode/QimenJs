// Bootstrap loader for the qimen-src MCP server.
//
// Why this exists: when an MCP client (Trae / Claude Desktop) spawns the
// server, ts-node must compile `src/index.ts` with `mcp-server/tsconfig.json`
// (module: "commonjs"). If ts-node picks up the workspace ROOT tsconfig
// (module: "ESNext") instead, the server breaks because `require()` of the
// ESM-style output fails. ts-node's default tsconfig discovery starts from the
// process cwd — which is NOT guaranteed for a client-spawned server.
//
// This bootstrap fixes TS_NODE_PROJECT to an absolute path derived from its own
// location BEFORE loading ts-node, making startup fully cwd-independent and
// independent of any ${workspaceFolder} env expansion quirks.
'use strict';

const path = require('path');

process.env.TS_NODE_PROJECT = path.join(__dirname, 'tsconfig.json');
require('ts-node/register/transpile-only');
require('./src/index.ts');
