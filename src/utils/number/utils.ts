/**
 * 将数字转换为百分比格式
 * @param number 要转换的数字或可转换为数字的值
 * @returns 百分比格式的字符串
 */
export function percent(number: number | string | null | undefined): string {
    // 处理 null 和 undefined
    if (number === null || number === undefined) {
        return '';
    }
    
    let num = Number(number);
    if (isNaN(num)) return '';
    if (num === 0) return '0%';
    num *= 100;
    return num + '%';
}

/**
 * 将值保留到指定精度的小数位数
 * @param value 要处理的值
 * @param precision 保留的小数位数
 * @returns 保留指定精度后的字符串
 */
export function toFixed(value: any, precision: number): string {
    // 确保 value 是数字类型
    const numValue = Number(value);
    if (isNaN(numValue)) {
        throw new Error('Value is not a valid number');
    }
    return numValue.toFixed(precision);
}

