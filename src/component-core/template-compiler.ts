/**
 * template-compiler.ts — 统一预编译引擎
 *
 * 从 TemplateComponent.ts 和 NodeMapAbility.ts 提取的共享预编译逻辑，
 * 消除两处重复代码。
 *
 * 职责：
 * - 解析 HTML 模板，提取 data-content 节点元数据
 * - 预编译事件模板（内部事件 + 外部事件）
 * - 计算节点索引路径
 * - 构建事件映射
 */

import type { NodeIndexPath, NodeTemplateMeta, InternalEventBinding, EventMap, ExternalEventMap } from './types';
import type { NodeMetadata } from './types';

// ─── 预编译事件模板类型 ───

/**
 * 预编译的内部事件模板 — 不含 node 引用，实例化时填入
 */
export interface InternalEventTemplate {
    event: string;
    handler: string;
    once?: boolean;
    delegate?: boolean;
    delegateTarget?: string;
    /** 对应 nodeMap 中的 group:name key，用于查找 node */
    nodeKey: string;
}

/**
 * 预编译的外部事件模板 — 不含 node 引用，实例化时填入
 */
export interface ExternalEventTemplate {
    /** eventMap external 的 key（如 "button:click"） */
    emitKey: string;
    /** 对应 nodeMap 中的 group:name key，用于查找 node */
    nodeKey: string;
}

/**
 * 预编译结果
 */
export interface CompiledTemplate {
    indexPath: NodeIndexPath;
    templateMetas: Record<string, NodeTemplateMeta>;
    internalEventTemplates: InternalEventTemplate[];
    externalEventTemplates: ExternalEventTemplate[];
    contentPropNames: string[];
}

// ─── 预编译主函数 ───

/**
 * 预编译模板：解析 HTML 提取节点数据 + 预编译事件模板
 *
 * withTemplate 路径：类定义时调用一次，结果存到 static 属性。
 * NodeMapAbility 路径：首次实例化时调用，结果存到原型共享。
 */
export function precompileTemplate(
    templateHtml: string,
    isMultiArea: boolean,
): CompiledTemplate {
    const tpl = document.createElement('template');
    tpl.innerHTML = templateHtml;

    const root = tpl.content.firstElementChild as HTMLElement || tpl.content as any;
    const els = Array.from((root as HTMLElement).querySelectorAll('[data-content]'));

    const indexPath: NodeIndexPath = {};
    const templateMetas: Record<string, NodeTemplateMeta> = {};
    const contentPropNames: string[] = [];
    const internalEventTemplates: InternalEventTemplate[] = [];
    const externalEventTemplates: ExternalEventTemplate[] = [];

    for (const el of els) {
        const htmlEl = el as HTMLElement;
        const value = htmlEl.getAttribute('data-content')!;

        const colonIndex = value.indexOf(':');
        const group = colonIndex === -1 ? value : value.slice(0, colonIndex);
        const name = colonIndex === -1 ? '_' : value.slice(colonIndex + 1);
        const key = `${group}:${name}`;

        const delegateTarget = htmlEl.getAttribute('data-target') || undefined;
        const jsonRef = htmlEl.getAttribute('data-json') || undefined;
        const jsonModeAttr = htmlEl.getAttribute('data-json-mode');
        const jsonMode = jsonModeAttr === 'child' ? 'child' as const : jsonRef ? 'replace' as const : undefined;
        const templateRef = htmlEl.getAttribute('data-template') || undefined;
        const mode = inferContentMode(htmlEl);
        const i18nKey = htmlEl.getAttribute('data-i18n') || undefined;
        const eventAttr = htmlEl.getAttribute('data-event') || undefined;
        const emitAttr = htmlEl.getAttribute('data-emit') || undefined;

        templateMetas[key] = {
            raw: value, group, name, delegateTarget, jsonRef, jsonMode,
            templateRef, mode, eventAttr, emitAttr, i18nKey,
        };

        // 计算节点路径（相对于模板根元素）
        indexPath[key] = computeNodePath(tpl.content as any, htmlEl);

        // 推导内容属性名
        const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
        const propName = isMultiArea
            ? `${group}${capitalName}`
            : name === '_' ? group : name;
        contentPropNames.push(propName);

        // 预编译内部事件模板（推导 handler 名 + 解析 eventAttr，只做一次）
        if (eventAttr) {
            const handlerName = isMultiArea
                ? `on${group.charAt(0).toUpperCase() + group.slice(1)}${capitalName}`
                : `on${name === '_' ? group.charAt(0).toUpperCase() + group.slice(1) : capitalName}`;

            const parsed = parseEventAttr(eventAttr);
            for (const { event, once, delegate } of parsed) {
                internalEventTemplates.push({
                    event,
                    handler: handlerName,
                    once,
                    delegate,
                    delegateTarget,
                    nodeKey: key,
                });
            }
        }

        // 预编译外部事件模板
        if (emitAttr) {
            const parsed = parseEventAttr(emitAttr);
            for (const { event } of parsed) {
                externalEventTemplates.push({
                    emitKey: `${name}:${event}`,
                    nodeKey: key,
                });
            }
        }
    }

    return { indexPath, templateMetas, internalEventTemplates, externalEventTemplates, contentPropNames };
}

