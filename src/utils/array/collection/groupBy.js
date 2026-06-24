"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupBy = groupBy;
exports.countBy = countBy;
/**
 * 根据指定的键将数组元素分组到 Map 中
 * @template T 数组元素类型
 * @template K T的键名类型
 * @param {T[]} arr 需要分组的数组
 * @param {K} key 用于分组的键名
 * @returns {Map<T[K], T[]>} 返回一个 Map，键为分组依据的值，值为该组的元素数组
 */
function groupBy(arr, key) {
    const groups = new Map();
    for (const item of arr) {
        const keyValue = item[key];
        const group = groups.get(keyValue) || [];
        group.push(item);
        groups.set(keyValue, group);
    }
    return groups;
}
/**
 * 统计数组中每种元素出现的次数
 * @template T 数组元素类型
 * @param {T[]} arr 需要统计的数组
 * @param {(item: T) => any} [classifier] 可选的分类函数，用于确定每个元素的分类键；如果未提供，则使用元素本身作为键
 * @returns {Map<any, number>} 返回一个 Map，键为分类键，值为该键出现的次数
 */
function countBy(arr, classifier) {
    const counts = new Map();
    for (const item of arr) {
        const key = classifier ? classifier(item) : item;
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
}
//# sourceMappingURL=groupBy.js.map