/**
 * template-json.ts — 新模板 JSON → HTML 转换
 *
 * 将 TplNode 树转换为 HTML 字符串 + 组件映射 + 模板元数据。
 * 新模板结构中 tag/type 互斥，events/forwards/bridges 三类事件分离。
 *
 * 转换规则：
 * - tag 节点 → HTML 元素，data-* 属性编码节点信息
 * - type 节点 → 占位 div，data-json 编码组件类型
 * - name/content → data-content 编码节点索引
 * - events → data-event 编码内部事件
 * - forwards → data-emit 编码转发事件
 * - bridges → data-bridge 编码桥接事件
 */

import type { TplNode, ComponentTemplate } from './template-types';

/**
 * JSON 模板转换结果
 */
export interface TemplateConvertResult {
    /** 转换后的 HTML 字符串 */
    html: string;
    /** 组件类映射 — name → ComponentClass（从 type 字段为组件类引用的节点提取） */
    componentMap: Record<string, new (props?: Record<string, any>) => any>;
    /** 模板元数据 — 从 TplNode 树提取，供预编译使用 */
    nodeMetas: Record<string, TplNodeMeta>;
}

/**
 * 模板节点元数据 — 从 TplNode 提取，不含 DOM 引用
 */
export interface TplNodeMeta {
    /** nodeMap 索引键（group:name 格式） */
    key: string;
    /** 分组 */
    group: string;
    /** 名称 */
    name: string;
    /** 内容语义 */
    content?: string;
    /** 内部事件声明 */
    events?: string[];
    /** 转发事件声明 */
    forwards?: string[];
    /** 桥接事件声明 */
    bridges?: string[];
    /** 组件类型引用 */
    typeRef?: string;
    /** 组件挂载模式 */
    replace?: boolean;
    /** i18n key */
    i18n?: string;
    /** 初始隐藏 */
    hidden?: boolean;
    /** 内容操作模式 */
    mode: 'value' | 'src' | 'html';
    /** 子组件 props */
    props?: Record<string, any>;
}

