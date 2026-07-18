/**
 * template-json.ts — 新模板编译
 *
 * 核心函数 compileTemplate：
 * 递归遍历 TplNode 树，产出纯结构 HTML + 元数据。
 * HTML 只含标签结构，所有样式/属性/文本由运行时通过 DOM API 应用。
 */

import type { TplNode, ComponentTemplate, ContentInfo, DomEventBinding } from './types/template';
import type { NodeIndexPath, NodeTemplateMeta } from './types/index';
import type { CompiledTemplateResult } from './types/template-json';
import { META_COPY_KEYS, ROOT_COPY_KEYS, TPL_NODE_FIELDS } from './types/tpl-node-def';

const META_KEY_MAP: Record<string, string> = {};
for (const def of TPL_NODE_FIELDS) {
    if (def.toMeta && def.metaKey) META_KEY_MAP[def.field] = def.metaKey;
}

const VOID_TAGS = new Set([
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

function inferMode(tag?: string): 'value' | 'src' | 'html' {
    if (!tag) return 'html';
    const t = tag.toLowerCase();
    if (t === 'input' || t === 'select' || t === 'textarea') return 'value';
    if (t === 'img') return 'src';
    return 'html';
}

export function compileTemplate(template: ComponentTemplate): CompiledTemplateResult {
    const indexPath: NodeIndexPath = {};
    const templateMetas: Record<string, NodeTemplateMeta> = {};
    const contentPropNames: string[] = [];
    const contentInfos: ContentInfo[] = [];
    const componentMap: Record<string, new (props?: Record<string, any>) => any> = {};
    const domEventBindings: DomEventBinding[] = [];

    const root = template.tpl;
    const children = root.children || [];
    const htmlParts: string[] = [];

    for (let i = 0; i < children.length; i++) {
        htmlParts.push(
            compileNode(children[i], [i], {
                indexPath,
                templateMetas,
                contentPropNames,
                contentInfos,
                componentMap,
                domEventBindings,
            })
        );
    }

    const exposeNames: string[] = [];
    for (const info of contentInfos) {
        if (info.propName) exposeNames.push(info.propName);
    }

    const result: any = {
        html: htmlParts.join(''),
        indexPath,
        templateMetas,
        contentPropNames,
        contentInfos,
        componentMap,
        domEventBindings,
        exposeNames,
        propsDef: template.props,
    };
    copyRootFields(root, result);

    return result as CompiledTemplateResult;
}

interface CompileContext {
    indexPath: NodeIndexPath;
    templateMetas: Record<string, NodeTemplateMeta>;
    contentPropNames: string[];
    contentInfos: ContentInfo[];
    componentMap: Record<string, new (props?: Record<string, any>) => any>;
    domEventBindings: DomEventBinding[];
}

function compileNode(node: TplNode, path: number[], ctx: CompileContext): string {
    return node.type ? compileTypeNode(node, path, ctx) : compileTagNode(node, path, ctx);
}

function compileTypeNode(node: TplNode, path: number[], ctx: CompileContext): string {
    const name = node.name!;

    ctx.indexPath[name] = path;
    collectComponentMap(node, name, ctx);

    ctx.templateMetas[name] = {
        name,
        jsonRef: typeof node.type === 'string' ? node.type : (node.type as any).name || 'Anonymous',
        jsonMode: node.replace !== undefined ? (node.replace ? 'replace' : 'child') : undefined,
        mode: 'html',
    };
    copyMetaFields(node, ctx.templateMetas[name]);

    ctx.contentPropNames.push(name);

    ctx.contentInfos.push({
        name,
        mode: 'html',
        i18nKey: node.i18n,
        propName: name,
        isComponent: true,
        componentPropName: name,
        expose:
            typeof node.type === 'function'
                ? ((node.type as any)._expose as string[] | undefined)
                : undefined,
    });

    compileEvents(node, name, ctx);

    return '<div></div>';
}

function compileTagNode(node: TplNode, path: number[], ctx: CompileContext): string {
    const tag = node.tag || 'div';

    if (node.name) {
        const name = node.name;
        const mode = inferMode(tag);

        ctx.indexPath[name] = path;
        ctx.templateMetas[name] = { name, mode };
        copyMetaFields(node, ctx.templateMetas[name]);

        ctx.contentPropNames.push(name);

        ctx.contentInfos.push({
            name,
            mode,
            i18nKey: node.i18n,
            propName: name,
        });

        compileEvents(node, name, ctx);
    }

    return buildTagHtml(tag, node, path, ctx);
}

function copyMetaFields(src: TplNode, dst: NodeTemplateMeta): void {
    for (const field of META_COPY_KEYS) {
        const v = (src as any)[field];
        if (v !== undefined) (dst as any)[META_KEY_MAP[field] || field] = v;
    }
}

function copyRootFields(src: TplNode, dst: Record<string, any>): void {
    for (const key of ROOT_COPY_KEYS) {
        const v = (src as any)[key];
        if (v !== undefined) dst[`root${key.charAt(0).toUpperCase()}${key.slice(1)}`] = v;
    }
}

function collectComponentMap(node: TplNode, name: string, ctx: CompileContext): void {
    if (typeof node.type === 'string') {
        ctx.componentMap[name] = (window as any)[node.type];
    } else if (typeof node.type === 'function') {
        ctx.componentMap[name] = node.type as any;
    }
}

function buildTagHtml(tag: string, node: TplNode, path: number[], ctx: CompileContext): string {
    if (VOID_TAGS.has(tag)) return `<${tag} />`;

    const inner: string[] = [];
    if (node.text) inner.push(node.text);

    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            inner.push(compileNode(node.children[i], [...path, i], ctx));
        }
    }

    return `<${tag}>${inner.join('')}</${tag}>`;
}

const EVENT_COPY_KEYS = [
    'once',
    'delegate',
    'delegateTarget',
    'debounce',
    'throttle',
    'emits',
    'entities',
] as const;

function compileEvents(node: TplNode, key: string, ctx: CompileContext): void {
    if (!node.events) return;

    for (const [domEvent, decl] of Object.entries(node.events)) {
        const binding: DomEventBinding = { event: domEvent, nodeKey: key };

        const handlerName = inferHandlerName(domEvent, key, decl.handler);
        if (handlerName) binding.handler = handlerName;

        if (decl.bridges?.length) {
            binding.bridges = decl.bridges.map(b => ({ targetEvent: b }));
        }

        for (const k of EVENT_COPY_KEYS) {
            const v = (decl as any)[k];
            if (v !== undefined) (binding as any)[k] = v;
        }

        ctx.domEventBindings.push(binding);
    }
}

function inferHandlerName(
    domEvent: string,
    key: string,
    handler: boolean | string | undefined
): string | undefined {
    if (handler === true) {
        const capitalEvent = domEvent.charAt(0).toUpperCase() + domEvent.slice(1);
        const capitalKey = key.charAt(0).toUpperCase() + key.slice(1);
        return key ? `on${capitalKey}${capitalEvent}` : `on${capitalEvent}`;
    }
    if (typeof handler === 'string') return handler;
    return undefined;
}
