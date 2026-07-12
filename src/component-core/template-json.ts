/**
 * template-json.ts — JSON 模板定义与转换
 *
 * 从 template-compiler.ts 拆分出来的 JSON 模板部分，
 * 包含 JsonTemplateNode 类型定义和 JSON → HTML 转换函数。
 */

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
 * - hidden  → data-hidden — 初始隐藏状态（对应 el.hidden）
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
    /**
     * JSON 组件定义引用，对应 data-json
     *
     * - 字符串：HTML 模式，运行时通过 ComponentRegistrar 查找
     * - 组件类引用：JSON 模式，转 HTML 时用类名作为 data-json 值，
     *   同时提取到 componentMap 供 withTemplate 使用
     */
    json?: string | (new (props?: Record<string, any>) => any);
    /** JSON 渲染模式，对应 data-json-mode */
    jsonMode?: 'replace' | 'child';
    /** 嵌套模板引用，对应 data-template */
    template?: string;
    /** i18n 翻译 key，对应 data-i18n */
    i18n?: string;
    /** 初始隐藏状态，对应 data-hidden，运行时设置 el.hidden */
    hidden?: boolean;
    /** 其他 HTML 属性 */
    attrs?: Record<string, string>;
    /** 文本内容 */
    text?: string;
    /** 子节点 */
    children?: JsonTemplateNode[];
}

/** JSON 模板转换结果 */
export interface JsonTemplateResult {
    /** 转换后的 HTML 字符串 */
    html: string;
    /** 组件类映射 — name → ComponentClass（从 json 字段为组件类的节点提取） */
    componentMap: Record<string, new (props?: Record<string, any>) => any>;
}

/** 自闭合标签集合 */
const VOID_TAGS = new Set(['input', 'img', 'br', 'hr', 'col', 'area', 'base', 'embed', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/**
 * JSON 模板 → HTML + 组件映射
 *
 * 将 JsonTemplateNode[] 递归转换为 HTML 模板字符串，
 * 同时提取 json 字段为组件类引用的节点，生成 name → ComponentClass 映射。
 *
 * 生成的 HTML 与手写模板在 data-* 属性上完全等价，
 * 可直接进入 precompileTemplate 流程。
 */
export function jsonTemplateToHtml(nodes: JsonTemplateNode[]): JsonTemplateResult {
    const componentMap: Record<string, new (props?: Record<string, any>) => any> = {};
    const html = nodes.map(node => jsonNodeToHtml(node, componentMap)).join('');
    return { html, componentMap };
}

function jsonNodeToHtml(
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
            // 组件类引用：用类名作为 data-json 值，同时提取到 componentMap
            const className = (node.json as any).name || 'Anonymous';
            attrs.push(`data-json="${className}"`);
            // 从 content 中提取 name（格式 "group:name"）
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

    // 自闭合标签
    if (VOID_TAGS.has(tag)) {
        return `<${tag}${attrStr} />`;
    }

    // 子节点 + 文本
    const inner = [
        node.text || '',
        ...(node.children || []).map(c => jsonNodeToHtml(c, componentMap)),
    ].filter(Boolean).join('');

    return `<${tag}${attrStr}>${inner}</${tag}>`;
}
