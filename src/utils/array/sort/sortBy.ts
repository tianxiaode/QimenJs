/**
 * 根据指定字段对数组进行排序
 * @template T 数组元素类型
 * @param {T[]} arr 要排序的数组
 * @param {keyof T} field 用于排序的字段名
 * @param {'asc' | 'desc'} [order='asc'] 排序顺序，默认为升序('asc')
 * @returns {T[]} 返回排序后的新数组，不修改原数组
 */
export function sortBy<T>(arr: T[], field: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    const result = [...arr];

    result.sort((a, b) => {
        const valueA = a[field as keyof T];
        const valueB = b[field as keyof T];

        // 处理 null/undefined
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return order === 'asc' ? -1 : 1;
        if (valueB == null) return order === 'asc' ? 1 : -1;

        // 数字比较
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        }

        // 日期比较
        if (valueA instanceof Date && valueB instanceof Date) {
            const timeA = valueA.getTime();
            const timeB = valueB.getTime();
            return order === 'asc' ? timeA - timeB : timeB - timeA;
        }

        // 字符串比较
        const strA = String(valueA);
        const strB = String(valueB);
        return order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return result;
}