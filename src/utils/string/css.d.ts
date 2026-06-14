/**
 * CSS单位处理工具函数
 */
export type CssUnitType = string | number | null | undefined;
/**
 * 将CSS单位值标准化为字符串
 * @param value CSS单位值
 * @returns 标准化后的CSS单位字符串
 */
export declare function normalizeCssUnit(value: CssUnitType): string;
/**
 * 将CSS单位字符串转换为数值
 * @param value CSS单位字符串或数值
 * @returns 解析出的数值
 */
export declare function cssUnitTypeToNumber(value: CssUnitType): number;
//# sourceMappingURL=css.d.ts.map