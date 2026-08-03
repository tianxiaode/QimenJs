import fs from 'fs';
import path from 'path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getWorkspaceRoot, resolveWorkspacePath } from '../project/project-context';
import { readFileLines, walkFiles } from '../utils/fs-utils';
import { error, json, text } from '../utils/mcp-result';

const DOCS_ROOT = path.join(getWorkspaceRoot(), 'docs');

const DESIGN_DECISIONS_DIR = 'design-decisions';
const BEST_PRACTICES_DIR = 'best-practices';
const ARCHITECTURE_DIR = 'architecture';
const GUIDES_DIR = 'guides';

const SEARCHABLE_DIRS = [DESIGN_DECISIONS_DIR, BEST_PRACTICES_DIR, ARCHITECTURE_DIR, GUIDES_DIR];

interface DocEntry {
    path: string;
    title: string;
}

function extractTitle(absPath: string): string {
    try {
        const content = fs.readFileSync(absPath, 'utf8');
        const match = content.match(/^#\s+(.+)/m);
        if (match) return match[1].trim();
    } catch {
        /* ignore */
    }
    return path.basename(absPath, '.md');
}

function collectMarkdownEntries(subDir: string): DocEntry[] {
    const absDir = path.join(DOCS_ROOT, subDir);
    if (!fs.existsSync(absDir)) return [];
    const entries: DocEntry[] = [];
    for (const file of walkFiles(absDir, '.md')) {
        const rel = path.relative(DOCS_ROOT, file).replace(/\\/g, '/');
        entries.push({ path: rel, title: extractTitle(file) });
    }
    entries.sort((a, b) => a.path.localeCompare(b.path));
    return entries;
}

export function registerDocsTools(server: McpServer): void {
    server.registerTool(
        'search_docs',
        {
            title: 'Search docs',
            description:
                'Search markdown docs under docs/ (design-decisions, best-practices, architecture, guides). ' +
                'Returns "relativePath:line:snippet" entries. Skips api/ and sdd/ directories.',
            inputSchema: {
                pattern: z.string().describe('JavaScript regular expression pattern.'),
                category: z
                    .enum(['design-decisions', 'best-practices', 'architecture', 'guides', 'all'])
                    .optional()
                    .describe('Category to search (default "all").'),
                maxResults: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .describe('Max matches (default 50).'),
                ignoreCase: z.boolean().optional().describe('Case-insensitive (default true).'),
            },
        },
        async ({ pattern, category, maxResults, ignoreCase }) => {
            let regex: RegExp;
            try {
                regex = new RegExp(pattern, ignoreCase !== false ? 'gi' : 'g');
            } catch (e) {
                return error(`Invalid regex: ${e instanceof Error ? e.message : String(e)}`);
            }
            const limit = maxResults ?? 50;
            const dirs = category && category !== 'all' ? [category] : SEARCHABLE_DIRS;
            const matches: Array<{ file: string; line: number; snippet: string }> = [];
            for (const dir of dirs) {
                const absDir = path.join(DOCS_ROOT, dir);
                if (!fs.existsSync(absDir)) continue;
                for (const file of walkFiles(absDir, '.md')) {
                    const rel = path.relative(getWorkspaceRoot(), file).replace(/\\/g, '/');
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
                            matches.push({ file: rel, line: i + 1, snippet: lines[i].trim() });
                            if (matches.length >= limit) {
                                return json({
                                    pattern,
                                    count: matches.length,
                                    truncated: true,
                                    matches,
                                });
                            }
                        }
                    }
                }
            }
            return json({ pattern, count: matches.length, matches });
        }
    );

    server.registerTool(
        'list_design_decisions',
        {
            title: 'List design decisions',
            description:
                'List all design decision documents under docs/design-decisions/. ' +
                'Returns path and title (extracted from # heading) for each document.',
        },
        async () => {
            const entries = collectMarkdownEntries(DESIGN_DECISIONS_DIR);
            return json({ count: entries.length, entries });
        }
    );

    server.registerTool(
        'list_best_practices',
        {
            title: 'List best practices',
            description:
                'List all best practice documents under docs/best-practices/. ' +
                'Returns path and title for each document.',
        },
        async () => {
            const entries = collectMarkdownEntries(BEST_PRACTICES_DIR);
            return json({ count: entries.length, entries });
        }
    );

    server.registerTool(
        'read_doc',
        {
            title: 'Read doc',
            description:
                'Read a markdown document from docs/ with cat -n style line numbers. ' +
                'Optional 1-based inclusive line range via startLine/endLine. ' +
                'Paths are relative to workspace root (e.g. "docs/design-decisions/2026-07-27-direct-extends-component-pattern.md").',
            inputSchema: {
                path: z.string().describe('File path relative to workspace root under docs/.'),
                startLine: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .describe('1-based start line (inclusive).'),
                endLine: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .describe('1-based end line (inclusive).'),
            },
        },
        async ({ path: relPath, startLine, endLine }) => {
            if (!relPath.startsWith('docs/')) {
                return error(`Path must be under docs/: ${relPath}`);
            }
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
        }
    );
}
