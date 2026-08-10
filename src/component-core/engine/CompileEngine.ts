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
 *   - 编译：TplNode → HTML + indexPath + nodeMetas + exposeNames + i18nNodes
 *   - 缓存：通过模板对象引用缓存编译产物
 *   - 节点分解委托给 DecomposeEngine
 *   - fragment 展开在递归编译中内联处理（无需预处理）
 *
 * @module CompileEngine
 *
 * @example
 * ```ts
 * const tpl = {
 *   tag: 'div',
 *   name: 'root',
 *   children: [
 *     { name: 'title', tag: 'h1' },
 *     { name: 'content', tag: 'p' }
 *   ]
 * };
 *
 * const mgr = CompileEngine.createNodeMapManagerByTpl(component, tpl);
 * ```
 *
 * @remarks
 * ## 编译流程（单次递归遍历）
 * 1. **查找缓存**：通过模板对象引用查找已编译产物
 * 2. **递归编译**：调用 DecomposeEngine.decompose 分解每个节点
 *    - fragment 在递归中内联展开为 children（无需预处理）
 *    - 有 name 的节点注册到 nodeMetas
 *    - 各节点 HTML 通过占位符 `<!--q-children-->` 组合为整体模板
 * 3. **预编译缓存**：创建 HTMLTemplateElement 并缓存产物
 */

import type { TplDecl } from '../types/tpl';
import type {
    CompiledTemplateCache,
    CompiledTemplateResult,
    CompileContext,
} from '../types/compiled';
import type { CompileResult } from '../types/compile-engine-types';
import { DecomposeEngine } from './DecomposeEngine';

/** 子节点占位符 — DecomposeEngine 在有 children 时预留，CompileEngine 递归后替换 */
const CHILDREN_PLACEHOLDER = '<!--q-children-->';

/** 编译引擎，将 TplNode 编译为编译产物（cache + nodeMetas） */
export class CompileEngine {
    /** 模板编译产物缓存（通过模板对象引用） */
    private static tplCache = new Map<TplDecl, CompileResult>();

    /**
     * 编译模板 — 主入口
     *
     * 完整编译管线：compileTemplate → 构建 CompileResult
     *
     * @param tpl - 原始模板节点（可含 fragment）
     * @returns CompileResult { cache, nodeMetas }
     *
     * @example
     * ```ts
     * const { cache, nodeMetas } = CompileEngine.compile(tpl);
     * // cache: 只读可共享（html, indexPath, exposeNames, i18nNodes, templateCache）
     * // nodeMetas: 每类独立（运行时附加 el/component）
     * ```
     */
    static compile(tpl: TplDecl): CompileResult {
        const cached = this.tplCache.get(tpl);
        if (cached) return cached;

        const result = this.compileTemplate(tpl);

        this.tplCache.set(tpl, result);
        return result;
    }

    /**
     * 编译模板 — 核心编译（单次递归遍历）
     *
     * 递归遍历节点树，调用 DecomposeEngine.decompose 分解每个节点，
     * fragment 在递归中内联展开，有 name 的节点注册到 nodeMetas，
     * 各节点 HTML 通过占位符组合为整体模板。
     *
     * @param root - 模板根节点（可含 fragment）
     * @returns 编译产物 { html, indexPath, nodeMetas, exposeNames, i18nNodes, permissionNodes }
     *
     * @remarks
     * - 根节点强制注册为 'root'，indexPath 为空数组 []
     * - 子节点按 children 数组索引注册路径
     * - fragment.children 替代 node.children，fragment.name 作为命名空间前缀
     */
    static compileTemplate(root: TplDecl): CompiledResult {
        const ctx: CompileContext = {
            indexPath: {},
            nodeMetas: {},
            exposeNames: [],
            i18nNodes: {},
            permissionNodes: {},
            nodeAttributesMap: {},
            options: {},
        };

        // 根节点注册为 'root'
        ctx.indexPath['root'] = [];
        const rootResult = DecomposeEngine.decompose(root);
        rootResult.meta.name = 'root';
        ctx.nodeMetas['root'] = rootResult.meta;
        ctx.nodeAttributesMap['root'] = rootResult.nodeAttributes;
        if (rootResult.i18n) {
            ctx.i18nNodes['root'] = rootResult.i18n;
        }
        // 收集根节点权限
        if (rootResult.permission) {
            ctx.permissionNodes['root'] = rootResult.permission;
        }

        // 确定 children（fragment 内联展开）
        const { children, childNs } = CompileEngine.resolveChildren(root, undefined);

        // 递归编译 children
        const childHtmls: string[] = [];
        for (let i = 0; i < children.length; i++) {
            childHtmls.push(CompileEngine.compileNode(children[i], [i], ctx, childNs));
        }

        // 替换占位符
        const html = rootResult.html.replace(CHILDREN_PLACEHOLDER, childHtmls.join(''));

        return {
            html,
            indexPath: ctx.indexPath,
            nodeMetas: ctx.nodeMetas,
            exposeNames: ctx.exposeNames,
            i18nNodes: ctx.i18nNodes,
            permissionNodes: ctx.permissionNodes,
            nodeAttributesMap: ctx.nodeAttributesMap
            options:,
        };
    }

