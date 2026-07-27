/**
 * CompileEngine — 编译引擎
 *
 * 纯函数引擎：把 TplNode 编译为编译产物
 * 输入：tpl (TplNode)
 * 输出：{ cache: CompiledTemplateCache, nodeMetas: Record<string, NodeMetadata> }
 *
 * cache 是只读可共享部分，nodeMetas 是每类独立部分
 *
 * 职责边界：
 *   - 编译：TplNode → HTML + indexPath + nodeMetas + exposeNames + i18nNodes + skeletonPaths
 *   - 预处理：expandFragments 将 fragment 展开为普通 children
 *   - 不负责：DOM 路径查找（→ utils/dom-path）、构造函数装饰（→ TemplateFactory）
 */

import type { TplNode } from '../types/tpl-node-types';
import type { NodeMetadata, NodeIndexPath, CompiledTemplateCache } from '../types/compiled-types';
import type { CompileResult } from './types/compile-engine-types';
import { VOID_TAGS } from './constants/compile-constants';
import { Logger } from '@/logger';

export class CompileEngine {
    /**
     * 编译模板 — 主入口
     *
     * 完整编译管线：expandFragments → compileTemplate → 构建 CompileResult
     *
     * @param tpl - 原始模板节点（可含 fragment）
     * @param owner - 可选宿主对象，用于 Logger 上下文
     * @returns CompileResult { cache, nodeMetas }
     *
     * @example
     * ```ts
     * const { cache, nodeMetas } = CompileEngine.compile(tpl, this);
     * // cache: 只读可共享（html, indexPath, exposeNames, i18nNodes, templateCache, skeletonPaths）
     * // nodeMetas: 每类独立（运行时附加 el/component）
     * ```
     */
    static compile(tpl: TplNode, owner?: any): CompileResult {
        const expandedTpl = CompileEngine.expandFragments(tpl);
        const result = CompileEngine.compileTemplate(expandedTpl, Logger.for(owner?.constructor));

        const tplEl = document.createElement('template');
        tplEl.innerHTML = result.html;

        const cache: CompiledTemplateCache = {
            html: result.html,
            indexPath: result.indexPath,
            exposeNames: result.exposeNames,
            i18nNodes: result.i18nNodes,
            templateCache: tplEl,
            skeletonPaths: result.skeletonPaths,
        };

        const nodeMetas = result.nodeMetas;

        return { cache, nodeMetas };
    }

    /**
     * 展开 fragment — 预处理步骤
     *
     * 将 TplNode 中的 fragment 递归展开为普通 children，
     * fragment.name 作为命名空间前缀追加到子节点 name 上。
     *
     * @param node - 模板节点（可含 fragment）
     * @param ns - 命名空间前缀（递归内部使用）
     * @returns 展开后的 TplNode（不含 fragment）
     *
     * @example
     * ```ts
     * // { fragment: { name: 'btn', children: [{ name: 'icon' }] } }
     * // → { children: [{ name: 'btn:icon' }] }
     * ```
     */
    static expandFragments(node: TplNode, ns?: string): TplNode {
        let result = { ...node };

        if (ns && result.name) {
            result.name = `${ns}:${result.name}`;
        }

        if (result.fragment) {
            const fragmentNs = result.fragment.name;
            result.children = result.fragment.children.map(child =>
                CompileEngine.expandFragments(child, fragmentNs)
            );
            delete result.fragment;
        }

        if (result.children) {
            result.children = result.children.map(child =>
                CompileEngine.expandFragments(child, ns)
            );
        }

        return result;
    }

    /**
     * 编译模板 — 核心编译
     *
     * 将根 TplNode 编译为 HTML 字符串 + 节点元数据集合。
     * 根节点自动注册为 'root'，子节点按序编译。
     *
     * @param root - 已展开的模板根节点（无 fragment）
     * @param logger - 日志器，用于嵌套深度警告
     * @returns 编译中间产物 { html, indexPath, nodeMetas, exposeNames, i18nNodes, skeletonPaths }
     */
    static compileTemplate(root: TplNode, logger: any) {
        const indexPath: NodeIndexPath = {};
        const nodeMetas: Record<string, NodeMetadata> = {};
        const exposeNames: string[] = [];
        const i18nNodes: Array<{ name: string; i18nKey: string }> = [];
        const skeletonPaths: NodeIndexPath = {};

        indexPath['root'] = [];
        nodeMetas['root'] = {
            name: 'root',
            tag: root.tag,
            cls: root.cls,
            style: root.style,
            flex: root.flex,
            grid: root.grid,
            role: root.role,
            attrs: root.attrs,
            skeleton: root.skeleton,
        };

        if (root.skeleton) {
            skeletonPaths['root'] = [];
        }

        const children = root.children || [];
        const htmlParts: string[] = [];

        for (let i = 0; i < children.length; i++) {
            htmlParts.push(
                CompileEngine.compileNode(children[i], [i], {
                    indexPath,
                    nodeMetas,
                    exposeNames,
                    i18nNodes,
                    skeletonPaths,
                    logger,
                })
            );
        }

        return {
            html: htmlParts.join(''),
            indexPath,
            nodeMetas,
            exposeNames,
            i18nNodes,
            skeletonPaths,
        };
    }

