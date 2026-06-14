"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLengthToPx = resolveLengthToPx;
const parse_1 = require("./parse");
const length_1 = require("./length");
/**
 * 将长度值（字符串或数字）解析并转换为像素值
 * @param input 长度值，可以是数字或带单位的字符串（如 '16px', '2rem'）
 * @param element 用于获取字体大小的DOM元素（可选，默认使用document.documentElement）
 * @returns 转换后的像素值
 */
function resolveLengthToPx(input, element) {
    if (typeof input === 'number') {
        return input;
    }
    const parsed = (0, parse_1.parseLength)(input);
    if (!parsed) {
        throw new Error(`Invalid length: ${input}`);
    }
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const fontSize = element ? parseFloat(getComputedStyle(element).fontSize) : rootFontSize;
    const ctx = {
        rootFontSize,
        fontSize,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
    };
    try {
        // Try to convert using our standard conversion logic
        return (0, length_1.toPx)(parsed, ctx);
    }
    catch (error) {
        // If standard conversion fails (e.g., for units not supported by toPx),
        // fallback to browser-based resolution
        return resolveByBrowser(input, element || document.body);
    }
}
/**
 * 使用浏览器原生解析能力将长度字符串转换为像素值
 * @param value 长度字符串
 * @param el DOM元素，用于创建临时元素进行解析
 * @returns 解析后的像素值
 */
function resolveByBrowser(value, el) {
    const div = document.createElement('div');
    div.style.width = value;
    el.appendChild(div);
    const px = div.getBoundingClientRect().width;
    el.removeChild(div);
    return px;
}
//# sourceMappingURL=resolve.js.map