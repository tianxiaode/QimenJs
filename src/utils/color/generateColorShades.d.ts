/**
 * 生成颜色的明暗变体
 * @param {string} hex - 原始十六进制颜色值
 * @param {number[]} lightnessSteps - 亮度调整步长数组，用于生成较亮的颜色
 * @param {number} darkStep - 暗度调整步长，用于生成较暗的颜色
 * @returns {Record<string, string>} 包含不同明暗变体的映射对象
 */
export declare function generateColorShades(hex: string, lightnessSteps?: number[], darkStep?: number): Record<string, string>;
//# sourceMappingURL=generateColorShades.d.ts.map