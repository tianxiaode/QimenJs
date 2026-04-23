import { hexToRgb } from './hexToRgb';
import { rgbToHsl } from './rgbToHsl';
import { hslToHex } from './hslToHex';

/**
 * 生成颜色的明暗变体
 * @param {string} hex - 原始十六进制颜色值
 * @param {number[]} lightnessSteps - 亮度调整步长数组，用于生成较亮的颜色
 * @param {number} darkStep - 暗度调整步长，用于生成较暗的颜色
 * @returns {Record<string, string>} 包含不同明暗变体的映射对象
 */
export function generateColorShades(
    hex: string,
    lightnessSteps = [3, 5, 7, 8, 9],
    darkStep = 2
) {
    const [r, g, b] = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    const shades = {} as Record<string, string>;
    // 生成较亮色
    lightnessSteps.forEach((step) => {
        shades[`light-${step}`] = hslToHex(h, s, Math.max(0, l - step));
    });
    // 生成较暗色
    shades[`dark-${darkStep}`] = hslToHex(h, s, Math.min(100, l + darkStep));
    return shades;
}