/**
 * 将数值根据指定单位格式化为字符串
 * @param value 要格式化的数值
 * @param unit 单位（px/rem/em）
 * @param ctx 上下文对象，包含根字体大小和字体大小
 * @returns 格式化后的带单位字符串
 */
export declare function formatPx(value: number, unit: 'px' | 'rem' | 'em', ctx: {
    rootFontSize?: number;
    fontSize?: number;
}): string;
/**
 * 将数字转换为百分比格式
 * @param value 要转换的数字
 * @returns 百分比格式的字符串
 */
export declare function percent(value: number): string;
/**
 * 将值保留到指定精度的小数位数
 * @param value 要处理的值
 * @param precision 保留的小数位数
 * @returns 保留指定精度后的字符串
 */
export declare function toFixed(value: number, precision: number): string;
//# sourceMappingURL=format.d.ts.map