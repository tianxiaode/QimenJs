/**
 * 将RGB值转换为HSL数组
 * @param {number} r - 红色值，范围 0-255
 * @param {number} g - 绿色值，范围 0-255
 * @param {number} b - 蓝色值，范围 0-255
 * @returns {[number, number, number]} HSL数组，格式为 [h, s, l]，其中 h 范围 0-360，s 和 l 范围 0-100
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
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
        h = h * 60;
    }
    return [Math.round(h), +(s * 100).toFixed(1), +(l * 100).toFixed(1)];
}