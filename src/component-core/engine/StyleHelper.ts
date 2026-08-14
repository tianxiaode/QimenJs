import { string } from '@qimenjs/utils';

/**
 * StyleHelper — 样式工具静态类
 *
 * 统一处理 style 对象和字符串的转换、解析、展开
 * 底层使用 css.ts 的工具函数
 */

export class StyleHelper {
    /**
     * 添加样式到已有样式字符串
     *
     * @param key - 样式属性名
     * @param val - 样式值
     * @param existing - 已有的样式字符串
     * @returns 合并后的样式字符串
     *
     * @example
     * StyleHelper.addStyle('color', 'red', 'font-size: 16px')
     * // → 'font-size: 16px; color: red'
     *
     * StyleHelper.addStyle('style', { color: 'red', fontSize: 16 }, '')
     * // → 'color: red; font-size: 16px'
     *
     * StyleHelper.addStyle('margin', { top: 10, horizontal: 20 }, '')
     * // → 'margin: 10px 20px 0px 20px'
     */
    static addStyle(key: string, val: any, existing: string = ''): string {
        // 1. 如果是 'style' key，展开对象或字符串
        if (key === 'style') {
            const parts: string[] = [];

            if (typeof val === 'string') {
                // 解析字符串，逐个添加
                const parsed = this.parse(val);
                for (const [k, v] of Object.entries(parsed)) {
                    if (v !== undefined && v !== null) {
                        parts.push(this._keyValueToString(k, v));
                    }
                }
            } else if (typeof val === 'object' && val !== null) {
                for (const [k, v] of Object.entries(val)) {
                    if (v !== undefined && v !== null) {
                        parts.push(this._keyValueToString(k, v));
                    }
                }
            }

            return this._mergeStyles(existing, parts.join('; '));
        }

        // 2. 单个样式属性
        return this._mergeStyles(existing, this._keyValueToString(key, val));
    }

    /**
     * 合并两个样式字符串
     */
    private static _mergeStyles(existing: string, newStyle: string): string {
        if (!newStyle) return existing;
        if (!existing) return newStyle;
        return existing + '; ' + newStyle;
    }

    /**
     * 将 key-value 转为 CSS 声明
     */
    private static _keyValueToString(key: string, val: any): string {
        const cssKey = this._toCssKey(key);
        const cssVal = this._toCssValue(key, val);
        return `${cssKey}: ${cssVal}`;
    }

    /**
     * 将 camelCase 转为 kebab-case
     */
    private static _toCssKey(key: string): string {
        return key.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    /**
     * 将值转为 CSS 值（统一处理单位）
     */
    private static _toCssValue(key: string, val: any): string {
        if (typeof val === 'string') return val;

        if (typeof val === 'number') {
            // 特殊属性不需要单位
            const noUnitProps = new Set([
                'zIndex',
                'opacity',
                'flex',
                'order',
                'flexGrow',
                'flexShrink',
                'aspectRatio',
            ]);
            if (noUnitProps.has(key)) {
                return String(val);
            }
            return string.normalizeCssUnit(val);
        }

        if (typeof val === 'object' && val !== null) {
            // margin/padding
            if ('top' in val || 'horizontal' in val || 'vertical' in val) {
                return string.resolveMarginPadding(val);
            }
            // border
            if ('width' in val || 'style' in val || 'color' in val) {
                return string.resolveBorder(val);
            }
            return String(val);
        }

        return String(val);
    }

    /**
     * 解析 style 字符串为对象
     */
    static parse(styleStr: string): Record<string, any> {
        const result: Record<string, any> = {};
        if (!styleStr) return result;

        styleStr.split(';').forEach(decl => {
            const parts = decl.split(':').map(s => s.trim());
            if (parts.length === 2 && parts[0]) {
                const key = parts[0].replace(/-([a-z])/g, (_, l) => l.toUpperCase());
                // 尝试解析数值
                const value = this._parseValue(parts[1]);
                result[key] = value;
            }
        });
        return result;
    }

    /**
     * 解析字符串值（尝试转为数字）
     */
    private static _parseValue(value: string): string | number {
        // 尝试提取数值
        const numMatch = value.match(/^([\d.]+)(px|%|em|rem|vh|vw|vmin|vmax)?$/);
        if (numMatch) {
            const num = parseFloat(numMatch[1]);
            const unit = numMatch[2];
            // 如果没有单位或者是 px，转为数字（px 可以安全转为数字）
            if (!unit || unit === 'px') {
                return num;
            }
            // 其他单位保留字符串
            return value;
        }
        return value;
    }

    /**
     * 将 style 对象转换为 CSS 字符串
     *
     * @example
     * StyleHelper.stringify({ color: 'red', fontSize: '16px' })
     * // → 'color: red; font-size: 16px'
     */
    static stringify(style: Record<string, any>): string {
        const parts: string[] = [];
        for (const [key, val] of Object.entries(style)) {
            if (val === undefined || val === null) continue;
            const cssKey = this._toCssKey(key);
            const cssVal = this._toCssValue(key, val);
            parts.push(`${cssKey}: ${cssVal}`);
        }
        return parts.join('; ');
    }

    /**
     * 展开 style 到目标对象（扁平化）
     *
     * 支持对象和字符串两种输入
     *
     * @example
     * StyleHelper.expand({ color: 'red', fontSize: '16px' }, target)
     * // → target.color = 'red', target.fontSize = '16px'
     *
     * StyleHelper.expand('color: red; font-size: 16px', target)
     * // → target.color = 'red', target.fontSize = '16px'
     */
    static expand(
        style: string | Record<string, any> | undefined | null,
        target: Record<string, any>
    ): void {
        if (!style) return;

        // 对象
        if (typeof style === 'object' && !Array.isArray(style)) {
            for (const [key, value] of Object.entries(style)) {
                if (value !== undefined && value !== null) {
                    // 处理对象类型的值（如 margin/padding）
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        // 对于 margin/padding 等，使用 _toCssValue 转换
                        target[key] = this._toCssValue(key, value);
                    } else {
                        target[key] = value;
                    }
                }
            }
            return;
        }

        // 字符串
        if (typeof style === 'string') {
            const parsed = this.parse(style);
            for (const [key, value] of Object.entries(parsed)) {
                if (value !== undefined && value !== null) {
                    target[key] = value;
                }
            }
        }
    }

    /**
     * 从对象中提取样式属性
     */
    static extract(obj: Record<string, any>, styleProps: Set<string>): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [key, val] of Object.entries(obj)) {
            if (styleProps.has(key) && val !== undefined && val !== null) {
                result[key] = val;
            }
        }
        return result;
    }

    /**
     * 判断是否为样式属性
     */
    static isStyleProp(key: string, styleProps: Set<string>): boolean {
        return styleProps.has(key);
    }
}
