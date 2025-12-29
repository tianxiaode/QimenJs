export function formatPx(
    value: number,
    unit: 'px' | 'rem' | 'em',
    ctx: { rootFontSize?: number; fontSize?: number }
): string {
    switch (unit) {
        case 'px':
            return `${value}px`;
        case 'rem':
            if (!ctx.rootFontSize) {
                throw new Error('rootFontSize required for rem');
            }
            return `${value / ctx.rootFontSize}rem`;
        case 'em':
            if (!ctx.fontSize) {
                throw new Error('fontSize required for em');
            }
            return `${value / ctx.fontSize}em`;
    }
}

/**
 * 将数字转换为百分比格式
 * @param number 要转换的数字或可转换为数字的值
 * @returns 百分比格式的字符串
 */
export function percent(value: number): string {
    return `${value * 100}%`;
}


/**
 * 将值保留到指定精度的小数位数
 * @param value 要处理的值
 * @param precision 保留的小数位数
 * @returns 保留指定精度后的字符串
 */
export function toFixed(value: number, precision: number): string {
    return value.toFixed(precision);
}

