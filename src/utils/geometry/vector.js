"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtract = subtract;
exports.add = add;
exports.scale = scale;
/**
 * 计算两个点之间的差值向量 (a - b)
 * @param a 被减数点
 * @param b 减数点
 * @returns 差值向量
 */
function subtract(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
/**
 * 计算两个点的和 (a + b)
 * @param a 第一个点
 * @param b 第二个点
 * @returns 和向量
 */
function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
/**
 * 将向量按比例缩放
 * @param v 要缩放的向量
 * @param k 缩放因子
 * @returns 缩放后的向量
 */
function scale(v, k) {
    return { x: v.x * k, y: v.y * k };
}
//# sourceMappingURL=vector.js.map