/**
 * 将 style 对象转换为 CSS 字符串
 */
export function styleToString(style: Record<string, any> | string): string {
    if (typeof style === 'string') return style;
    if (!style) return '';

    return Object.entries(style)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => {
            // 驼峰转连字符
            const key = k.replace(/([A-Z])/g, '-$1').toLowerCase();
            // 自动加 px
            const value =
                typeof v === 'number' && !['zIndex', 'opacity', 'flex'].includes(k) ? `${v}px` : v;
            return `${key}: ${value}`;
        })
        .join('; ');
}
