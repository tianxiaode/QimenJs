import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { getSrcRoot, getWorkspaceRoot } from './project-context';
import { walkFiles } from '../utils/fs-utils';

/**
 * Lazy TypeScript LanguageService over the whole `src/` tree.
 *
 * Compiler options (including the `@qimenjs/*` and `@/*` path aliases) are
 * inherited from the root `tsconfig.json` so that cross-module reference
 * resolution works identically to the real build.
 *
 * First semantic call warms up the full program (832 files, ~3-8s); subsequent
 * calls are incremental. Basic file tools never touch this.
 */

let languageService: ts.LanguageService | undefined;
let compilerOptions: ts.CompilerOptions;
let rootFiles: string[] = [];
const versionCache = new Map<string, string>();

function loadCompilerOptions(): ts.CompilerOptions {
    const tsconfigPath = path.join(getWorkspaceRoot(), 'tsconfig.json');
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (configFile.error) {
        throw new Error(`Failed to read tsconfig.json: ${configFile.error.messageText}`);
    }
    const parsed = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        getWorkspaceRoot(),
    );
    const options = { ...parsed.options, noEmit: true };
    return options;
}

function collectRootFiles(): string[] {
    const files: string[] = [];
    for (const f of walkFiles(getSrcRoot(), '.ts')) {
        files.push(f);
    }
    return files;
}

class ProjectLanguageServiceHost implements ts.LanguageServiceHost {
    constructor(private options: ts.CompilerOptions, private fileNames: string[]) {}

    getCompilationSettings(): ts.CompilerOptions {
        return this.options;
    }

    getScriptFileNames(): string[] {
        return this.fileNames;
    }

    getScriptVersion(fileName: string): string {
        try {
            const stat = fs.statSync(fileName);
            const v = `${stat.mtimeMs}`;
            versionCache.set(fileName, v);
            return v;
        } catch {
            return versionCache.get(fileName) ?? '0';
        }
    }

    getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined {
        try {
            const content = fs.readFileSync(fileName, 'utf8');
            return ts.ScriptSnapshot.fromString(content);
        } catch {
            return undefined;
        }
    }

    getCurrentDirectory(): string {
        return getWorkspaceRoot();
    }

    getDefaultLibFileName(o: ts.CompilerOptions): string {
        return ts.getDefaultLibFilePath(o);
    }

    fileExists = ts.sys.fileExists;
    readFile = ts.sys.readFile;
    readDirectory = ts.sys.readDirectory;
    directoryExists = ts.sys.directoryExists;
    getDirectories = ts.sys.getDirectories;
    realpath = ts.sys.realpath;
}

/** Lazily build (and memoize) the LanguageService. */
export function getLanguageService(): ts.LanguageService {
    if (languageService) return languageService;
    compilerOptions = loadCompilerOptions();
    rootFiles = collectRootFiles();
    const host = new ProjectLanguageServiceHost(compilerOptions, rootFiles);
    languageService = ts.createLanguageService(host, undefined, ts.LanguageServiceMode.Semantic);
    return languageService;
}

/** Get the active program (forces service init). */
export function getProgram(): ts.Program {
    const ls = getLanguageService();
    const program = ls.getProgram();
    if (!program) throw new Error('LanguageService program is not available');
    return program;
}

/** Resolve a workspace-relative path to its SourceFile (forces service init). */
export function getSourceFile(relPath: string): ts.SourceFile {
    const program = getProgram();
    const abs = path.isAbsolute(relPath) ? relPath : path.resolve(getWorkspaceRoot(), relPath);
    const sf = program.getSourceFile(abs);
    if (!sf) {
        // Try matching by trailing path segment as a fallback.
        const fallback = program.getSourceFiles().find(f => f.fileName.replace(/\\/g, '/').endsWith(relPath.replace(/\\/g, '/')));
        if (fallback) return fallback;
        throw new Error(`Source file not in program: ${relPath} (resolved ${abs}). Ensure it is under src/.`);
    }
    return sf;
}

/**
 * Convert a 1-based line (and optional 0-based column) to an absolute offset.
 * When `column` is omitted, use the position of the first non-whitespace
 * character on that line.
 */
export function getPosition(sourceFile: ts.SourceFile, line: number, column?: number): number {
    const lineStarts = sourceFile.getLineStarts();
    const lineIndex = Math.max(0, Math.min(line - 1, lineStarts.length - 1));
    const lineStart = lineStarts[lineIndex];
    if (column !== undefined && column >= 0) {
        return lineStart + column;
    }
    // First non-whitespace token on the line.
    const lineEnd = lineIndex + 1 < lineStarts.length ? lineStarts[lineIndex + 1] - 1 : sourceFile.text.length;
    for (let i = lineStart; i < lineEnd; i++) {
        const ch = sourceFile.text.charCodeAt(i);
        if (ch !== 32 /* space */ && ch !== 9 /* tab */) {
            return i;
        }
    }
    return lineStart;
}

/** Bump the cached version of a file so the service re-reads it on next call. */
export function invalidate(absPath: string): void {
    versionCache.delete(absPath);
}

/** Get the compiler options loaded from the root tsconfig (forces service init). */
export function getCompilerOptions(): ts.CompilerOptions {
    if (!languageService) {
        compilerOptions = loadCompilerOptions();
    }
    return compilerOptions;
}
