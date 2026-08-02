import fs from 'fs';
import path from 'path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSrcRoot, getWorkspaceRoot, resolveWorkspacePath } from '../project/project-context';
import { countFilesPerTopDir, listFiles, readFileLines, walkFiles } from '../utils/fs-utils';
import { error, json, text } from '../utils/mcp-result';

/**
 * Register filesystem-level tools that do not require the TypeScript
 * LanguageService. These are pure Node `fs` operations scoped to the workspace.
 */
export function registerFileTools(server: McpServer): void {
    // list_modules — no args
    server.registerTool(
        'list_modules',
        {
            title: 'List src modules',
            description:
                'List top-level directories under src/ with the number of .ts files in each. No arguments.',
        },
        async () => {
            const modules = countFilesPerTopDir(getSrcRoot(), '.ts');
            const total = modules.reduce((s, m) => s + m.count, 0);
            return json({ total, modules });
        },
    );

    // list_files
    server.registerTool(
        'list_files',
        {
            title: 'List files',
            description:
                'List files under a path (default: src/). Set recursive=true to walk subdirectories. Filter by extension with ext (default ".ts").',
            inputSchema: {
                path: z.string().optional().describe('Directory relative to workspace root (default "src").'),
                recursive: z.boolean().optional().describe('Walk subdirectories (default false).'),
                ext: z.string().optional().describe('Extension filter, e.g. ".ts" (default ".ts").'),
            },
        },
        async ({ path: relPath, recursive, ext }) => {
            const target = relPath && relPath.length > 0 ? relPath : 'src';
            let abs: string;
            try {
                abs = resolveWorkspacePath(target);
            } catch (e) {
                return error(e instanceof Error ? e.message : String(e));
            }
            if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
                return error(`Not a directory: ${target}`);
            }
            const files = listFiles(abs, { recursive: recursive ?? false, ext: ext ?? '.ts' });
            return json({ path: target, count: files.length, files });
        },
    );

    // read_file
    server.registerTool(
        'read_file',
        {
            title: 'Read file',
            description:
                'Read a file with cat -n style line numbers. Optional 1-based inclusive line range via startLine/endLine. Paths are workspace-relative.',
            inputSchema: {
                path: z.string().describe('File path relative to workspace root.'),
                startLine: z.number().int().positive().optional().describe('1-based start line (inclusive).'),
                endLine: z.number().int().positive().optional().describe('1-based end line (inclusive).'),
            },
        },
        async ({ path: relPath, startLine, endLine }) => {
            let abs: string;
            try {
                abs = resolveWorkspacePath(relPath);
            } catch (e) {
                return error(e instanceof Error ? e.message : String(e));
            }
            if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
                return error(`File not found: ${relPath}`);
            }
            return text(readFileLines(abs, startLine, endLine));
        },
    );

    // search_code
    server.registerTool(
        'search_code',
        {
            title: 'Search code',
            description:
                'Regex search across files (default src/). Returns "relativePath:line:match" entries. Self-implemented recursive grep, no ripgrep dependency.',
            inputSchema: {
                pattern: z.string().describe('JavaScript regular expression pattern.'),
                path: z.string().optional().describe('Directory relative to workspace root (default "src").'),
                glob: z.string().optional().describe('Optional glob to filter relative paths, e.g. "**/entity/**".'),
                maxResults: z.number().int().positive().optional().describe('Max matches (default 100).'),
                ignoreCase: z.boolean().optional().describe('Case-insensitive (default false).'),
            },
        },
        async ({ pattern, path: relPath, glob, maxResults, ignoreCase }) => {
            let regex: RegExp;
            try {
                regex = new RegExp(pattern, ignoreCase ? 'gi' : 'g');
            } catch (e) {
                return error(`Invalid regex: ${e instanceof Error ? e.message : String(e)}`);
            }
            const target = relPath && relPath.length > 0 ? relPath : 'src';
            let abs: string;
            try {
                abs = resolveWorkspacePath(target);
            } catch (e) {
                return error(e instanceof Error ? e.message : String(e));
            }
            if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
                return error(`Not a directory: ${target}`);
            }
            const limit = maxResults ?? 100;
            const globRegex = glob ? globToRegex(glob) : undefined;
            const matches: Array<{ file: string; line: number; match: string }> = [];
            for (const file of walkFiles(abs, '.ts')) {
                const rel = path.relative(getWorkspaceRoot(), file).replace(/\\/g, '/');
                if (globRegex && !globRegex.test(rel)) continue;
                let content: string;
                try {
                    content = fs.readFileSync(file, 'utf8');
                } catch {
                    continue;
                }
                const lines = content.split(/\r?\n/);
                for (let i = 0; i < lines.length; i++) {
                    regex.lastIndex = 0;
                    if (regex.test(lines[i])) {
                        matches.push({ file: rel, line: i + 1, match: lines[i].trim() });
                        if (matches.length >= limit) {
                            return json({ pattern, count: matches.length, truncated: true, matches });
                        }
                    }
                }
            }
            return json({ pattern, count: matches.length, matches });
        },
    );
}

/** Minimal glob → RegExp converter supporting **, *, ?. */
function globToRegex(glob: string): RegExp {
    let re = '';
    for (let i = 0; i < glob.length; i++) {
        const c = glob[i];
        if (c === '*') {
            if (glob[i + 1] === '*') {
                re += '.*';
                i++;
                if (glob[i + 1] === '/') i++; // consume separator after **
            } else {
                re += '[^/]*';
            }
        } else if (c === '?') {
            re += '.';
        } else if ('.+^$(){}|[]\\'.includes(c)) {
            re += '\\' + c;
        } else {
            re += c;
        }
    }
    return new RegExp('^' + re + '$');
}
