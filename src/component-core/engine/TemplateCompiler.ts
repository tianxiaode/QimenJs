/**
 * TemplateCompiler — 模板编译引擎
 *
 * 纯函数引擎：把 TplNode 编译为编译产物
 * 输入：tpl (TplNode)
 * 输出：{ cache: CompiledTemplateCache, nodeMetas: Record<string, NodeMetadata> }
 *
 * cache 是只读可共享部分，nodeMetas 是每类独立部分
 */

import type { TplNode } from '../types/tpl-node-types';
import type { NodeMetadata, NodeIndexPath, CompiledTemplateCache } from '../types/compiled-types';
import type { BodyDef } from '../types/tpl-body';
import { applyChildNodeProps } from './ChildNodeProps';
import { Logger } from '@/logger';

// ══════════════════════════════════════════════════════════════
// 常量
// ══════════════════════════════════════════════════════════════

export const VOID_TAGS = new Set([
    'input',
    'img',
    'br',
    'hr',
    'col',
    'area',
    'base',
    'embed',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]);

// ══════════════════════════════════════════════════════════════
// 预处理：展开 fragment 为普通 children
// ══════════════════════════════════════════════════════════════

export function expandFragments(node: TplNode, ns?: string): TplNode {
    let result = { ...node };

    if (ns && result.name) {
        result.name = `${ns}:${result.name}`;
    }

    if (result.fragment) {
        const fragmentNs = result.fragment.name;
        result.children = result.fragment.children.map(child => expandFragments(child, fragmentNs));
        delete result.fragment;
    }

    if (result.children) {
        result.children = result.children.map(child => expandFragments(child, ns));
    }

    return result;
}

// ══════════════════════════════════════════════════════════════
// 工具：路径查找
// ══════════════════════════════════════════════════════════════

export function findByPath(root: HTMLElement, path: number[]): HTMLElement | null {
    let current: Element = root;
    for (const idx of path) {
        if (!current.children[idx]) return null;
        current = current.children[idx];
    }
    return current as HTMLElement;
}

// ══════════════════════════════════════════════════════════════
// 核心编译
// ══════════════════════════════════════════════════════════════

export function compileSubtree(node: TplNode, logger: any) {
    const indexPath: NodeIndexPath = {};
    const nodeMetas: Record<string, NodeMetadata> = {};
    const exposeNames: string[] = [];
    const i18nNodes: Array<{ name: string; i18nKey: string }> = [];

    const html = compileNode(node, [], { indexPath, nodeMetas, exposeNames, i18nNodes, logger });

    return { html, indexPath, nodeMetas, exposeNames, i18nNodes };
}

export function compileTemplate(root: TplNode, logger: any) {
    const indexPath: NodeIndexPath = {};
    const nodeMetas: Record<string, NodeMetadata> = {};
    const exposeNames: string[] = [];
    const i18nNodes: Array<{ name: string; i18nKey: string }> = {};
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
            compileNode(children[i], [i], {
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

function compileNode(node: TplNode, path: number[], ctx: any): string {
    if (path.length > 3) {
        ctx.logger.warn?.(
            `嵌套超过3层: ${node.name || node.tag}，路径 [${path}]，建议拆分为子组件`
        );
    }
    return node.type ? compileTypeNode(node, path, ctx) : compileTagNode(node, path, ctx);
}

function compileTypeNode(node: TplNode, path: number[], ctx: any): string {
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

    return '<div></div>';
}

function compileTagNode(node: TplNode, path: number[], ctx: any): string {
    const tag = node.tag || 'div';

    if (node.name) {
        const name = node.name;

        ctx.indexPath[name] = path;

        const meta: NodeMetadata = {
            name,
            tag,
            contentMode: inferContentMode(tag),
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

    return buildTagHtml(tag, node, path, ctx);
}

function buildTagHtml(tag: string, node: TplNode, path: number[], ctx: any): string {
    if (VOID_TAGS.has(tag)) return `<${tag} />`;

    const inner: string[] = [];
    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            inner.push(compileNode(node.children[i], [...path, i], ctx));
        }
    }
    return `<${tag}>${inner.join('')}</${tag}>`;
}

function inferContentMode(tag?: string): 'value' | 'src' | 'html' | 'link' {
    if (!tag) return 'html';
    const t = tag.toLowerCase();
    if (t === 'input' || t === 'select' || t === 'textarea') return 'value';
    if (t === 'img') return 'src';
    if (t === 'a') return 'link';
    return 'html';
}

// ══════════════════════════════════════════════════════════════
// 遗留兼容：编译 + 绑定到构造函数
// ══════════════════════════════════════════════════════════════

export function compilePendingTemplate(ctor: any, tpl: TplNode, logger: any, body?: BodyDef): void {
    const expandedTpl = expandFragments(tpl);

    const result = compileTemplate(expandedTpl, logger);

    const tplEl = document.createElement('template');
    tplEl.innerHTML = result.html;

    ctor._compiledTemplate = {
        ...result,
        templateCache: tplEl,
        body,
    };

    ctor._nodeMetas = result.nodeMetas;
    ctor._i18nNodes = result.i18nNodes;

    applyChildNodeProps(ctor, result.nodeMetas, result.i18nNodes);

    ctor._templateCompiled = true;
}

// ══════════════════════════════════════════════════════════════
// TemplateCompiler 类
// ══════════════════════════════════════════════════════════════

export interface CompileResult {
    cache: CompiledTemplateCache;
    nodeMetas: Record<string, NodeMetadata>;
}

export class TemplateCompiler {
    static compile(tpl: TplNode, owner?: any): CompileResult {
        const expandedTpl = expandFragments(tpl);
        const result = compileTemplate(expandedTpl, Logger.for(owner?.constructor));

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
}
