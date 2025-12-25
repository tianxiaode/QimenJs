/**
 * 根据键选择器函数对数组进行排序
 * @template T 数组元素类型
 * @template K 键类型
 * @param {T[]} arr 要排序的数组
 * @param {(item: T) => K} keySelector 用于提取排序键的函数
 * @param {'asc' | 'desc'} [order='asc'] 排序顺序，默认为升序('asc')
 * @returns {T[]} 返回排序后的新数组，不修改原数组
 */
export function sortByKey<T, K>(
    arr: T[],
    keySelector: (item: T) => K,
    order: 'asc' | 'desc' = 'asc'
): T[] {
    const compareFn = (a: T, b: T) => {
        const keyA = keySelector(a);
        const keyB = keySelector(b);

        // 处理 null/undefined
        if (keyA == null && keyB == null) return 0;
        if (keyA == null) return order === 'asc' ? -1 : 1;
        if (keyB == null) return order === 'asc' ? 1 : -1;

        // 数字比较
        if (typeof keyA === 'number' && typeof keyB === 'number') {
            return order === 'asc' ? keyA - keyB : keyB - keyA;
        }

        // 日期比较
        if (keyA instanceof Date && keyB instanceof Date) {
            const timeA = keyA.getTime();
            const timeB = keyB.getTime();
            return order === 'asc' ? timeA - timeB : timeB - timeA;
        }

        // 字符串比较
        const strA = String(keyA);
        const strB = String(keyB);
        return order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    };

    // 使用 sortWith 函数进行排序
    return sortWith(arr, compareFn);
}

// 导入 sortWith 函数，因为它在 sortByKey 中被使用
import { sortWith } from './sortWith';