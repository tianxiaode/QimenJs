import path from 'path';
import ts from 'typescript';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { toWorkspaceRelative } from '../project/project-context';
import { getCompilerOptions, getLanguageService, getProgram, getSourceFile, getPosition } from '../project/ts-service';
import { error, json } from '../utils/mcp-result';

/**
 * Register call-graph tools backed by the TypeScript LanguageService:
 * find_references, get_dependencies, get_dependents.
 */
export function registerGraphTools(server: McpServer): void {
    // find_references
    server.registerTool(
        'find_references',
        {
            title: 'Find references',
            description:
                'Find all references to the symbol at the given 1-based line (and optional 0-based column) in a file. When column is omitted, uses the first non-whitespace token on the line. First call warms up the TS program (~3-8s for 832 files).',
            inputSchema: {
                file: z.string().describe('File path relative to workspace root.'),
                line: z.number().int().positive().describe('1-based line number.'),
                column: z.number().int().min(0).optional().describe('0-based column offset (optional).'),
            },
        },
        async ({ file, line, column }) => {
            let sourceFile: ts.SourceFile;
            try {
                sourceFile = getSourceFile(file);
            } catch (e) {
                return error(e instanceof Error ? e.message : String(e));
            }
            const position = getPosition(sourceFile, line, column);
            const ls = getLanguageService();
            const refs = ls.findReferences(sourceFile.fileName, position);
            if (!refs || refs.length === 0) {
                return json({ file, line, column, symbols: [] });
            }
            const program = getProgram();
            const symbols = refs.map(sym => ({
                name: symbolDefinitionName(sym.definition),
                kind: sym.definition.kind,
                locations: sym.references.map(r => toLocation(r.fileName, r.textSpan.start, program)),
            }));
            return json({ file, line, column, symbols });
        },
    );

    // get_dependencies
    server.registerTool(
        'get_dependencies',
        {
            title: 'Get dependencies (imports)',
            description:
                'List the modules imported by a file, resolved to actual file paths (follows @qimenjs/* path aliases).',
            inputSchema: {
                file: z.string().describe('File path relative to workspace root.'),
            },
        },
        async ({ file }) => {
            let sourceFile: ts.SourceFile;
            try {
                sourceFile = getSourceFile(file);
            } catch (e) {
                return error(e instanceof Error ? e.message : String(e));
            }
            const deps = getImports(sourceFile);
            return json({ file, dependencyCount: deps.length, dependencies: deps });
        },
    );

    // get_dependents
    server.registerTool(
        'get_dependents',
        {
            title: 'Get dependents (reverse imports)',
            description:
                'List files that import the given file (reverse dependencies). Scans all source files in the program.',
            inputSchema: {
                file: z.string().describe('File path relative to workspace root.'),
            },
        },
        async ({ file }) => {
            let target: ts.SourceFile;
            try {
                target = getSourceFile(file);
            } catch (e) {
                return error(e instanceof Error ? e.message : String(e));
            }
            const targetAbs = path.resolve(target.fileName);
            const program = getProgram();
            const dependents: Array<Record<string, unknown>> = [];
            for (const sf of program.getSourceFiles()) {
                if (path.resolve(sf.fileName) === targetAbs) continue;
                // Only consider project source files (skip lib.d.ts etc.).
                if (!sf.fileName.replace(/\\/g, '/').includes('/src/')) continue;
                const deps = getImports(sf);
                const matched = deps.filter(d => d.resolvedFile && path.resolve(d.resolvedFile) === targetAbs);
                if (matched.length > 0) {
                    dependents.push({
                        file: toWorkspaceRelative(sf.fileName),
                        specifiers: matched.map(m => ({ specifier: m.specifier, importedNames: m.importedNames })),
                    });
                }
            }
            return json({ file, dependentCount: dependents.length, dependents });
        },
    );
}

interface ImportInfo {
    specifier: string;
    resolvedFile: string | null;
    importedNames: string[];
}

/** Extract all import declarations from a source file, resolved to files. */
function getImports(sourceFile: ts.SourceFile): ImportInfo[] {
    const options = getCompilerOptions();
    const result: ImportInfo[] = [];
    for (const stmt of sourceFile.statements) {
        let specifier: string | undefined;
        let importedNames: string[] = [];

        if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
            specifier = stmt.moduleSpecifier.text;
            importedNames = extractImportedNames(stmt.importClause);
        } else if (ts.isExportDeclaration(stmt) && stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
            specifier = stmt.moduleSpecifier.text;
            importedNames = ['(re-export)'];
        } else if (ts.isImportEqualsDeclaration(stmt) && ts.isExternalModuleReference(stmt.moduleReference)) {
            const expr = stmt.moduleReference.expression;
            if (ts.isStringLiteral(expr)) {
                specifier = expr.text;
                importedNames = [`default:${stmt.name.text}`];
            }
        }

        if (specifier === undefined) continue;

        const resolved = ts.resolveModuleName(specifier, sourceFile.fileName, options, ts.sys).resolvedModule;
        result.push({
            specifier,
            resolvedFile: resolved ? toWorkspaceRelative(resolved.resolvedFileName) : null,
            importedNames,
        });
    }
    return result;
}

function extractImportedNames(clause: ts.ImportClause | undefined): string[] {
    if (!clause) return ['(side-effect)'];
    const names: string[] = [];
    if (clause.name) names.push(`default:${clause.name.text}`);
    if (clause.namedBindings) {
        if (ts.isNamedImports(clause.namedBindings)) {
            for (const el of clause.namedBindings.elements) {
                names.push(el.propertyName ? `${el.propertyName.text} as ${el.name.text}` : el.name.text);
            }
        } else if (ts.isNamespaceImport(clause.namedBindings)) {
            names.push(`*:${clause.namedBindings.name.text}`);
        }
    }
    return names.length === 0 ? ['(side-effect)'] : names;
}

function symbolDefinitionName(def: ts.ReferencedSymbolDefinitionInfo): string {
    return def.name || def.fileName || '(anonymous)';
}

function toLocation(fileName: string, start: number, program: ts.Program): { file: string; line: number; column: number } {
    const sf = program.getSourceFile(fileName);
    if (!sf) return { file: toWorkspaceRelative(fileName), line: 0, column: 0 };
    const pos = ts.getLineAndCharacterOfPosition(sf, start);
    return { file: toWorkspaceRelative(fileName), line: pos.line + 1, column: pos.character };
}
