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
 *   - 预处理：expandFragments 将 fragment 展开为普通 children
 *   - 缓存：通过模板对象引用缓存编译产物
 *   - 不负责：DOM 路径查找（→ utils/dom-path）
 *
 * @module CompileEngine
 *
 * @example
 * ```ts
 * // 编译简单模板
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
 * // 自动缓存编译产物，相同模板对象共享缓存
 * ```
 *
 * @remarks
 * ## 编译流程
 * 1. **查找缓存**：通过模板对象引用查找已编译产物
 * 2. **展开 Fragment**：将 fragment 节点展开为普通 children
 * 3. **生成 HTML**：递归遍历节点树生成 HTML 字符串
 * 4. **收集元数据**：为每个命名节点生成 NodeMetadata
 * 5. **构建缓存**：创建可复用的 CompiledTemplateCache
 * 6. **缓存产物**：将编译产物与模板对象绑定
 *
 * ## 节点类型
 * - **type 节点**：组件类型节点，生成骨架占位 HTML
 * - **tag 节点**：原生标签节点，直接生成 HTML
 *
 * ## 属性分类
 * - **htmlProps**：DEFAULT_NODE_PROP_MAP 中定义的属性
 * - **attrs**：其他自定义属性
 * - **config**：节点配置属性（name、tag、cls等）
 */

import type { TplNode } from '../types/tpl-node-types';
import type { NodeMetadata, NodeIndexPath, CompiledTemplateCache } from '../types/compiled-types';
import type { CompileResult } from '../types/compile-engine-types';
import { copyMetaFields, collectExtraFields } from '../types/tpl-node-def';
import { DEFAULT_NODE_PROP_MAP } from '../types/common-props';
import { VOID_TAGS } from '../constants/compile-constants';
import { SKELETON_CLS } from '../constants/compile-constants';
import { Logger } from '@/logger';
import { NodeMapManager } from '../NodeMapManager';
import type { INodeMapManager } from '../types/node-map-manager-types';

const I18N_PREFIX = 'i18n:';

