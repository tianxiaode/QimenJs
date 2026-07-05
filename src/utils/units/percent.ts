/**
 * 计算数值在基数中的百分比值
 * @param value 百分比值（如0.5表示50%）
 * @param base 基数值
 * @returns 百分比对应的数值
 */
export function unitsPercent(value: number, base: number): number {
    return base * value;
}

/**
 * 计算两个数值之间的比率
 * @param value 数值
 * @param base 基数值
 * @returns value与base的比率
 */
export function unitsRatio(value: number, base: number): number {
    return value / base;
}
