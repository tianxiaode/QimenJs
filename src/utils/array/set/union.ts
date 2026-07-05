/**
 * 合并多个数组，并根据指定字段去重
 *
 * @description
 * 该函数接收一个二维数组和一个字段名，将所有数组中的对象根据指定字段的值进行去重合并。
 * 如果多个对象具有相同的字段值，则后面的会覆盖前面的。
 *
 * @template T - 数组元素的类型，必须是包含字段K的对象
 * @template K - 对象中的键名类型
 *
 * @param arrays - 包含多个对象数组的二维数组
 * @param field - 用于去重比较的字段名
 *
 * @returns 合并后并去重的对象数组
 *
 * @example
 * ```ts
 * const users1 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
 * const users2 = [{ id: 1, name: 'Alice2' }, { id: 3, name: 'Charlie' }];
 * const result = mergeArray([users1, users2], 'id');
 * // 结果: [{ id: 1, name: 'Alice2' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }]
 * ```
 */
export function mergeArray<T extends Record<K, any>, K extends keyof T>(
    arrays: T[][],
    field: K
): T[] {
    const resultMap = new Map<T[K], T>();

    for (const array of arrays) {
        for (const item of array) {
            if (field in item) {
                resultMap.set(item[field], item);
            }
        }
    }

    return Array.from(resultMap.values());
}