/** 自闭合标签集合 */
const VOID_TAGS = new Set(['input', 'img', 'br', 'hr', 'col', 'area', 'base', 'embed', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/**
 * 推导内容操作模式
 */
function inferMode(tag?: string): 'value' | 'src' | 'html' {
    if (!tag) return 'html';
    const t = tag.toLowerCase();
    if (t === 'input' || t === 'select' || t === 'textarea') return 'value';
    if (t === 'img') return 'src';
    return 'html';
}

/**
 * 解析 name 为 group:name 格式
 *
 * - 'text' → { group: '_', name: 'text' }
 * - 'dialog:header' → { group: 'dialog', name: 'header' }
 */
function parseName(nameOrContent: string): { group: string; name: string } {
    const colonIndex = nameOrContent.indexOf(':');
    if (colonIndex === -1) {
        return { group: '_', name: nameOrContent };
    }
    return {
        group: nameOrContent.slice(0, colonIndex),
        name: nameOrContent.slice(colonIndex + 1),
    };
}

/**
 * 将 style 对象转为字符串
 */
function styleToString(style: Record<string, any>): string {
    return Object.entries(style)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}:${value}`;
        })
        .join(';');
}

/**
 * 转换 ComponentTemplate 为 HTML + 元数据
 *
 * tpl 根节点不生成 HTML 元素（根元素由组件的 tag 属性创建），
 * 只转换 tpl.children 为内部 HTML 片段。
 * tpl 根节点的 className/style/attrs 等属性由组件实例自行处理。
 */
export function convertTemplate(template: ComponentTemplate): TemplateConvertResult {
    const componentMap: Record<string, new (props?: Record<string, any>) => any> = {};
    const nodeMetas: Record<string, TplNodeMeta> = {};

    // 根节点不生成 HTML，只转换 children
    const children = template.tpl.children || [];
    const html = children.map(c => tplNodeToHtml(c, componentMap, nodeMetas)).join('');

    return { html, componentMap, nodeMetas };
}

/**
 * 递归转换 TplNode 为 HTML
 */
function tplNodeToHtml(
    node: TplNode,
    componentMap: Record<string, new (props?: Record<string, any>) => any>,
    nodeMetas: Record<string, TplNodeMeta>,
): string {
    // ─── type 节点（组件占位） ───

    if (node.type) {
        const nameStr = node.name || node.content || '';
        const { group, name } = nameStr ? parseName(nameStr) : { group: '_', name: '_' };
        const key = `${group}:${name}`;

        // 记录组件类映射
        if (typeof node.type === 'string') {
            componentMap[name] = (window as any)[node.type]; // 运行时查找
        } else if (typeof node.type === 'function') {
            componentMap[name] = node.type as any;
        }

        // 记录元数据
        nodeMetas[key] = {
            key, group, name,
            content: node.content,
            events: node.events,
            forwards: node.forwards,
            bridges: node.bridges,
            typeRef: typeof node.type === 'string' ? node.type : (node.type as any).name || 'Anonymous',
            replace: node.replace,
            i18n: node.i18n,
            hidden: node.hidden,
            mode: 'html',
            props: node.props,
        };

        // 生成占位 div
        const attrs: string[] = [];
        attrs.push(`data-content="${key}"`);
        attrs.push(`data-json="${typeof node.type === 'string' ? node.type : (node.type as any).name || 'Anonymous'}"`);
        if (node.replace !== undefined) {
            attrs.push(`data-json-mode="${node.replace ? 'replace' : 'child'}"`);
        }
        if (node.events?.length) attrs.push(`data-event="${node.events.join(',')}"`);
        if (node.forwards?.length) attrs.push(`data-emit="${node.forwards.join(',')}"`);
        if (node.bridges?.length) attrs.push(`data-bridge="${node.bridges.join(',')}"`);
        if (node.i18n) attrs.push(`data-i18n="${node.i18n}"`);
        if (node.hidden) attrs.push(`data-hidden="true"`);
        if (node.className) attrs.push(`class="${node.className}"`);
        if (node.style) {
            const styleStr = typeof node.style === 'string' ? node.style : styleToString(node.style);
            attrs.push(`style="${styleStr}"`);
        }

        return `<div ${attrs.join(' ')}></div>`;
    }

    // ─── tag 节点（DOM 元素） ───

    const tag = node.tag || 'div';
    const attrs: string[] = [];

    // name/content → data-content
    const nameStr = node.name || node.content;
    if (nameStr) {
        const { group, name } = parseName(nameStr);
        const key = `${group}:${name}`;

        attrs.push(`data-content="${key}"`);

        // 记录元数据
        nodeMetas[key] = {
            key, group, name,
            content: node.content,
            events: node.events,
            forwards: node.forwards,
            bridges: node.bridges,
            i18n: node.i18n,
            hidden: node.hidden,
            mode: inferMode(tag),
        };
    }

    // 事件属性
    if (node.events?.length) attrs.push(`data-event="${node.events.join(',')}"`);
    if (node.forwards?.length) attrs.push(`data-emit="${node.forwards.join(',')}"`);
    if (node.bridges?.length) attrs.push(`data-bridge="${node.bridges.join(',')}"`);

    // 其他属性
    if (node.i18n) attrs.push(`data-i18n="${node.i18n}"`);
    if (node.hidden) attrs.push(`data-hidden="true"`);
    if (node.className) attrs.push(`class="${node.className}"`);
    if (node.style) {
        const styleStr = typeof node.style === 'string' ? node.style : styleToString(node.style);
        attrs.push(`style="${styleStr}"`);
    }
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
        ...(node.children || []).map(c => tplNodeToHtml(c, componentMap, nodeMetas)),
    ].filter(Boolean).join('');

    return `<${tag}${attrStr}>${inner}</${tag}>`;
}

// ─── 向后兼容 ───

/**
 * 旧版 JsonTemplateNode 类型（向后兼容）
 */
export interface JsonTemplateNode {
    tag?: string;
    content?: string;
    class?: string;
    style?: string;
    event?: string;
    emit?: string;
    target?: string;
    json?: string | (new (props?: Record<string, any>) => any);
    jsonMode?: 'replace' | 'child';
    template?: string;
    i18n?: string;
    hidden?: boolean;
    attrs?: Record<string, string>;
    text?: string;
    children?: JsonTemplateNode[];
}

/** 旧版转换结果 */
export interface JsonTemplateResult {
    html: string;
    componentMap: Record<string, new (props?: Record<string, any>) => any>;
}

/**
 * 旧版 JSON 模板 → HTML + 组件映射（向后兼容）
 */
export function jsonTemplateToHtml(nodes: JsonTemplateNode[]): JsonTemplateResult {
    const componentMap: Record<string, new (props?: Record<string, any>) => any> = {};
    const html = nodes.map(node => legacyNodeToHtml(node, componentMap)).join('');
    return { html, componentMap };
}

function legacyNodeToHtml(
    node: JsonTemplateNode,
    componentMap: Record<string, new (props?: Record<string, any>) => any>,
): string {
    const tag = node.tag || 'div';
    const attrs: string[] = [];

    if (node.content) attrs.push(`data-content="${node.content}"`);
    if (node.event) attrs.push(`data-event="${node.event}"`);
    if (node.emit) attrs.push(`data-emit="${node.emit}"`);
    if (node.target) attrs.push(`data-target="${node.target}"`);
    if (node.json) {
        if (typeof node.json === 'string') {
            attrs.push(`data-json="${node.json}"`);
        } else {
            const className = (node.json as any).name || 'Anonymous';
            attrs.push(`data-json="${className}"`);
            const content = node.content || '';
            const colonIndex = content.indexOf(':');
            const name = colonIndex === -1 ? content : content.slice(colonIndex + 1);
            if (name) {
                componentMap[name] = node.json as new (props?: Record<string, any>) => any;
            }
        }
    }
    if (node.jsonMode) attrs.push(`data-json-mode="${node.jsonMode}"`);
    if (node.template) attrs.push(`data-template="${node.template}"`);
    if (node.i18n) attrs.push(`data-i18n="${node.i18n}"`);
    if (node.hidden) attrs.push(`data-hidden="true"`);
    if (node.class) attrs.push(`class="${node.class}"`);
    if (node.style) attrs.push(`style="${node.style}"`);
    if (node.attrs) {
        for (const [key, value] of Object.entries(node.attrs)) {
            attrs.push(`${key}="${value}"`);
        }
    }

    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    if (VOID_TAGS.has(tag)) {
        return `<${tag}${attrStr} />`;
    }

    const inner = [
        node.text || '',
        ...(node.children || []).map(c => legacyNodeToHtml(c, componentMap)),
    ].filter(Boolean).join('');

    return `<${tag}${attrStr}>${inner}</${tag}>`;
}
