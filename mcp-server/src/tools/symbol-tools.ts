import ts from 'typescript';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSourceFile } from '../project/ts-service';
import { error, json } from '../utils/mcp-result';

/**
 * Register the get_symbols tool, which extracts top-level declarations from a
 * TypeScript source file using the compiler API (not the LanguageService, but
 * the SourceFile produced by the shared program).
 */
export function registerSymbolTools(server: McpServer): void {
    server.registerTool(
        'get_symbols',
        {
            title: 'Get symbols',
            description:
                'List top-level declarations (class/interface/function/type/enum/variable) in a TypeScript file with line numbers, export status, and modifiers.',
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
            const symbols: Array<Record<string, unknown>> = [];
            for (const stmt of sourceFile.statements) {
                collectSymbol(stmt, sourceFile, symbols);
            }
            return json({ file, symbolCount: symbols.length, symbols });
        },
    );
}

function collectSymbol(stmt: ts.Statement, sourceFile: ts.SourceFile, out: Array<Record<string, unknown>>): void {
    const line = ts.getLineAndCharacterOfPosition(sourceFile, stmt.getStart(sourceFile)).line + 1;
    const modifiers = modifierNames(stmt);
    const exported = modifiers.includes('export');
    const isDefault = modifiers.includes('default');

    if (ts.isClassDeclaration(stmt) && stmt.name) {
        out.push({ name: stmt.name.text, kind: 'class', line, exported, default: isDefault, modifiers });
    } else if (ts.isInterfaceDeclaration(stmt) && stmt.name) {
        out.push({ name: stmt.name.text, kind: 'interface', line, exported, default: isDefault, modifiers });
    } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
        out.push({ name: stmt.name.text, kind: 'function', line, exported, default: isDefault, modifiers });
    } else if (ts.isTypeAliasDeclaration(stmt) && stmt.name) {
        out.push({ name: stmt.name.text, kind: 'type', line, exported, default: isDefault, modifiers });
    } else if (ts.isEnumDeclaration(stmt) && stmt.name) {
        out.push({ name: stmt.name.text, kind: 'enum', line, exported, default: isDefault, modifiers });
    } else if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
            const name = declarationName(decl.name);
            out.push({ name, kind: 'variable', line, exported, default: isDefault, modifiers });
        }
    }
}

function declarationName(name: ts.BindingName): string {
    if (ts.isIdentifier(name)) return name.text;
    if (ts.isArrayBindingPattern(name) || ts.isObjectBindingPattern(name)) return '(destructured)';
    return '(unknown)';
}

function modifierNames(node: ts.Node): string[] {
    const names: string[] = [];
    if (ts.canHaveModifiers(node)) {
        const mods = ts.getModifiers(node) ?? [];
        for (const m of mods) {
            names.push(ts.SyntaxKind[m.kind].toLowerCase().replace('keyword', ''));
        }
    }
    return names;
}
