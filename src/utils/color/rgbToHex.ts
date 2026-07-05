/**
 * 将RGB值转换为十六进制颜色值
 * @param {number} r - 红色值，范围 0-255
 * @param {number} g - 绿色值，范围 0-255
 * @param {number} b - 蓝色值，范围 0-255
 * @returns {string} 十六进制颜色值，格式为 "#RRGGBB"
 */
export function rgbToHex(r: number, g: number, b: number): string {
    // 确保值在有效范围内
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
