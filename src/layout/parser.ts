/**
 * Layout 解析器
 *
 * 解析 Layout 定义，返回标准化的 LayoutNode。
 * 支持嵌套 children 递归解析，处理 handlers 中的字符串和 HandlerAction 混合形式。
 * PositionProps 属性（x/y/width 等）直接保留在顶层，不归入 props。
 */

import type { LayoutNode, HandlerAction, PositionProps } from './LayoutNode';
import { KernelError } from '../error/KernelError';
import { KernelErrorCode } from '../error/codes';

/**
 * 框架保留字集合
 *
 * 这些顶层字段有特殊语义，不会自动归入 props。
 */
const RESERVED_KEYS = new Set([
    'type', 'id', 'field', 'children', 'handlers', 'extraFns', 'abilities', 'meta',
    'visible', 'repeat', 'responsive', 'stateTriggers',
]);

/**
 * PositionProps 的所有 key 集合
 *
 * 这些属性直接保留在 LayoutNode 顶层，不归入 props。
 */
const POSITION_KEYS = new Set<string>([
    'x', 'y', 'top', 'left', 'bottom', 'right',
    'width', 'height',
    'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'margin', 'padding',
    'scrollable', 'center',
    'hideMode',
    'alwaysOnTop', 'fullscreen',
    'shadow',
    'focused',
    'tabIndex', 'zIndex',
]);

/**
 * 解析 Layout 定义，返回标准化的 LayoutNode
 *
 * 解析规则：
 * - 保留字字段（type/id/field/handlers/...）保持在顶层
 * - PositionProps 属性（x/y/width/...）直接提取到顶层
 * - 非保留字、非 PositionProps 的顶层属性归入 props
 *
 * @param layout - 原始 Layout 定义
 * @returns 标准化的 LayoutNode
 */
export function parseLayout(layout: Record<string, any>): LayoutNode {
    if (!layout || typeof layout !== 'object') {
        throw new KernelError('Layout definition must be a non-null object', KernelErrorCode.LAYOUT_INVALID_DEFINITION);
    }

    if (!layout.type || typeof layout.type !== 'string') {
        throw new KernelError('Layout definition must have a non-empty "type" field', KernelErrorCode.LAYOUT_MISSING_TYPE);
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

    // PositionProps 属性直接提取到顶层
    for (const key of POSITION_KEYS) {
        if (layout[key] !== undefined) {
            (node as any)[key] = layout[key];
        }
    }

    // 解析 handlers
    if (layout.handlers) {
        node.handlers = parseHandlers(layout.handlers);
    }

    // 解析 extraFns
    if (layout.extraFns && typeof layout.extraFns === 'object') {
        node.extraFns = layout.extraFns;
    }

    // 解析 abilities
    if (layout.abilities && Array.isArray(layout.abilities)) {
        node.abilities = layout.abilities;
    }

    // 解析 meta
    if (layout.meta && typeof layout.meta === 'object') {
        node.meta = layout.meta;
    }

    // 递归解析 children
    if (layout.children && Array.isArray(layout.children)) {
        node.children = layout.children.map((child: any) => parseLayout(child));
    }

    // 剩余非保留字、非 PositionProps 的顶层属性归入 props
    const props: Record<string, any> = {};
    for (const [key, value] of Object.entries(layout)) {
        if (!RESERVED_KEYS.has(key) && !POSITION_KEYS.has(key) && value !== undefined) {
            props[key] = value;
        }
    }
    if (Object.keys(props).length > 0) {
        (node as any).props = props;
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
