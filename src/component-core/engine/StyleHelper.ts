// utils/StyleHelper.ts

/**
 * StyleHelper — 样式工具静态类
 *
 * 统一处理 style 对象和字符串的转换、解析、展开
 */
export class StyleHelper {
    /**
     * 解析 style 字符串为对象
     *
     * @example
     * StyleHelper.parse('color: red; font-size: 16px')
     * // → { color: 'red', fontSize: '16px' }
     */
    static parse(styleStr: string): Record<string, any> {
        const result: Record<string, any> = {};
        if (!styleStr) return result;

        styleStr.split(';').forEach(decl => {
            const parts = decl.split(':').map(s => s.trim());
            if (parts.length === 2 && parts[0]) {
                const key = parts[0].replace(/-([a-z])/g, (_, l) => l.toUpperCase());
                result[key] = parts[1];
            }
        });
        return result;
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
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            const cssVal =
                typeof val === 'number' && !['zIndex', 'opacity', 'flex'].includes(key)
                    ? `${val}px`
                    : val;
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
                    target[key] = value;
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
