/**
 * 将十六进制颜色值转换为RGB数组
 * @param {string} hex - 十六进制颜色值，如 "#FF0000"、"FF0000" 或简写格式 "#F00"
 * @returns {number[]} RGB数组，格式为 [r, g, b]，值范围 0-255
 */
export function hexToRgb(hex: string): number[] {
    // 去掉 `#` 符号
    hex = hex.replace(/^#/, '');

    // 处理简写格式 (如 #F00 -> #FF0000)
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map(char => char + char)
            .join('');
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}
