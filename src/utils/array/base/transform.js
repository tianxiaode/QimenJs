"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeValues = removeValues;
exports.splitArray = splitArray;
/**
 * 移除数组中指定的值
 * @template T 数组元素类型
 * @param {T[]} arr 需要移除元素的原数组
 * @param {T[]} valuesToRemove 需要从原数组中移除的值的数组
 * @returns {T[]} 返回移除指定值后的新数组
 */
function removeValues(arr, valuesToRemove) {
    if (arr.length === 0) {
        return [];
    }
    const valuesSet = new Set(valuesToRemove);
    return arr.filter(item => !valuesSet.has(item));
}
/**
 * 根据条件拆分数组
 * @template T 数组元素类型
 * @param {T[]} arr 需要拆分的数组
 * @param {(item: T, index: number) => boolean} condition 用于拆分数组的条件函数，返回true的元素将放入第一个数组，返回false的元素放入第二个数组
 * @returns {[T[], T[]]} 返回一个包含两个数组的元组：第一个数组包含满足条件的元素，第二个数组包含不满足条件的元素
 */
function splitArray(arr, condition) {
    const matches = [];
    const nonMatches = [];
    for (let i = 0; i < arr.length; i++) {
        try {
            if (condition(arr[i], i)) {
                matches.push(arr[i]);
            }
            else {
                nonMatches.push(arr[i]);
            }
        }
        catch (error) {
            console.error(`Error in condition function at index ${i}:`, error);
        }
    }
    return [matches, nonMatches];
}
//# sourceMappingURL=transform.js.map