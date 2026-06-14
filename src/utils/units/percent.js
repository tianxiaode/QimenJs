"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitsPercent = unitsPercent;
exports.unitsRatio = unitsRatio;
/**
 * 计算数值在基数中的百分比值
 * @param value 百分比值（如0.5表示50%）
 * @param base 基数值
 * @returns 百分比对应的数值
 */
function unitsPercent(value, base) {
    return base * value;
}
/**
 * 计算两个数值之间的比率
 * @param value 数值
 * @param base 基数值
 * @returns value与base的比率
 */
function unitsRatio(value, base) {
    return value / base;
}
//# sourceMappingURL=percent.js.map