/**
 * 仅预编译事件模板 — 从已有的 templateMetas 推导
 *
 * NodeMapAbility 首次实例化时使用：先 querySelectorAll 扫描节点，
 * 再用此函数从 templateMetas 预编译事件模板。
 */
export function precompileEventTemplates(
    templateMetas: Record<string, NodeTemplateMeta>,
    isMultiArea: boolean,
): {
    internalEventTemplates: InternalEventTemplate[];
    externalEventTemplates: ExternalEventTemplate[];
} {
    const internalEventTemplates: InternalEventTemplate[] = [];
    const externalEventTemplates: ExternalEventTemplate[] = [];

    for (const [key, meta] of Object.entries(templateMetas)) {
        const capitalName = meta.name.charAt(0).toUpperCase() + meta.name.slice(1);

        if (meta.eventAttr) {
            const handlerName = isMultiArea
                ? `on${meta.group.charAt(0).toUpperCase() + meta.group.slice(1)}${capitalName}`
                : `on${meta.name === '_' ? meta.group.charAt(0).toUpperCase() + meta.group.slice(1) : capitalName}`;

            const parsed = parseEventAttr(meta.eventAttr);
            for (const { event, once, delegate } of parsed) {
                internalEventTemplates.push({
                    event,
                    handler: handlerName,
                    once,
                    delegate,
                    delegateTarget: meta.delegateTarget,
                    nodeKey: key,
                });
            }
        }

        if (meta.emitAttr) {
            const parsed = parseEventAttr(meta.emitAttr);
            for (const { event } of parsed) {
                externalEventTemplates.push({
                    emitKey: `${meta.name}:${event}`,
                    nodeKey: key,
                });
            }
        }
    }

    return { internalEventTemplates, externalEventTemplates };
}

// ─── 事件映射构建 ───

/**
 * 从预编译事件模板构建 eventMap — 只填 node 引用
 *
 * withTemplate 路径和 NodeMapAbility 路径共用。
 */
export function buildEventMapFromTemplates(
    internalTemplates: InternalEventTemplate[],
    externalTemplates: ExternalEventTemplate[],
    nodeMap: Record<string, Record<string, NodeMetadata>>,
): EventMap {
    const internalEvents: InternalEventBinding[] = [];
    const externalEvents: ExternalEventMap = {};

    for (const tpl of internalTemplates) {
        const [group, name] = tpl.nodeKey.split(':');
        const node = nodeMap[group]?.[name];
        if (!node) continue;

        internalEvents.push({
            event: tpl.event,
            handler: tpl.handler,
            once: tpl.once,
            delegate: tpl.delegate,
            delegateTarget: tpl.delegateTarget,
            node,
        });
    }

    for (const tpl of externalTemplates) {
        const [group, name] = tpl.nodeKey.split(':');
        const node = nodeMap[group]?.[name];
        if (!node) continue;

        externalEvents[tpl.emitKey] = node;
    }

    return { internal: internalEvents, external: externalEvents };
}

// ─── 节点定位 ───

/**
 * 用索引路径从 root 开始定位元素
 */
export function findByPath(root: HTMLElement, path: number[]): HTMLElement | null {
    let current: Element = root;
    for (const idx of path) {
        if (!current.children[idx]) return null;
        current = current.children[idx];
    }
    return current as HTMLElement;
}

/**
 * 计算节点在 DOM 树中的位置路径
 */
export function computeNodePath(root: HTMLElement, target: HTMLElement): number[] {
    const path: number[] = [];
    let current: Element | null = target;
    while (current && current !== root) {
        const parent: Element | null = current.parentElement;
        if (!parent) break;
        const idx = Array.from(parent.children).indexOf(current);
        if (idx === -1) break;
        path.unshift(idx);
        current = parent;
    }
    return path;
}

// ─── 辅助函数 ───

/**
 * 根据元素标签推导内容操作模式
 */
export function inferContentMode(el: HTMLElement): 'value' | 'src' | 'html' {
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return 'value';
    if (tag === 'img') return 'src';
    return 'html';
}

