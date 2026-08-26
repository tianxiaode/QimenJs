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

const CSS_VIRTUAL_PREFIX = '\0qimen-css:';

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

        transform(code, id) {
            if (id.includes('node_modules')) return;
            if (!id.endsWith('.ts') && !id.endsWith('.tsx') && !id.endsWith('.js') && !id.endsWith('.jsx')) return;
            if (id.includes('.css')) return;
            if (!code.includes('.css') && !code.includes('.css.ts')) return;
            const transformed = code.replace(
                /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|export\s+(?:\*|[\w{} ,]*)\s+from\s+)['"]([^'"]+\.css(?:\.ts)?)['"]/g,
                (match, path) => {
                    const dir = dirname(id);
                    const resolved = resolve(dir, path);
                    const tsPath = resolved.endsWith('.ts') ? resolved : resolved + '.ts';
                    if (existsSync(tsPath)) {
                        return match.replace(path, CSS_VIRTUAL_PREFIX + tsPath.replace(/\\/g, '/'));
                    }
                    return match;
                }
            );
            if (transformed !== code) {
                return { code: transformed, map: null };
            }
        },

        resolveId(source) {
            if (source.startsWith(CSS_VIRTUAL_PREFIX)) {
                return source;
            }
        },

        load(id) {
            if (id.startsWith(CSS_VIRTUAL_PREFIX)) {
                const tsPath = id.slice(CSS_VIRTUAL_PREFIX.length);
                const content = readFileSync(tsPath, 'utf-8');
                const cssMatch = content.match(
                    /export\s+(?:const|let|var)\s+(\w+)\s*=\s*`([\s\S]*?)`/
                );
                if (cssMatch) {
                    const varName = cssMatch[1];
                    const css = cssMatch[2].replace(/`/g, '\\`').replace(/\${/g, '\\${');
                    return `const ${varName} = \`${css}\`;
const style = document.createElement('style');
style.textContent = ${varName};
document.head.appendChild(style);
export { ${varName} };
export default ${varName};`;
                }
            }
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
                const cssMatch = content.match(
                    /export\s+(?:const|let|var)\s+\w+CSS\s*=\s*`([\s\S]*?)`/
                );

                if (cssMatch) {
                    cssContents.push(`/* ${basename(dirname(cssPath))} */`);
                    cssContents.push(cssMatch[1]);
                }
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
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.js')) return;

    const content = readFileSync(filePath, 'utf-8');
    const dir = dirname(filePath);

    // 提取所有 import/export 语句
    const importRegex = /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|export\s+(?:\*|[\w{} ,]*)\s+from\s+)['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // CSS import
        if (importPath.endsWith('.css') || importPath.endsWith('.css.ts')) {
            let cssPath = resolve(dir, importPath);
            if (!existsSync(cssPath) && importPath.endsWith('.css') && !importPath.endsWith('.css.ts')) {
                cssPath += '.ts';
            }
            if (existsSync(cssPath)) {
                cssFiles.add(cssPath);
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
