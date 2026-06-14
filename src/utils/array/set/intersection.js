"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersection = intersection;
exports.intersectionBy = intersectionBy;
/**
 * 计算两个数组的交集，返回在两个数组中都存在的元素
 * @template T 数组元素类型
 * @param {T[]} arr1 第一个数组
 * @param {T[]} arr2 第二个数组
 * @returns {T[]} 返回在 arr1 和 arr2 中都存在的元素组成的数组
 */
function intersection(arr1, arr2) {
    if (arr1.length === 0 || arr2.length === 0) {
        return [];
    }
    const set2 = new Set(arr2);
    return arr1.filter(item => set2.has(item));
}
/**
 * 根据指定字段计算两个对象数组的交集，返回在两个数组中对应字段值相同的元素
 * @template T 对象类型
 * @template K T的键名类型
 * @param {T[]} arr1 第一个对象数组
 * @param {T[]} arr2 第二个对象数组
 * @param {K} field 用于比较的字段名
 * @returns {T[]} 返回在 arr1 和 arr2 中对应字段值相同的元素组成的数组
 */
function intersectionBy(arr1, arr2, field) {
    if (arr1.length === 0 || arr2.length === 0) {
        return [];
    }
    const set2 = new Set(arr2.map(item => item[field]));
    return arr1.filter(item => set2.has(item[field]));
}
//# sourceMappingURL=intersection.js.map