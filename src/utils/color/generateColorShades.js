"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateColorShades = generateColorShades;
const hexToRgb_1 = require("./hexToRgb");
const rgbToHsl_1 = require("./rgbToHsl");
const hslToHex_1 = require("./hslToHex");
/**
 * 生成颜色的明暗变体
 * @param {string} hex - 原始十六进制颜色值
 * @param {number[]} lightnessSteps - 亮度调整步长数组，用于生成较亮的颜色
 * @param {number} darkStep - 暗度调整步长，用于生成较暗的颜色
 * @returns {Record<string, string>} 包含不同明暗变体的映射对象
 */
function generateColorShades(hex, lightnessSteps = [3, 5, 7, 8, 9], darkStep = 2) {
    const [r, g, b] = (0, hexToRgb_1.hexToRgb)(hex);
    const [h, s, l] = (0, rgbToHsl_1.rgbToHsl)(r, g, b);
    const shades = {};
    // 生成较亮色
    lightnessSteps.forEach((step) => {
        shades[`light-${step}`] = (0, hslToHex_1.hslToHex)(h, s, Math.max(0, l - step));
    });
    // 生成较暗色
    shades[`dark-${darkStep}`] = (0, hslToHex_1.hslToHex)(h, s, Math.min(100, l + darkStep));
    return shades;
}
//# sourceMappingURL=generateColorShades.js.map