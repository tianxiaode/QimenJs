"use strict";
/**
 * CSS单位处理工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCssUnit = normalizeCssUnit;
exports.cssUnitTypeToNumber = cssUnitTypeToNumber;
/**
 * 将CSS单位值标准化为字符串
 * @param value CSS单位值
 * @returns 标准化后的CSS单位字符串
 */
function normalizeCssUnit(value) {
    if (value === 0)
        return "0";
    if (typeof value === "number")
        return value + "px";
    if (value === null)
        return "null";
    if (value === undefined)
        return "undefined";
    return value;
}
/**
 * 将CSS单位字符串转换为数值
 * @param value CSS单位字符串或数值
 * @returns 解析出的数值
 */
function cssUnitTypeToNumber(value) {
    if (typeof value === "number")
        return value;
    const match = value.match(/^(\d+(\.\d+)?)(px|em|rem|%|pt|pc|ex|ch|vw|vh|vmin|vmax)?$/);
    if (match) {
        const num = parseFloat(match[1]);
        return num;
    }
    return 0;
}
//# sourceMappingURL=css.js.map