"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.difference = difference;
exports.differenceBy = differenceBy;
exports.differenceWith = differenceWith;
exports.symmetricDifference = symmetricDifference;
exports.symmetricDifferenceBy = symmetricDifferenceBy;
exports.symmetricDifferenceWith = symmetricDifferenceWith;
/**
 * 计算两个数组的差集，返回在第一个数组中但不在第二个数组中的元素
 * @template T 数组元素类型
 * @param {T[]} arr1 第一个数组
 * @param {T[]} arr2 第二个数组
 * @returns {T[]} 返回在 arr1 中但不在 arr2 中的元素组成的数组
 */
function difference(arr1, arr2) {
    if (arr1.length === 0) {
        return [];
    }
    if (arr2.length === 0) {
        return [...arr1];
    }
    const set2 = new Set(arr2);
    return arr1.filter(item => !set2.has(item));
}
/**
 * 根据指定字段计算两个对象数组的差集，返回在第一个数组中但不在第二个数组中对应字段值相同的元素
 * @template T 对象类型
 * @template K T的键名类型
 * @param {T[]} arr1 第一个对象数组
 * @param {T[]} arr2 第二个对象数组
 * @param {K} field 用于比较的字段名
 * @returns {T[]} 返回在 arr1 中但不在 arr2 中对应字段值相同的元素组成的数组
 */
function differenceBy(arr1, arr2, field) {
    if (arr1.length === 0) {
        return [];
    }
    if (arr2.length === 0) {
        return [...arr1];
    }
    const fieldValues = new Set(arr2.map(item => item[field]));
    return arr1.filter(item => !fieldValues.has(item[field]));
}
/**
 * 根据提供的迭代函数计算两个数组的差集，返回在第一个数组中但不在第二个数组中经迭代后值相同的元素
 * @template T 数组元素类型
 * @param {T[]} arr1 第一个数组
 * @param {T[]} arr2 第二个数组
 * @param {(item: T) => any} iteratee 用于生成比较值的迭代函数
 * @returns {T[]} 返回在 arr1 中但不在 arr2 中经迭代后值相同的元素组成的数组
 */
function differenceWith(arr1, arr2, iteratee) {
    if (arr1.length === 0) {
        return [];
    }
    if (arr2.length === 0) {
        return [...arr1];
    }
    const values = new Set(arr2.map(item => iteratee(item)));
    return arr1.filter(item => !values.has(iteratee(item)));
}
/**
 * 计算两个数组的对称差集，返回在其中一个数组中但不在两个数组中的元素
 * @template T 数组元素类型
 * @param {T[]} arr1 第一个数组
 * @param {T[]} arr2 第二个数组
 * @returns {T[]} 返回在 arr1 或 arr2 中但不在两者中的元素组成的数组
 */
function symmetricDifference(arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const diff1 = arr1.filter(item => !set2.has(item));
    const diff2 = arr2.filter(item => !set1.has(item));
    return [...diff1, ...diff2];
}
/**
 * 根据指定字段计算两个对象数组的对称差集，返回在其中一个数组中但不在两个数组中对应字段值相同的元素
 * @template T 对象类型
 * @template K T的键名类型
 * @param {T[]} arr1 第一个对象数组
 * @param {T[]} arr2 第二个对象数组
 * @param {K} field 用于比较的字段名
 * @returns {T[]} 返回在 arr1 或 arr2 中但不在两者中对应字段值相同的元素组成的数组
 */
function symmetricDifferenceBy(arr1, arr2, field) {
    if (arr1.length === 0 && arr2.length === 0) {
        return [];
    }
    const values1 = new Set(arr1.map(item => item[field]));
    const values2 = new Set(arr2.map(item => item[field]));
    const diff1 = arr1.filter(item => !values2.has(item[field]));
    const diff2 = arr2.filter(item => !values1.has(item[field]));
    return [...diff1, ...diff2];
}
/**
 * 根据提供的迭代函数计算两个数组的对称差集，返回在其中一个数组中但不在两个数组中经迭代后值相同的元素
 * @template T 数组元素类型
 * @param {T[]} arr1 第一个数组
 * @param {T[]} arr2 第二个数组
 * @param {(item: T) => any} iteratee 用于生成比较值的迭代函数
 * @returns {T[]} 返回在 arr1 或 arr2 中但不在两者中经迭代后值相同的元素组成的数组
 */
function symmetricDifferenceWith(arr1, arr2, iteratee) {
    if (arr1.length === 0 && arr2.length === 0) {
        return [];
    }
    const values1 = new Set(arr1.map(item => iteratee(item)));
    const values2 = new Set(arr2.map(item => iteratee(item)));
    const diff1 = arr1.filter(item => !values2.has(iteratee(item)));
    const diff2 = arr2.filter(item => !values1.has(iteratee(item)));
    return [...diff1, ...diff2];
}
//# sourceMappingURL=difference.js.map