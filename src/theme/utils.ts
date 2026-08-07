/**
 * 主题工具函数
 */

import type { DesignTokens } from './types';

/**
 * 将嵌套的 DesignTokens 扁平化为 CSS 变量映射
 *
 * 例如：{ colors: { primary: '#1890ff' } } → { '--q-colors-primary': '#1890ff' }
 *
 * @param tokens - 设计令牌集合
 * @param prefix - CSS 变量前缀，默认为 '--q'
 * @returns 扁平化的 CSS 变量映射
 */
export function flattenTokens(
    tokens: Record<string, any>,
    prefix: string = '--q'
): Record<string, string | number> {
    const result: Record<string, string | number> = {};

    for (const [category, value] of Object.entries(tokens)) {
        if (value !== null && typeof value === 'object') {
            const nested = flattenTokens(value, `${prefix}-${category}`);
            Object.assign(result, nested);
        } else {
            result[`${prefix}-${category}`] = value;
        }
    }

    return result;
}

/**
 * 将 DesignTokens 转换为 CSS 变量字符串
 *
 * @param tokens - 设计令牌集合
 * @returns CSS 变量字符串，如 ':root { --q-colors-primary: #1890ff; ... }'
 */
export function tokensToCSSVariables(tokens: DesignTokens): string {
    const variables = flattenTokens(tokens as Record<string, any>);
    const lines = Object.entries(variables)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n');

    return `:root {\n${lines}\n}`;
}