/**
 * 解析事件属性值（data-event / data-emit 通用）
 *
 * 格式：逗号分隔的事件类型，每个可带 ? 修饰符
 * 示例："click?once", "tap?once&delegate", "input,change"
 */
export function parseEventAttr(eventAttr: string): Array<{ event: string; once?: boolean; delegate?: boolean }> {
    const results: Array<{ event: string; once?: boolean; delegate?: boolean }> = [];
    const parts = eventAttr.split(',').map(s => s.trim()).filter(Boolean);

    for (const part of parts) {
        let event: string;
        let once = false;
        let delegate = false;

        const questionIndex = part.indexOf('?');
        if (questionIndex !== -1) {
            event = part.slice(0, questionIndex).trim();
            const modifiers = part.slice(questionIndex + 1).split('&');
            for (const mod of modifiers) {
                if (mod === 'once') once = true;
                if (mod === 'delegate') delegate = true;
            }
        } else {
            event = part.trim();
        }

        results.push({ event, once, delegate });
    }

    return results;
}

// ─── JSON 模板 ───

/**
 * JSON 模板节点 — 描述组件内部 DOM 结构
 *
 * 与 HTML 模板等价，字段名直接对应 data-* 去掉前缀的语义：
 * - content → data-content
 * - event   → data-event
 * - emit    → data-emit
 * - target  → data-target
 * - json    → data-json
 * - jsonMode → data-json-mode
 * - template → data-template
 * - i18n    → data-i18n
 *
 * withTemplate 接收 JsonTemplateNode[] 后自动转换为 HTML 字符串，
 * 再走原有 precompileTemplate 流程。
 */
export interface JsonTemplateNode {
    /** DOM 标签名，默认 'div' */
    tag?: string;
    /** 内容插槽声明，格式 "group:name"，对应 data-content */
    content?: string;
    /** CSS 类名 */
    class?: string;
    /** 内联样式 */
    style?: string;
    /** 内部事件声明，如 "click", "input?once"，对应 data-event */
    event?: string;
    /** 外部事件声明，如 "click"，对应 data-emit */
    emit?: string;
    /** 事件委托目标选择器，对应 data-target */
    target?: string;
    /** JSON 组件定义引用，对应 data-json */
    json?: string;
    /** JSON 渲染模式，对应 data-json-mode */
    jsonMode?: 'replace' | 'child';
    /** 嵌套模板引用，对应 data-template */
    template?: string;
    /** i18n 翻译 key，对应 data-i18n */
    i18n?: string;
    /** 其他 HTML 属性 */
    attrs?: Record<string, string>;
    /** 文本内容 */
    text?: string;
    /** 子节点 */
    children?: JsonTemplateNode[];
}

/** 自闭合标签集合 */
const VOID_TAGS = new Set(['input', 'img', 'br', 'hr', 'col', 'area', 'base', 'embed', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/**
 * JSON 模板 → HTML 字符串
 *
 * 将 JsonTemplateNode[] 递归转换为 HTML 模板字符串，
 * 生成的 HTML 与手写模板在 data-* 属性上完全等价，
 * 可直接进入 precompileTemplate 流程。
 */
export function jsonTemplateToHtml(nodes: JsonTemplateNode[]): string {
    return nodes.map(node => jsonNodeToHtml(node)).join('');
}

function jsonNodeToHtml(node: JsonTemplateNode): string {
    const tag = node.tag || 'div';
    const attrs: string[] = [];

    if (node.content) attrs.push(`data-content="${node.content}"`);
    if (node.event) attrs.push(`data-event="${node.event}"`);
    if (node.emit) attrs.push(`data-emit="${node.emit}"`);
    if (node.target) attrs.push(`data-target="${node.target}"`);
    if (node.json) attrs.push(`data-json="${node.json}"`);
    if (node.jsonMode) attrs.push(`data-json-mode="${node.jsonMode}"`);
    if (node.template) attrs.push(`data-template="${node.template}"`);
    if (node.i18n) attrs.push(`data-i18n="${node.i18n}"`);
    if (node.class) attrs.push(`class="${node.class}"`);
    if (node.style) attrs.push(`style="${node.style}"`);
    if (node.attrs) {
        for (const [key, value] of Object.entries(node.attrs)) {
            attrs.push(`${key}="${value}"`);
        }
    }

    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    // 自闭合标签
    if (VOID_TAGS.has(tag)) {
        return `<${tag}${attrStr} />`;
    }

    // 子节点 + 文本
    const inner = [
        node.text || '',
        ...(node.children || []).map(c => jsonNodeToHtml(c)),
    ].filter(Boolean).join('');

    return `<${tag}${attrStr}>${inner}</${tag}>`;
}
