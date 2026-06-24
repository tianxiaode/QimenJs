"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = clone;
exports.deepMerge = deepMerge;
const base_1 = require("./base");
/**
 * 深度克隆对象或数组
 *
 * 该函数会创建一个对象或数组的深度副本，确保克隆后的内容与原始内容完全独立
 * 支持以下类型的深度克隆：null, undefined, 基本类型, 数组, 日期, 正则表达式, 普通对象
 *
 * @param obj 需要克隆的对象或数组
 * @returns 返回对象或数组的深度副本
 *
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = clone(original);
 * cloned.b.c = 99;
 * console.log(original.b.c); // 输出: 2 (原对象未被修改)
 */
function clone(obj) {
    // 如果是 null 或 undefined，直接返回
    if (obj === null || obj === undefined) {
        return obj;
    }
    // 如果不是对象，直接返回
    if (typeof obj !== "object") {
        return obj;
    }
    // 如果是数组，创建一个新的数组
    if (Array.isArray(obj)) {
        return obj.map(item => clone(item));
    }
    // 如果是日期对象，创建新的日期对象
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    // 如果是正则表达式，创建新的正则表达式
    if (obj instanceof RegExp) {
        return new RegExp(obj);
    }
    // 如果是对象，递归克隆每个属性
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = clone(obj[key]);
        }
    }
    return result;
}
/**
 * 深度合并两个对象
 *
 * 将源对象的属性合并到目标对象中，如果目标对象和源对象有相同的属性，
 * 且两者都是对象，则递归合并这些属性。否则，源对象的值将覆盖目标对象的值。
 *
 * @param target 目标对象，将被修改并接收源对象的属性
 * @param source 源对象，其属性将被合并到目标对象
 * @returns 返回合并后的目标对象
 *
 * @example
 * const target = { a: 1, b: { c: 2 } };
 * const source = { b: { d: 3 }, e: 4 };
 * const result = deepMerge(target, source);
 * console.log(result); // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 */
function deepMerge(target, source) {
    // 创建目标对象的浅拷贝作为输出对象
    const output = { ...target };
    // 遍历源对象的所有自有属性
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            // 如果源对象和目标对象的属性都是对象，则递归合并
            if ((0, base_1.isObject)(source[key]) && (0, base_1.isObject)(target[key])) {
                output[key] = deepMerge(target[key], source[key]);
            }
            else {
                // 否则直接用源对象的属性覆盖目标对象的属性
                output[key] = source[key];
            }
        }
    }
    return output;
}
//# sourceMappingURL=clone.js.map