/**
 * template-compiler.ts — 模板编译
 *
 * compilePendingTemplate: 编译 + 应用到构造函数
 * findByPath: 索引路径定位元素
 */

import type { TplNode } from '../types/tpl-node-types';
import type { NodeMetadata, NodeIndexPath } from '../types/compiled-types';
import type { BodyDef } from '../types/tpl-body';
import { VOID_TAGS } from './template-constants';
import { BODY_SPECIAL_KEYS } from '../types/tpl-body-def';
import { applyChildNodeProps } from './child-node-props';
import { ComponentError, KernelErrorCode } from '@/error';

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

    applyBody(ctor, body);

    applyChildNodeProps(ctor, result.nodeMetas, result.i18nNodes);

    ctor._templateCompiled = true;
}

// ══════════════════════════════════════════════════════════════
// 预处理：展开 fragment 为普通 children
// ══════════════════════════════════════════════════════════════

function expandFragments(node: TplNode, ns?: string): TplNode {
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

export function findByPath(root: HTMLElement, path: number[]): HTMLElement | null {
    let current: Element = root;
    for (const idx of path) {
        if (!current.children[idx]) return null;
        current = current.children[idx];
    }
    return current as HTMLElement;
}

// ══════════════════════════════════════════════════════════════
// 内部：compileTemplate
// ══════════════════════════════════════════════════════════════

function compileTemplate(root: TplNode, logger: any) {
    const indexPath: NodeIndexPath = {};
    const nodeMetas: Record<string, NodeMetadata> = {};
    const exposeNames: string[] = [];
    const i18nNodes: Array<{ name: string; i18nKey: string }> = [];

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
        events: root.events,
    };

    const children = root.children || [];
    const htmlParts: string[] = [];

    for (let i = 0; i < children.length; i++) {
        htmlParts.push(
            compileNode(children[i], [i], { indexPath, nodeMetas, exposeNames, i18nNodes, logger })
        );
    }

    return { html: htmlParts.join(''), indexPath, nodeMetas, exposeNames, i18nNodes };
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
        contentMode: 'html',
        i18nKey: node.i18n,
        events: node.events,
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
            events: node.events,
            cls: node.cls,
            style: node.style,
            flex: node.flex,
            grid: node.grid,
            hidden: node.hidden,
            hiddenMode: node.hiddenMode,
            role: node.role,
            attrs: node.attrs,
        };

        ctx.nodeMetas[name] = meta;
        ctx.exposeNames.push(name);

        if (node.i18n) {
            ctx.i18nNodes.push({ name, i18nKey: node.i18n });
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
// 内部：applyBody
// ══════════════════════════════════════════════════════════════

const BODY_KEY_SET = new Set(Object.keys(BODY_SPECIAL_KEYS));

function validateBodyKey(key: string): void {
    if (BODY_KEY_SET.has(key)) return;

    if (key.startsWith('on') && key.length > 2) return;

    const ch = key[0];
    if (ch === '_' || ch === '$') return;

    throw new ComponentError(
        `Body 不支持纯数据字段 "${key}"。默认属性值写在 TplNode，实例状态用 _applyState 模式。`,
        KernelErrorCode.COMPONENT_BODY_INVALID_FIELD,
        { field: key }
    );
}

function applyBody(ctor: any, body: Record<string, any> | undefined): void {
    if (!body) return;

    const proto = ctor.prototype;
    const descs = Object.getOwnPropertyDescriptors(body);
    for (const [key, desc] of Object.entries(descs)) {
        validateBodyKey(key);
        const def = BODY_SPECIAL_KEYS[key];

        if (def?.category === 'static') {
            const targetKey = def.alias ?? key;
            const staticKey = key === 'forwards' ? '_forwards' : targetKey;
            ctor[staticKey] = desc.value;
        } else if (def?.category === 'init') {
            ctor[`_${key}`] = desc.value;
        } else if (def?.category === 'hook') {
            proto[key] = desc.value;
        } else if (desc.get || desc.set) {
            Object.defineProperty(proto, key, desc);
        } else if (typeof desc.value === 'function') {
            proto[key] = desc.value;
        }
    }
}
