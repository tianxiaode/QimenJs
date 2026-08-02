import fs from 'fs';
import path from 'path';

/**
 * Pure filesystem helpers operating on absolute paths. Path-safety (workspace
 * containment) is enforced in `project-context.ts` before these are called.
 */

/** Recursively yield every file under `absDir`, optionally filtered by extension. */
export function* walkFiles(absDir: string, ext?: string): IterableIterator<string> {
    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(absDir, { withFileTypes: true });
    } catch {
        return;
    }
    for (const entry of entries) {
        const full = path.join(absDir, entry.name);
        if (entry.isDirectory()) {
            // Skip noise directories that never contain source.
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
                continue;
            }
            yield* walkFiles(full, ext);
        } else if (entry.isFile()) {
            if (!ext || entry.name.endsWith(ext)) {
                yield full;
            }
        }
    }
}

/** Collect files into an array, sorted, with paths relativized to `baseDir`. */
export function listFiles(absDir: string, opts: { recursive?: boolean; ext?: string } = {}): string[] {
    const { recursive = false, ext } = opts;
    const results: string[] = [];

    if (recursive) {
        for (const f of walkFiles(absDir, ext)) {
            results.push(path.relative(absDir, f).replace(/\\/g, '/'));
        }
    } else {
        let entries: fs.Dirent[];
        try {
            entries = fs.readdirSync(absDir, { withFileTypes: true });
        } catch {
            return [];
        }
        for (const entry of entries) {
            if (entry.isFile() && (!ext || entry.name.endsWith(ext))) {
                results.push(entry.name);
            }
        }
    }
    results.sort();
    return results;
}

/** Count `.ts` files in each top-level subdirectory of `absDir`. */
export function countFilesPerTopDir(absDir: string, ext = '.ts'): Array<{ dir: string; count: number }> {
    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(absDir, { withFileTypes: true });
    } catch {
        return [];
    }
    const results: Array<{ dir: string; count: number }> = [];
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name === 'node_modules' || entry.name === 'dist') continue;
        let count = 0;
        for (const _ of walkFiles(path.join(absDir, entry.name), ext)) {
            count++;
        }
        results.push({ dir: entry.name, count });
    }
    results.sort((a, b) => b.count - a.count);
    return results;
}

/**
 * Read a file and return its content with `cat -n`-style line numbers.
 * Line range is 1-based and inclusive. Omitting both returns the whole file.
 */
export function readFileLines(absPath: string, startLine?: number, endLine?: number): string {
    const content = fs.readFileSync(absPath, 'utf8');
    const lines = content.split(/\r?\n/);
    const start = startLine && startLine > 0 ? startLine : 1;
    const end = endLine && endLine > 0 ? endLine : lines.length;
    const out: string[] = [];
    for (let i = start; i <= Math.min(end, lines.length); i++) {
        const num = String(i).padStart(6, ' ');
        out.push(`${num}\t${lines[i - 1]}`);
    }
    return out.join('\n');
}

/** Count total lines in a file (cheap stat-based for future use). */
export function fileExists(absPath: string): boolean {
    try {
        return fs.statSync(absPath).isFile();
    } catch {
        return false;
    }
}
