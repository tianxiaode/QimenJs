/**
 * Vite插件：QimenJS CSS按需打包
 *
 * 核心功能：
 * 1. 组件代码中声明CSS依赖（import或static styles）
 * 2. 分析入口文件，收集组件依赖（递归）
 * 3. 合并输出CSS
 *
 * 使用方式：
 * ```ts
 * // 方式1：import CSS
 * import './button.css';
 * class ButtonComponent extends Component { }
 *
 * // 方式2：static styles数组
 * class TabsComponent extends Component {
 *     static styles = [
 *         './tabs.css',
 *         '../tabbar/tabbar.css'
 *     ];
 * }
 *
 * // vite.config.ts
 * import { qimenCssPlugin } from './build-tools/vite-plugin-qimen-css';
 *
 * export default defineConfig({
 *     plugins: [qimenCssPlugin()]
 * });
 * ```
 */

import type { Plugin, ResolvedConfig } from 'vite';
import { resolve, relative, dirname, basename } from 'path';
import { existsSync, readFileSync, readdirSync } from 'fs';

interface ComponentInfo {
    componentName: string;
    componentPath: string;
    stylePaths: string[];
}

export interface QimenCssPluginOptions {
    /**
     * 入口文件（支持glob模式）
     * @default ['src/main.ts']
     */
    entryPoints?: string[];

    /**
     * 组件根目录
     * @default 'src/component'
     */
    componentRoot?: string;

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
     * 是否在开发模式下注入CSS
     * @default true
     */
    injectInDev?: boolean;

    /**
     * 是否打印调试信息
     * @default false
     */
    debug?: boolean;
}

export function qimenCssPlugin(options: QimenCssPluginOptions = {}): Plugin {
    const {
        entryPoints = ['src/main.ts'],
        componentRoot = 'src/component',
        emitFile = true,
        outputFileName = 'qimen-components.css',
        injectInDev = true,
        debug = false,
    } = options;

    let config: ResolvedConfig;
    let isDev = false;

    const componentMap = new Map<string, ComponentInfo>();
    const collectedComponents = new Set<string>();
    const collectedCssFiles = new Set<string>();

    function log(...args: any[]) {
        if (debug) console.log('[qimen-css]', ...args);
    }

    return {
        name: 'vite-plugin-qimen-css',

        configResolved(resolvedConfig) {
            config = resolvedConfig;
            isDev = config.command === 'serve';
        },

        /**
         * 构建开始时：
         * 1. 扫描组件目录，建立组件映射
         * 2. 分析入口文件，收集依赖
         */
        buildStart() {
            const root = config.root;

            log('扫描组件目录...');
            scanComponentDirectory(resolve(root, componentRoot), componentMap);
            log(`发现 ${componentMap.size} 个组件`);

            log('分析入口文件...');
            for (const pattern of entryPoints) {
                const files = globSync(pattern, { cwd: root });
                for (const file of files) {
                    const fullPath = resolve(root, file);
                    collectComponentDependencies(fullPath, componentMap, collectedComponents);
                }
            }

            log(`收集到 ${collectedComponents.size} 个组件`);

            collectedComponents.forEach(compPath => {
                const info = componentMap.get(compPath);
                if (info) {
                    info.stylePaths.forEach(cssPath => collectedCssFiles.add(cssPath));
                }
            });

            log(`需要打包 ${collectedCssFiles.size} 个CSS文件`);
        },

        /**
         * 生成最终CSS文件
         */
        generateBundle(_options, bundle) {
            if (!emitFile || isDev) return;
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
 * 扫描组件目录，建立组件映射
 */
function scanComponentDirectory(dir: string, map: Map<string, ComponentInfo>): void {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = resolve(dir, entry.name);

        if (entry.isDirectory()) {
            scanComponentDirectory(fullPath, map);
        } else if (entry.name.endsWith('Component.ts')) {
            const componentName = basename(entry.name, '.ts');
            const content = readFileSync(fullPath, 'utf-8');

            const stylePaths = extractStylePaths(content, fullPath);

            if (stylePaths.length > 0) {
                map.set(fullPath, {
                    componentName,
                    componentPath: fullPath,
                    stylePaths,
                });
            }
        }
    }
}

/**
 * 从组件代码中提取样式路径
 */
function extractStylePaths(code: string, componentPath: string): string[] {
    const paths: string[] = [];
    const componentDir = dirname(componentPath);

    const staticStylesMatch = code.match(/static\s+styles\s*=\s*\[([\s\S]*?)\]/);
    if (staticStylesMatch) {
        const arrayContent = staticStylesMatch[1];
        const stringMatches = arrayContent.matchAll(/['"]([^'"]+)['"]/g);
        for (const match of stringMatches) {
            const stylePath = match[1];
            const resolvedPath = resolve(componentDir, stylePath);
            if (existsSync(resolvedPath)) {
                paths.push(resolvedPath);
            }
        }
    }

    const cssImportRegex = /import\s+.*?\s+from\s+['"]([^'"]+\.css(?:\.ts)?)['"]/g;
    let match;
    while ((match = cssImportRegex.exec(code)) !== null) {
        const importPath = match[1];
        const resolvedPath = resolve(componentDir, importPath);
        if (existsSync(resolvedPath)) {
            paths.push(resolvedPath);
        }
    }

    return paths;
}

/**
 * 从文件收集组件依赖（递归）
 */
function collectComponentDependencies(
    filePath: string,
    componentMap: Map<string, ComponentInfo>,
    collected: Set<string>,
    visited: Set<string> = new Set()
): void {
    if (visited.has(filePath)) return;
    visited.add(filePath);

    if (!existsSync(filePath)) return;

    const content = readFileSync(filePath, 'utf-8');

    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        let resolvedPath: string | null = null;

        if (importPath.startsWith('@/')) {
            resolvedPath = resolve(process.cwd(), 'src', importPath.slice('@/'.length));
        } else if (importPath.startsWith('@qimenjs/')) {
            const moduleName = importPath.slice('@qimenjs/'.length);
            resolvedPath = resolve(process.cwd(), 'src', moduleName);
        } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
            resolvedPath = resolve(dirname(filePath), importPath);
        }

        if (!resolvedPath) continue;

        if (!resolvedPath.endsWith('.ts')) {
            resolvedPath += '.ts';
        }

        if (componentMap.has(resolvedPath)) {
            collected.add(resolvedPath);
        }

        if (existsSync(resolvedPath)) {
            collectComponentDependencies(resolvedPath, componentMap, collected, visited);
        }
    }
}

function globSync(pattern: string, options: { cwd: string }): string[] {
    const results: string[] = [];

    function walk(dir: string, base: string) {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = resolve(dir, entry.name);
            const relPath = relative(base, fullPath);

            if (entry.isDirectory()) {
                walk(fullPath, base);
            } else if (pattern.includes('**')) {
                const regex = new RegExp(
                    '^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'
                );
                if (regex.test(relPath.replace(/\\/g, '/'))) {
                    results.push(relPath);
                }
            } else if (relPath === pattern) {
                results.push(relPath);
            }
        }
    }

    walk(options.cwd, options.cwd);
    return results;
}