/** 编译引擎，将 TplNode 编译为编译产物（cache + nodeMetas） */
export class CompileEngine {
    /** 模板编译产物缓存（通过模板对象引用） */
    private static tplCache = new Map<TplNode, CompileResult>();

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
     * // cache: 只读可共享（html, indexPath, exposeNames, i18nNodes, templateCache）
     * // nodeMetas: 每类独立（运行时附加 el/component）
     * ```
     *
     * @remarks
     * - cache.html 可用于多次创建 DOM 元素
     * - cache.templateCache 是预解析的 template 元素
     * - nodeMetas 在运行时会被附加 el 和 component 引用
     */
    static compile(tpl: TplNode, owner?: any): CompileResult {
        const expandedTpl = CompileEngine.expandFragments(tpl);
        const loggerOwner = owner?.constructor ?? undefined;
        const logger = loggerOwner ? Logger.for(loggerOwner) : Logger.for('CompileEngine');
        const result = CompileEngine.compileTemplate(expandedTpl, logger);

        const tplEl = document.createElement('template');
        tplEl.innerHTML = result.html;

        const cache: CompiledTemplateCache = {
            html: result.html,
            indexPath: result.indexPath,
            exposeNames: result.exposeNames,
            i18nNodes: result.i18nNodes,
            permissionNodes: result.permissionNodes,
            templateCache: tplEl,
        };

        const nodeMetas = result.nodeMetas;

        return { cache, nodeMetas };
    }

    /**
     * 收集模板中的组件依赖 — 用于CSS按需打包
     *
     * 遍历模板树，收集所有 type 字段引用的组件类，
     * 并递归收集子组件模板中的依赖。
     *
     * @param tpl - 模板节点
     * @returns 组件类集合
     *
     * @example
     * ```ts
     * const deps = CompileEngine.collectDependencies(tpl);
     * // deps: Set<Function> { ButtonComponent, IconComponent }
     * ```
     */
    static collectDependencies(tpl: TplNode): Set<Function> {
        const deps = new Set<Function>();
        this._collectDeps(tpl, deps);
        return deps;
    }

    private static _collectDeps(node: TplNode, deps: Set<Function>): void {
        if (node.type && typeof node.type !== 'string') {
            const componentClass = node.type as Function;
            deps.add(componentClass);

            const childTpl = (componentClass as any).template || (componentClass as any).tpl;
            if (childTpl) {
                this._collectDeps(childTpl, deps);
            }
        }

        if (node.children) {
            for (const child of node.children) {
                this._collectDeps(child, deps);
            }
        }

        if (node.fragment?.children) {
            for (const child of node.fragment.children) {
                this._collectDeps(child, deps);
            }
        }
    }

    /**
     * 创建节点映射管理器（通过模板对象）
     *
     * @param component - 组件实例
     * @param tpl - 模板定义
     * @returns NodeMapManager 实例
     *
     * @example
     * ```ts
     * const tpl = { tag: 'div', name: 'root' };
     * const mgr = CompileEngine.createNodeMapManagerByTpl(component, tpl);
     * ```
     */
    static createNodeMapManagerByTpl(component: any, tpl: TplNode): INodeMapManager {
        let compiled = this.tplCache.get(tpl);

        if (!compiled) {
            compiled = CompileEngine.compile(tpl, component?.constructor);
            this.tplCache.set(tpl, compiled);
        }

        return new NodeMapManager(compiled.cache, compiled.nodeMetas, component);
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
     * @returns 编译中间产物 { html, indexPath, nodeMetas, exposeNames, i18nNodes }
     *
     * @example
     * ```ts
     * const result = CompileEngine.compileTemplate(expandedTpl, logger);
     * // result.html: '<div class="title">...</div>'
     * // result.indexPath: { root: [], title: [0] }
     * // result.nodeMetas: { root: {...}, title: {...} }
     * ```
     *
     * @remarks
     * - 根节点会被注册为 'root'，indexPath 为空数组 []
     * - 子节点按 children 数组索引注册路径
     */
    static compileTemplate(root: TplNode, logger: any) {
        const indexPath: NodeIndexPath = {};
        const nodeMetas: Record<string, NodeMetadata> = {};
        const exposeNames: string[] = [];
        const i18nNodes: Array<{ name: string; field?: string; i18nKey: string }> = [];
        const permissionNodes: Array<{ name: string; permission: boolean | string }> = [];

        indexPath['root'] = [];
        const rootMeta = copyMetaFields<NodeMetadata>(root, {
            name: 'root',
            tag: root.tag,
        });
        CompileEngine._collectExtraFields(root, 'root', rootMeta, i18nNodes);
        if (rootMeta.i18nKey) {
            i18nNodes.push({ name: 'root', i18nKey: rootMeta.i18nKey });
        }
        nodeMetas['root'] = rootMeta;

        const children = root.children || [];
        const htmlParts: string[] = [];

        for (let i = 0; i < children.length; i++) {
            htmlParts.push(
                CompileEngine.compileNode(children[i], [i], {
                    indexPath,
                    nodeMetas,
                    exposeNames,
                    i18nNodes,
                    permissionNodes,
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
            permissionNodes,
        };
    }

    /**
     * 编译单节点 — 内部分派
     *
     * 根据 node.type 存在与否分派到 compileTypeNode 或 compileTagNode。
     * 嵌套超过 3 层时发出警告（建议拆分子组件）。
     *
     * @param node - 当前编译的节点
     * @param path - 节点在树中的路径（索引数组）
     * @param ctx - 编译上下文，包含 indexPath、nodeMetas、exposeNames 等
     * @returns 生成的 HTML 字符串
     *
     * @example
     * ```ts
     * // type 节点
     * const html = compileNode({ name: 'icon', type: IconComponent }, [0], ctx);
     * // 返回: '<div class="q-skeleton"></div>'
     *
     * // tag 节点
     * const html = compileNode({ name: 'title', tag: 'h1' }, [1], ctx);
     * // 返回: '<h1></h1>'
     * ```
     *
     * @remarks
     * - 嵌套超过 3 层会输出警告，建议拆分子组件
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
     *
     * @param node - 包含 type 属性的节点
     * @param path - 节点路径
     * @param ctx - 编译上下文
     * @returns 骨架占位 HTML 字符串
     *
     * @example
     * ```ts
     * // 函数引用
     * compileTypeNode({ name: 'icon', type: IconComponent }, [0], ctx);
     * // 返回: '<div class="q-skeleton"></div>'
     * // nodeMetas.icon.componentClass = IconComponent
     *
     * // 字符串引用
     * compileTypeNode({ name: 'icon', type: 'IconComponent' }, [0], ctx);
     * // 从 window.IconComponent 解析组件类
     * ```
     *
     * @remarks
     * - 生成的骨架 HTML 用于运行时定位和替换
     * - 组件实例化后会替换骨架元素
     */
    private static compileTypeNode(node: TplNode, path: number[], ctx: any): string {
        const name = node.name!;

        ctx.indexPath[name] = path;

        const meta = copyMetaFields<NodeMetadata>(node, {
            name,
            tag: node.tag,
            type: typeof node.type === 'string' ? node.type : undefined,
            contentMode: 'html',
        });
        meta.cls = appendCls(node.cls, SKELETON_CLS);

        if (typeof node.type === 'function') {
            meta.componentClass = node.type as any;
        } else if (typeof node.type === 'string') {
            meta.componentClass = (window as any)[node.type];
        }

        CompileEngine._collectExtraFields(node, name, meta, ctx.i18nNodes);

        if (meta.i18nKey) {
            ctx.i18nNodes.push({ name, i18nKey: meta.i18nKey });
        }

        ctx.nodeMetas[name] = meta;
        ctx.exposeNames.push(name);

        if (node.permission) {
            ctx.permissionNodes.push({ name, permission: node.permission });
        }

        return `<div class="${SKELETON_CLS}"></div>`;
    }

    /**
     * 编译标签节点 — tag 节点
     *
     * 根据 tag 推导 contentMode，收集节点元数据，
     * 委托 buildTagHtml 生成 HTML。
     *
     * @param node - 包含 tag 属性的节点
     * @param path - 节点路径
     * @param ctx - 编译上下文
     * @returns 生成的 HTML 字符串
     *
     * @example
     * ```ts
     * compileTagNode({ name: 'title', tag: 'h1' }, [0], ctx);
     * // 返回: '<h1></h1>'
     * // nodeMetas.title.contentMode = 'html'
     *
     * compileTagNode({ name: 'input', tag: 'input' }, [1], ctx);
     * // 返回: '<input />'
     * // nodeMetas.input.contentMode = 'value'
     * ```
     *
     * @remarks
     * - 自动推导 contentMode：input/value/select → 'value', img → 'src', a → 'link'
     * - 无 name 的节点不会注册到 nodeMetas
     */
    private static compileTagNode(node: TplNode, path: number[], ctx: any): string {
        const tag = node.tag || 'div';

        if (node.name) {
            const name = node.name;

            ctx.indexPath[name] = path;

            const meta = copyMetaFields<NodeMetadata>(node, {
                name,
                tag,
                contentMode: CompileEngine.inferContentMode(tag),
            });

            CompileEngine._collectExtraFields(node, name, meta, ctx.i18nNodes);

            if (meta.i18nKey) {
                ctx.i18nNodes.push({ name, i18nKey: meta.i18nKey });
            }

            ctx.nodeMetas[name] = meta;
            ctx.exposeNames.push(name);

            if (node.permission) {
                ctx.permissionNodes.push({ name, permission: node.permission });
            }
        }

        return CompileEngine.buildTagHtml(tag, node, path, ctx);
    }

    /**
     * 构建标签 HTML
     *
     * void 标签生成自闭合 `<tag />`，其余递归编译 children 后包裹开闭标签。
     *
     * @param tag - 标签名
     * @param node - 节点对象
     * @param path - 节点路径
     * @param ctx - 编译上下文
     * @returns 生成的 HTML 字符串
     *
     * @example
     * ```ts
     * // void 标签
     * buildTagHtml('input', { tag: 'input' }, [0], ctx);
     * // 返回: '<input />'
     *
     * // 带子节点的标签
     * buildTagHtml('div', { tag: 'div', children: [...] }, [1], ctx);
     * // 返回: '<div>...</div>'
     * ```
     *
     * @remarks
     * - void 标签包括：area, base, br, col, embed, hr, img, input, link, meta, param, source, track, wbr
     */
    private static buildTagHtml(tag: string, node: TplNode, path: number[], ctx: any): string {
        const attrStr = CompileEngine._buildStaticAttrs(node);

        if (VOID_TAGS.has(tag)) return attrStr ? `<${tag} ${attrStr} />` : `<${tag} />`;

        const inner: string[] = [];
        if (node.text) {
            inner.push(escapeHtml(node.text));
        }
        if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                inner.push(CompileEngine.compileNode(node.children[i], [...path, i], ctx));
            }
        }
        return attrStr
            ? `<${tag} ${attrStr}>${inner.join('')}</${tag}>`
            : `<${tag}>${inner.join('')}</${tag}>`;
    }

    /**
     * 构建节点的静态 HTML 属性字符串
     *
     * 将模板中声明的 cls、hidden、attrs 等属性渲染为 HTML 属性，
     * 确保编译产物包含这些静态属性，无需运行时二次应用。
     *
     * @param node - 模板节点
     * @returns HTML 属性字符串（如 'class="q-hero__title" hidden'），无属性时返回空字符串
     */
    private static _buildStaticAttrs(node: TplNode): string {
        const parts: string[] = [];

        if (node.cls) {
            parts.push(`class="${escapeHtml(node.cls)}"`);
        }

        if (node.hidden) {
            parts.push('hidden');
        }

        if (node.attrs && typeof node.attrs === 'object') {
            for (const [key, val] of Object.entries(node.attrs as Record<string, any>)) {
                if (val === true) {
                    parts.push(escapeHtml(key));
                } else if (val !== false && val != null) {
                    parts.push(`${escapeHtml(key)}="${escapeHtml(String(val))}"`);
                }
            }
        }

        if (node.role) {
            parts.push(`role="${escapeHtml(node.role)}"`);
        }

        return parts.join(' ');
    }

    /**
     * 收集剩余字段并分类存入 meta
     *
     * tag 节点：按 DEFAULT_NODE_PROP_MAP 分为 htmlProps 和 attrs
     * type 节点：全部存入 meta.props
     * 同时扫描 i18n: 前缀的值，收录到 i18nNodes
     */
    private static _collectExtraFields(
        node: TplNode,
        name: string,
        meta: NodeMetadata,
        i18nNodes: Array<{ name: string; field?: string; i18nKey: string }>
    ): void {
        const extra = collectExtraFields(node as Record<string, any>);
        if (Object.keys(extra).length === 0) return;

        const isComponent = !!node.type;

        if (isComponent) {
            meta.props = extra;
            for (const [key, val] of Object.entries(extra)) {
                if (typeof val === 'string' && val.startsWith(I18N_PREFIX)) {
                    i18nNodes.push({ name, field: key, i18nKey: val.slice(I18N_PREFIX.length) });
                }
            }
        } else {
            const htmlProps: Record<string, any> = {};
            const attrs: Record<string, any> = {};
            for (const [key, val] of Object.entries(extra)) {
                if (typeof val === 'string' && val.startsWith(I18N_PREFIX)) {
                    i18nNodes.push({ name, field: key, i18nKey: val.slice(I18N_PREFIX.length) });
                }
                if (DEFAULT_NODE_PROP_MAP[key]) {
                    htmlProps[key] = val;
                } else {
                    attrs[key] = val;
                }
            }
            if (Object.keys(htmlProps).length > 0) meta.htmlProps = htmlProps;
            if (Object.keys(attrs).length > 0) meta.attrs = { ...meta.attrs, ...attrs };
        }
    }

    /**
     * 推导内容操作模式
     *
     * 根据 tag 名推导节点的内容操作方式：
     * - input/select/textarea → 'value'（读写 value 属性）
     * - img → 'src'（读写 src 属性）
     * - a → 'link'（读写 text + href）
     * - 其余 → 'html'（读写 innerHTML）
     *
     * @param tag - 标签名（可选）
     * @returns 内容操作模式
     *
     * @example
     * ```ts
     * inferContentMode('input');   // 'value'
     * inferContentMode('img');     // 'src'
     * inferContentMode('a');       // 'link'
     * inferContentMode('div');     // 'html'
     * inferContentMode();          // 'html'
     * ```
     *
     * @remarks
     * - 返回值决定 ChildNodePropsEngine 生成的属性类型
     * - 'link' 模式会生成 text 和 href 两个属性
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

function appendCls(cls: string | undefined, extra: string): string {
    return cls ? `${cls} ${extra}` : extra;
}

/**
 * HTML 转义 — 防止 text 内容中的特殊字符破坏 HTML 结构
 *
 * @param str - 原始字符串
 * @returns 转义后的安全 HTML 字符串
 */
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
