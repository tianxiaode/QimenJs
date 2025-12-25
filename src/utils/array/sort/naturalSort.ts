/**
 * 使用自然排序算法对数组进行排序（支持数字在字符串中的自然排序，如 "item2" 会排在 "item10" 前面）
 * @template T 数组元素类型
 * @param {T[]} arr 要排序的数组
 * @param {(item: T) => string} [keySelector] 可选的键选择器函数，用于提取用于排序的字符串
 * @param {'asc' | 'desc'} [order='asc'] 排序顺序，默认为升序('asc')
 * @returns {T[]} 返回排序后的新数组，不修改原数组
 */
export function naturalSort<T>(
    arr: T[],
    keySelector?: (item: T) => string,
    order: 'asc' | 'desc' = 'asc'
): T[] {
    // 自然排序比较函数
    const naturalCompare = (a: string, b: string): number => {
        const collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: 'base',
        });
        return collator.compare(a, b);
    };

    const compareFn = (a: T, b: T) => {
        const strA = keySelector ? keySelector(a) : String(a);
        const strB = keySelector ? keySelector(b) : String(b);

        const result = naturalCompare(strA, strB);
        return order === 'asc' ? result : -result;
    };

    // 使用 sortWith 函数进行排序
    return sortWith(arr, compareFn);
}

// 导入 sortWith 函数，因为它在 naturalSort 中被使用
import { sortWith } from './sortWith';