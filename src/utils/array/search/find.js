"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findItem = findItem;
/**
 * 根据指定字段和值在数组中查找匹配的项
 * @template T 数组元素类型
 * @template K T的键名类型
 * @param {T[]} arr 要搜索的数组
 * @param {K} field 用于匹配的字段名
 * @param {T[K]} value 要匹配的值
 * @returns {T | undefined} 返回匹配的项，如果未找到则返回undefined
 */
function findItem(arr, field, value) {
    if (arr.length === 0) {
        return undefined;
    }
    return arr.find(item => {
        const itemValue = item[field];
        // 特殊处理 NaN
        if (typeof value === 'number' &&
            typeof itemValue === 'number' &&
            isNaN(value) &&
            isNaN(itemValue)) {
            return true;
        }
        return itemValue === value;
    });
}
//# sourceMappingURL=find.js.map