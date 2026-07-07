/**
 * Layout 解析器
 *
 * 解析 Layout 定义，返回标准化的 LayoutNode。
 * 支持嵌套 children 递归解析，处理 handlers 中的字符串和 HandlerAction 混合形式。
 * 支持扁平化 props：非保留字的顶层属性自动归入 props，显式 props 优先。
 */

import type { LayoutNode, HandlerAction } from './LayoutNode';

/**
 * 框架保留字集合
 *
 * 这些顶层字段有特殊语义，不会自动归入 props。
 * 用户定义布局时，非保留字的顶层属性会自动合并到 props 中。
 */
const RESERVED_KEYS = new Set([
    'type', 'id', 'field', 'props', 'children', 'handlers', 'meta',
    'slots', 'visible', 'repeat', 'responsive', 'stateTriggers',
]);

/**
 * 解析 Layout 定义，返回标准化的 LayoutNode
 *
 * 支持扁平化写法：
 * - 保留字字段（type/id/field/handlers/...）保持在顶层
 * - 非保留字的顶层属性自动归入 props
 * - 显式 props 中的属性优先级高于扁平化属性
 *
 * @example
 * ```js
 * // 扁平化写法（推荐）
 * parseLayout({ type: ComponentTypes.BUTTON, text: '提交', variant: 'primary' })
 * // 等价于
 * parseLayout({ type: ComponentTypes.BUTTON, props: { text: '提交', variant: 'primary' } })
 *
 * // 混合写法：显式 props 优先
 * parseLayout({ type: ComponentTypes.BUTTON, text: '默认', props: { text: '覆盖' } })
 * // → props.text === '覆盖'
 * ```
 *
 * @param layout - 原始 Layout 定义
 * @returns 标准化的 LayoutNode
 */
export function parseLayout(layout: Record<string, any>): LayoutNode {
    if (!layout || typeof layout !== 'object') {
        throw new Error('Layout definition must be a non-null object');
    }

    if (!layout.type || typeof layout.type !== 'string') {
        throw new Error('Layout definition must have a non-empty "type" field');
    }

    const node: LayoutNode = {
        type: layout.type,
    };

    // 可选保留字字段
    if (layout.id !== undefined) node.id = String(layout.id);
    if (layout.field !== undefined) node.field = String(layout.field);
    if (layout.visible !== undefined) node.visible = layout.visible;
    if (layout.repeat !== undefined) node.repeat = layout.repeat;
    if (layout.responsive !== undefined) node.responsive = layout.responsive;
    if (layout.stateTriggers !== undefined) node.stateTriggers = layout.stateTriggers;

    // 解析 handlers
    if (layout.handlers) {
        node.handlers = parseHandlers(layout.handlers);
    }

    // 解析 meta
    if (layout.meta && typeof layout.meta === 'object') {
        node.meta = layout.meta;
    }

    // 解析 slots
    if (layout.slots) {
        node.slots = parseSlots(layout.slots);
    }

    // 递归解析 children
    if (layout.children && Array.isArray(layout.children)) {
        node.children = layout.children.map((child: any) => parseLayout(child));
    }

    // 扁平化 props：非保留字的顶层属性自动归入 props
    // 显式 props 优先级高于扁平化属性
    const props: Record<string, any> = {};
    for (const [key, value] of Object.entries(layout)) {
        if (!RESERVED_KEYS.has(key) && value !== undefined) {
            props[key] = value;
        }
    }
    // 显式 props 覆盖扁平化属性
    if (layout.props && typeof layout.props === 'object') {
        Object.assign(props, layout.props);
    }
    if (Object.keys(props).length > 0) {
        node.props = props;
    }

    return node;
}

/**
 * 解析 handlers 映射
 */
function parseHandlers(handlers: Record<string, any>): Record<string, string | HandlerAction | ((...args: any[]) => any) | (string | HandlerAction | ((...args: any[]) => any))[]> {
    const result: Record<string, string | HandlerAction | ((...args: any[]) => any) | (string | HandlerAction | ((...args: any[]) => any))[]> = {};

    for (const [event, handler] of Object.entries(handlers)) {
        if (Array.isArray(handler)) {
            result[event] = handler.map(normalizeHandler);
        } else {
            result[event] = normalizeHandler(handler);
        }
    }

    return result;
}

/**
 * 标准化单个 handler
 */
function normalizeHandler(handler: any): string | HandlerAction | ((...args: any[]) => any) {
    if (typeof handler === 'string') {
        return { action: handler } as HandlerAction;
    }
    if (typeof handler === 'function') {
        return handler;
    }
    if (handler && typeof handler === 'object' && 'action' in handler) {
        return handler as HandlerAction;
    }
    // 不合法的 handler 格式，转为字符串
    return String(handler);
}

/**
 * 解析 slots
 */
function parseSlots(slots: Record<string, any>): Record<string, LayoutNode | LayoutNode[]> {
    const result: Record<string, LayoutNode | LayoutNode[]> = {};

    for (const [name, content] of Object.entries(slots)) {
        if (Array.isArray(content)) {
            result[name] = content.map((item: any) => parseLayout(item));
        } else if (content && typeof content === 'object') {
            result[name] = parseLayout(content);
        }
    }

    return result;
}
