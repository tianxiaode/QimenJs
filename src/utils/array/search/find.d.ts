/**
 * 根据指定字段和值在数组中查找匹配的项
 * @template T 数组元素类型
 * @template K T的键名类型
 * @param {T[]} arr 要搜索的数组
 * @param {K} field 用于匹配的字段名
 * @param {T[K]} value 要匹配的值
 * @returns {T | undefined} 返回匹配的项，如果未找到则返回undefined
 */
export declare function findItem<T, K extends keyof T>(arr: T[], field: K, value: T[K]): T | undefined;
//# sourceMappingURL=find.d.ts.map