import fs from 'fs';
import path from 'path';

/**
 * Resolves and exposes the QimenJs workspace layout in a cwd-independent way.
 *
 * When spawned by an MCP client (Trae / Claude Desktop), the process cwd is not
 * guaranteed to be the workspace root. We therefore walk up from this file's
 * location (`mcp-server/src/project/`) to find the workspace root by detecting
 * its `package.json` (name === "qimenjs") together with a `src/` directory.
 */

const WORKSPACE_ROOT = resolveWorkspaceRoot();
const SRC_ROOT = path.join(WORKSPACE_ROOT, 'src');

function resolveWorkspaceRoot(): string {
    let dir = __dirname;
    for (let i = 0; i < 8; i++) {
        const pkgPath = path.join(dir, 'package.json');
        const srcPath = path.join(dir, 'src');
        if (fs.existsSync(srcPath) && fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                if (pkg.name === 'qimenjs') {
                    return dir;
                }
            } catch {
                // ignore malformed package.json, keep walking
            }
        }
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    // Fallback: assume cwd is the workspace root.
    return process.cwd();
}

/** Absolute path to the workspace root. */
export function getWorkspaceRoot(): string {
    return WORKSPACE_ROOT;
}

/** Absolute path to the `src/` directory. */
export function getSrcRoot(): string {
    return SRC_ROOT;
}

/**
 * Resolve a user-supplied relative path against the workspace root and verify
 * the result stays inside the workspace. Throws on path traversal escapes.
 */
export function resolveWorkspacePath(rel: string): string {
    const resolved = path.isAbsolute(rel)
        ? rel
        : path.resolve(WORKSPACE_ROOT, rel);
    const normalizedRoot = path.resolve(WORKSPACE_ROOT) + path.sep;
    const normalizedResolved = path.resolve(resolved);
    if (normalizedResolved !== WORKSPACE_ROOT && !normalizedResolved.startsWith(normalizedRoot)) {
        throw new Error(`Path escapes workspace root: ${rel}`);
    }
    return normalizedResolved;
}

/** Convert an absolute path to a workspace-relative posix-style string. */
export function toWorkspaceRelative(abs: string): string {
    return path.relative(WORKSPACE_ROOT, abs).replace(/\\/g, '/');
}