    /**
     * 编译子树 — 局部编译入口
     *
     * 编译单个节点为 HTML + 元数据，不注册 root。
     * 用于 TemplateDeriver 替换子树场景。
     *
     * @param node - 子树根节点
     * @param logger - 日志器
     * @returns 编译中间产物（无 skeletonPaths）
     */
    static compileSubtree(node: TplNode, logger: any) {
        const indexPath: NodeIndexPath = {};
        const nodeMetas: Record<string, NodeMetadata> = {};
        const exposeNames: string[] = [];
        const i18nNodes: Array<{ name: string; i18nKey: string }> = [];

        const html = CompileEngine.compileNode(node, [], {
            indexPath,
            nodeMetas,
            exposeNames,
            i18nNodes,
            logger,
        });

        return { html, indexPath, nodeMetas, exposeNames, i18nNodes };
    }

    /**
     * 编译单节点 — 内部分派
     *
     * 根据 node.type 存在与否分派到 compileTypeNode 或 compileTagNode。
     * 嵌套超过 3 层时发出警告（建议拆分子组件）。
     */
    private static compileNode(node: TplNode, path: number[], ctx: any): string {
        if (path.length > 3) {
            ctx.logger.warn?.(
                `嵌套超过3层: ${node.name || node.tag}，路径 [${path}]，建议拆分为子组件`
            );
        }
        return node.type
            ? CompileEngine.compileTypeNode(node, path, ctx)
            : CompileEngine.compileTagNode(node, path, ctx);
    }

    /**
     * 编译组件类型节点 — type 节点
     *
     * 产出骨架占位 HTML（`<div class="q-skeleton"></div>`），
     * 将组件类引用存入 nodeMetas.componentClass。
     * type 为函数时直接引用，为字符串时从 window 解析。
     */
    private static compileTypeNode(node: TplNode, path: number[], ctx: any): string {
        const name = node.name!;

        ctx.indexPath[name] = path;

        const meta: NodeMetadata = {
            name,
            tag: node.tag,
            type: typeof node.type === 'string' ? node.type : undefined,
            cls: node.cls,
            contentMode: 'html',
            i18nKey: node.i18n,
            initConfig: node.initConfig,
        };

        if (typeof node.type === 'function') {
            meta.componentClass = node.type as any;
        } else if (typeof node.type === 'string') {
            meta.componentClass = (window as any)[node.type];
        }

        ctx.nodeMetas[name] = meta;
        ctx.exposeNames.push(name);

        if (node.i18n) {
            ctx.i18nNodes.push({ name, i18nKey: node.i18n });
        }

        ctx.skeletonPaths[name] = path;

        return '<div class="q-skeleton"></div>';
    }

    /**
     * 编译标签节点 — tag 节点
     *
     * 根据 tag 推导 contentMode，收集节点元数据，
     * 委托 buildTagHtml 生成 HTML。
     */
    private static compileTagNode(node: TplNode, path: number[], ctx: any): string {
        const tag = node.tag || 'div';

        if (node.name) {
            const name = node.name;

            ctx.indexPath[name] = path;

            const meta: NodeMetadata = {
                name,
                tag,
                contentMode: CompileEngine.inferContentMode(tag),
                i18nKey: node.i18n,
                cls: node.cls,
                style: node.style,
                flex: node.flex,
                grid: node.grid,
                hidden: node.hidden,
                hiddenMode: node.hiddenMode,
                role: node.role,
                attrs: node.attrs,
                skeleton: node.skeleton,
            };

            ctx.nodeMetas[name] = meta;
            ctx.exposeNames.push(name);

            if (node.i18n) {
                ctx.i18nNodes.push({ name, i18nKey: node.i18n });
            }

            if (node.skeleton) {
                ctx.skeletonPaths[name] = path;
            }
        }

        return CompileEngine.buildTagHtml(tag, node, path, ctx);
    }

    /**
     * 构建标签 HTML
     *
     * void 标签生成自闭合 `<tag />`，其余递归编译 children 后包裹开闭标签。
     */
    private static buildTagHtml(tag: string, node: TplNode, path: number[], ctx: any): string {
        if (VOID_TAGS.has(tag)) return `<${tag} />`;

        const inner: string[] = [];
        if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                inner.push(CompileEngine.compileNode(node.children[i], [...path, i], ctx));
            }
        }
        return `<${tag}>${inner.join('')}</${tag}>`;
    }

    /**
     * 推导内容操作模式
     *
     * 根据 tag 名推导节点的内容操作方式：
     * - input/select/textarea → 'value'（读写 value 属性）
     * - img → 'src'（读写 src 属性）
     * - a → 'link'（读写 text + href）
     * - 其余 → 'html'（读写 innerHTML）
     */
    private static inferContentMode(tag?: string): 'value' | 'src' | 'html' | 'link' {
        if (!tag) return 'html';
        const t = tag.toLowerCase();
        if (t === 'input' || t === 'select' || t === 'textarea') return 'value';
        if (t === 'img') return 'src';
        if (t === 'a') return 'link';
        return 'html';
    }
}
