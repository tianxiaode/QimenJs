/**
 * 移除数组中的重复元素
 * @template T 数组元素类型
 * @param {T[]} arr 需要去重的数组
 * @returns {T[]} 返回去重后的新数组
 */
export function removeDuplicates<T>(arr: T[]): T[] {
    const seen = new Set<T>();
    const result: T[] = [];

    for (const item of arr) {
        if (!seen.has(item)) {
            seen.add(item);
            result.push(item);
        }
    }

    return result;
}

/**
 * 根据指定字段去重
 * @template T 数组元素类型
 * @template K T的键名类型
 * @param {T[]} arr 需要去重的数组
 * @param {K | ((item: T) => any)} key 用于确定唯一性的键或函数
 * @returns {T[]} 返回根据指定字段去重后的新数组
 */
export function uniqueBy<T, K extends keyof T>(arr: T[], key: K | ((item: T) => any)): T[] {
    const seen = new Map<any, T>();

    for (const item of arr) {
        const keyValue = typeof key === 'function' ? key(item) : item[key];

        if (!seen.has(keyValue)) {
            seen.set(keyValue, item);
        }
    }

    return Array.from(seen.values());
}