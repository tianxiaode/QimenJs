"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToRgb = hexToRgb;
/**
 * 将十六进制颜色值转换为RGB数组
 * @param {string} hex - 十六进制颜色值，如 "#FF0000"、"FF0000" 或简写格式 "#F00"
 * @returns {number[]} RGB数组，格式为 [r, g, b]，值范围 0-255
 */
function hexToRgb(hex) {
    // 去掉 `#` 符号
    hex = hex.replace(/^#/, "");
    // 处理简写格式 (如 #F00 -> #FF0000)
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b];
}
//# sourceMappingURL=hexToRgb.js.map