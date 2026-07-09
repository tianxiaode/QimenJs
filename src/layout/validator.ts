/**
 * Layout 验证器
 *
 * 验证 LayoutNode 结构合法性
 */

import type { LayoutNode, HandlerConfig } from './LayoutNode';

/**
 * 验证结果
 */
export interface ValidationResult {
    /** 是否合法 */
    valid: boolean;
    /** 错误信息列表 */
    errors: string[];
}

/**
 * 验证 LayoutNode 结构合法性
 *
 * @param node - Layout 节点
 * @returns 验证结果
 */
export function validateLayout(node: LayoutNode): ValidationResult {
    const errors: string[] = [];

    // type 必须为非空字符串
    if (!node.type || typeof node.type !== 'string') {
        errors.push('LayoutNode.type must be a non-empty string');
    }

    // id 若提供必须为有效标识符
    if (node.id !== undefined) {
        if (typeof node.id !== 'string' || node.id.trim() === '') {
            errors.push('LayoutNode.id must be a non-empty string if provided');
        }
    }

    // handlers 值类型校验
    if (node.handlers) {
        for (const [event, handler] of Object.entries(node.handlers)) {
            if (Array.isArray(handler)) {
                for (const h of handler) {
                    if (!isValidHandler(h)) {
                        errors.push(`LayoutNode.handlers["${event}"] contains invalid handler`);
                    }
                }
            } else if (!isValidHandler(handler)) {
                errors.push(`LayoutNode.handlers["${event}"] is invalid`);
            }
        }
    }

    // children 递归校验
    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            const childResult = validateLayout(node.children[i]);
            errors.push(...childResult.errors.map(e => `children[${i}]: ${e}`));
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * 判断 handler 是否合法
 */
function isValidHandler(handler: any): handler is string | HandlerConfig | ((...args: any[]) => any) {
    if (typeof handler === 'string') return true;
    if (typeof handler === 'function') return true;
    if (handler && typeof handler === 'object' && 'handler' in handler) return true;
    return false;
}
