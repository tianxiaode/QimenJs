/**
 * Layout 解析器
 *
 * 解析 Layout 定义，返回标准化的 LayoutNode。
 * 支持嵌套 children 递归解析，处理 handlers 中的字符串和 HandlerAction 混合形式。
 */

import type { LayoutNode, HandlerAction } from './LayoutNode';

/**
 * 解析 Layout 定义，返回标准化的 LayoutNode
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

    // 可选字段
    if (layout.id !== undefined) node.id = String(layout.id);
    if (layout.field !== undefined) node.field = String(layout.field);
    if (layout.props !== undefined) node.props = layout.props;
    if (layout.visible !== undefined) node.visible = layout.visible;
    if (layout.repeat !== undefined) node.repeat = layout.repeat;
    if (layout.responsive !== undefined) node.responsive = layout.responsive;
    if (layout.stateTriggers !== undefined) node.stateTriggers = layout.stateTriggers;

    // 解析 handlers
    if (layout.handlers) {
        node.handlers = parseHandlers(layout.handlers);
    }

    // 解析 slots
    if (layout.slots) {
        node.slots = parseSlots(layout.slots);
    }

    // 递归解析 children
    if (layout.children && Array.isArray(layout.children)) {
        node.children = layout.children.map((child: any) => parseLayout(child));
    }

    return node;
}

/**
 * 解析 handlers 映射
 */
function parseHandlers(handlers: Record<string, any>): Record<string, string | HandlerAction | (string | HandlerAction)[]> {
    const result: Record<string, string | HandlerAction | (string | HandlerAction)[]> = {};

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
function normalizeHandler(handler: any): string | HandlerAction {
    if (typeof handler === 'string') {
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