    /**
     * 编译单节点 — 递归核心
     *
     * 调用 DecomposeEngine.decompose 分解节点，注册元数据，
     * fragment 内联展开，递归 children 并通过占位符组合 HTML。
     *
     * @param node - 当前编译的节点
     * @param path - 节点在树中的路径（索引数组）
     * @param ctx - 编译上下文
     * @param ns - 命名空间前缀（来自 fragment.name，递归内部使用）
     * @returns 生成的 HTML 字符串
     */
    private static compileNode(
        node: TplDecl,
        path: number[],
        ctx: CompileContext,
        ns?: string
    ): string {
        // 1. 应用命名空间前缀
        const effectiveNode = ns && node.name ? { ...node, name: `${ns}:${node.name}` } : node;

        // 2. 调用 DecomposeEngine 分解节点
        const result = DecomposeEngine.decompose(effectiveNode);

        // 3. 有 name → 注册到 nodeMap
        if (result.hasName && result.name) {
            ctx.indexPath[result.name] = path;
            ctx.nodeMetas[result.name] = result.meta;
            ctx.exposeNames.push(result.name);
            if (result.i18n) {
                ctx.i18nNodes[result.name] = result.i18n;
            }
            if (result.permission) {
                ctx.permissionNodes[result.name] = result.permission;
            }
        }

        // 4. 组件节点返回骨架占位，不递归 children
        if (result.isComponent) {
            return result.html;
        }

        // 7. 确定 children（fragment 内联展开）
        const { children, childNs } = CompileEngine.resolveChildren(node, ns);

        // 8. 递归 children 并替换占位符
        if (children.length > 0) {
            const childHtmls: string[] = [];
            for (let i = 0; i < children.length; i++) {
                childHtmls.push(CompileEngine.compileNode(children[i], [...path, i], ctx, childNs));
            }
            return result.html.replace(CHILDREN_PLACEHOLDER, childHtmls.join(''));
        }

        return result.html;
    }

    /**
     * 解析节点的 children — fragment 内联展开
     *
     * 如果节点有 fragment，将 fragment.children 作为 children，
     * fragment.name 作为子节点的命名空间前缀。
     * 否则使用 node.children，继承父级的命名空间。
     *
     * @param node - 模板节点
     * @param parentNs - 父级命名空间前缀
     * @returns children 数组和子节点命名空间前缀
     */
    private static resolveChildren(
        node: TplDecl,
        parentNs?: string
    ): {
        children: TplDecl[];
        childNs?: string;
    } {
        if (node.fragment) {
            return {
                children: node.fragment.children,
                childNs: node.fragment.name,
            };
        }
        return {
            children: node.children || [],
            childNs: parentNs,
        };
    }

    /**
     * 创建模板元素 — 预编译 HTML 到 HTMLTemplateElement
     *
     * @param html - HTML 字符串
     * @returns 预编译的模板元素（可 cloneNode 复用）
     */
    private static createTemplateElement(html: string): HTMLTemplateElement {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template;
    }
}
