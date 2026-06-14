"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToHsl = hexToHsl;
/**
 * 将十六进制颜色值转换为HSL字符串
 * @param {string} hex - 十六进制颜色值，如 "#FF0000" 或 "FF0000"
 * @returns {string} HSL字符串，格式为 "hsl(h, s%, l%)"
 */
function hexToHsl(hex) {
    // 去掉 `#` 符号
    hex = hex.replace(/^#/, "");
    // 解析 hex 值为 RGB
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    // 找出最大和最小 RGB 值
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    if (max === min) {
        h = s = 0; // 灰色
    }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h *= 60;
    }
    // 转换为百分比并四舍五入
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    return `hsl(${Math.round(h)}, ${s}%, ${l}%)`;
}
//# sourceMappingURL=hexToHsl.js.map