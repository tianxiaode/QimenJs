import fs from 'fs';
import path from 'path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSrcRoot, getWorkspaceRoot, resolveWorkspacePath } from '../project/project-context';
import { walkFiles } from '../utils/fs-utils';
import { error, json } from '../utils/mcp-result';

const UTILS_DIR = path.join(getSrcRoot(), 'utils');

interface UtilExport {
    file: string;
    name: string;
    kind: string;
}

function extractExports(absPath: string): UtilExport[] {
    const content = fs.readFileSync(absPath, 'utf8');
    const exports: UtilExport[] = [];
    const rel = path.relative(getWorkspaceRoot(), absPath).replace(/\\/g, '/');

    const patterns: Array<{ regex: RegExp; kind: string }> = [
        { regex: /export\s+function\s+(\w+)/g, kind: 'function' },
        { regex: /export\s+async\s+function\s+(\w+)/g, kind: 'async function' },
        { regex: /export\s+const\s+(\w+)\s*=/g, kind: 'const' },
        { regex: /export\s+class\s+(\w+)/g, kind: 'class' },
        { regex: /export\s+interface\s+(\w+)/g, kind: 'interface' },
        { regex: /export\s+type\s+(\w+)\s*=/g, kind: 'type' },
        { regex: /export\s+enum\s+(\w+)/g, kind: 'enum' },
    ];

    for (const { regex, kind } of patterns) {
        let match: RegExpExecArray | null;
        const re = new RegExp(regex.source, regex.flags);
        while ((match = re.exec(content)) !== null) {
            exports.push({ file: rel, name: match[1], kind });
        }
    }

    return exports;
}

export function registerUtilsTools(server: McpServer): void {
    server.registerTool(
        'list_utils',
        {
            title: 'List utils exports',
            description:
                'List all exported functions/classes/types from src/utils/. ' +
                'Optionally filter by name pattern (substring match). ' +
                'Use this before writing any utility function to avoid duplicates.',
            inputSchema: {
                filter: z
                    .string()
                    .optional()
                    .describe('Optional name substring filter (case-insensitive).'),
            },
        },
        async ({ filter }) => {
            if (!fs.existsSync(UTILS_DIR)) {
                return error('src/utils/ directory not found');
            }
            const allExports: UtilExport[] = [];
            for (const file of walkFiles(UTILS_DIR, '.ts')) {
                try {
                    allExports.push(...extractExports(file));
                } catch {
                    continue;
                }
            }
            allExports.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name));

            if (filter && filter.length > 0) {
                const lower = filter.toLowerCase();
                const filtered = allExports.filter(e => e.name.toLowerCase().includes(lower));
                return json({ filter, count: filtered.length, exports: filtered });
            }
            return json({ count: allExports.length, exports: allExports });
        }
    );
}
