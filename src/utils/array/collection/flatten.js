"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatten = flatten;
/**
 * 将嵌套数组按指定深度扁平化
 * @template T 扁平化后数组的元素类型
 * @param {any[]} arr 需要扁平化的嵌套数组
 * @param {number} [depth=1] 扁平化的深度，默认为1
 * @returns {T[]} 扁平化后的新数组
 */
function flatten(arr, depth = 1) {
    const result = [];
    /**
     * 递归处理数组扁平化
     * @param {any[]} array 当前处理的数组
     * @param {number} currentDepth 当前剩余的扁平化深度
     */
    const flattenRecursive = (array, currentDepth) => {
        for (const item of array) {
            // 如果当前项是数组且还有扁平化深度，则继续递归处理
            if (Array.isArray(item) && currentDepth > 0) {
                flattenRecursive(item, currentDepth - 1);
            }
            else {
                // 否则直接将当前项添加到结果数组中
                result.push(item);
            }
        }
    };
    // 开始递归处理
    flattenRecursive(arr, depth);
    return result;
}
//# sourceMappingURL=flatten.js.map