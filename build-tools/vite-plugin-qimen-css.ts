/**
 * Vite插件：QimenJS CSS按需打包（简化版）
 *
 * 核心逻辑：
 * 1. 从入口文件开始，递归分析import链
 * 2. 收集所有 import './xxx.css' 语句
 * 3. 合并输出CSS
 *
 * 使用方式：
 * ```ts
 * // vite.config.ts
 * import { qimenCssPlugin } from './build-tools/vite-plugin-qimen-css';
 *
 * export default defineConfig({
 *     plugins: [qimenCssPlugin()]
 * });
 * ```
 */

import type { Plugin, ResolvedConfig, Alias } from 'vite';
import { resolve, dirname, basename } from 'path';
import { existsSync, readFileSync } from 'fs';

export interface QimenCssPluginOptions {
    /**
     * 入口文件
     * @default ['src/main.ts']
     */
    entryPoints?: string[];

    /**
     * 是否生成独立的CSS文件
     * @default true
     */
    emitFile?: boolean;

    /**
     * CSS输出文件名
     * @default 'qimen-components.css'
     */
    outputFileName?: string;

    /**
     * 是否打印调试信息
     * @default false
     */
    debug?: boolean;
}

export function qimenCssPlugin(options: QimenCssPluginOptions = {}): Plugin {
    const {
        entryPoints = ['src/main.ts'],
        emitFile = true,
        outputFileName = 'qimen-components.css',
        debug = false,
    } = options;

    let config: ResolvedConfig;
    let aliases: Alias[] = [];
    const collectedCssFiles = new Set<string>();

    function log(...args: any[]) {
        if (debug) console.log('[qimen-css]', ...args);
    }

    return {
        name: 'vite-plugin-qimen-css',

        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },

        buildStart() {
            const root = config.root;
            const visited = new Set<string>();
            aliases = (config.resolve?.alias as Alias[]) || [];

            log('分析入口文件...');

            for (const entry of entryPoints) {
                const entryPath = resolve(root, entry);
                if (existsSync(entryPath)) {
                    collectCSSImports(entryPath, collectedCssFiles, visited, root, aliases);
                }
            }

            log(`收集到 ${collectedCssFiles.size} 个CSS文件`);
        },

        generateBundle(_options, bundle) {
            if (!emitFile) return;
            if (collectedCssFiles.size === 0) return;

            const cssContents: string[] = [];

            collectedCssFiles.forEach(cssPath => {
                if (!existsSync(cssPath)) return;

                const content = readFileSync(cssPath, 'utf-8');
                cssContents.push(`/* ${basename(dirname(cssPath))} */`);
                cssContents.push(content);
            });

            if (cssContents.length === 0) return;

            const mergedCss = cssContents.join('\n\n');

            this.emitFile({
                type: 'asset',
                fileName: outputFileName,
                source: mergedCss,
            });

            console.log(
                `[qimen-css] 生成CSS: ${outputFileName} (${collectedCssFiles.size} 个文件)`
            );
        },
    };
}

/**
 * 通过 Vite 别名解析模块路径
 */
function resolveAlias(importPath: string, aliases: Alias[], root: string): string | null {
    for (const alias of aliases) {
        const { find, replacement } = alias;
        if (typeof find === 'string') {
            if (importPath === find || importPath.startsWith(find + '/')) {
                const suffix = importPath === find ? '' : importPath.slice(find.length);
                return resolve(root, replacement + suffix);
            }
        } else if (find instanceof RegExp) {
            const match = importPath.match(find);
            if (match) {
                const rel = replacement.replace(/\$(\d+)/g, (_, n) => match[Number(n)] || '');
                return resolve(root, rel);
            }
        }
    }
    return null;
}

/**
 * 递归收集CSS import
 */
function collectCSSImports(filePath: string, cssFiles: Set<string>, visited: Set<string>, root: string, aliases: Alias[]): void {
    if (visited.has(filePath)) return;
    visited.add(filePath);

    if (!existsSync(filePath)) return;

    const content = readFileSync(filePath, 'utf-8');
    const dir = dirname(filePath);

    if (filePath.endsWith('.css')) {
        cssFiles.add(filePath);
        const importRegex = /@import\s+['"]([^'"]+)['"]\s*;/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];
            if (importPath.endsWith('.css')) {
                let cssPath = resolveAlias(importPath, aliases, root);
                if (!cssPath) {
                    cssPath = resolve(dir, importPath);
                }
                if (existsSync(cssPath)) {
                    collectCSSImports(cssPath, cssFiles, visited, root, aliases);
                }
            }
        }
        return;
    }

    if (!filePath.endsWith('.ts') && !filePath.endsWith('.js')) return;

    // 提取所有 import/export 语句
    const importRegex = /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|export\s+(?:\*|[\w{} ,]*)\s+from\s+)['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // CSS import
        if (importPath.endsWith('.css') || importPath.endsWith('.css.ts')) {
            let cssPath = resolveAlias(importPath, aliases, root);
            if (!cssPath) {
                cssPath = resolve(dir, importPath);
            }
            if (existsSync(cssPath)) {
                collectCSSImports(cssPath, cssFiles, visited, root, aliases);
            }
        }
        // TS/JS import - 递归分析
        else if (
            importPath.endsWith('.ts') ||
            importPath.endsWith('.js') ||
            (!importPath.includes('!') && !importPath.startsWith('data:'))
        ) {
            let resolvedPath = resolveAlias(importPath, aliases, root);
            if (!resolvedPath) {
                resolvedPath = resolve(dir, importPath);
            }

            if (!resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.js')) {
                const candidates = [resolvedPath + '.ts', resolvedPath + '.js', resolvedPath + '/index.ts', resolvedPath + '/index.js'];
                for (const c of candidates) {
                    if (existsSync(c)) {
                        resolvedPath = c;
                        break;
                    }
                }
            }

            if (existsSync(resolvedPath)) {
                collectCSSImports(resolvedPath, cssFiles, visited, root, aliases);
            }
        }
    }
}
