/** 排序选择器，可以是对象的键名或一个提取排序值的函数 */
type OrderSelector<T> = keyof T | ((item: T) => any);

/** 排序条件接口 */
export interface OrderCondition<T> {
    /** 排序依据：可以是对象的键名或一个提取排序值的函数 */
    by: OrderSelector<T>;
    /** 排序方向，默认为升序 */
    order?: 'asc' | 'desc';
    /** 是否针对字符串开启自然排序 */
    natural?: boolean;
}

/** 比较函数映射表 */
const Comparators: Record<string, (a: any, b: any, natural?: boolean) => number> = {
    number: (a, b) => a - b,
    date: (a, b) => a.getTime() - b.getTime(),
    string: (a, b, natural) => {
        if (natural) {
            return new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(
                a,
                b
            );
        }
        return a.localeCompare(b);
    },
    default: (a, b) => String(a).localeCompare(String(b)),
};

/**
 * 按照指定条件对数组进行排序
 *
 * @template T - 数组元素类型
 * @param {T[]} arr - 需要排序的数组
 * @param {OrderCondition<T>[]} conditions - 排序条件数组，按条件顺序依次排序
 * @returns {T[]} 排序后的新数组（不影响原数组）
 *
 * @example
 * const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
 * const sorted = orderBy(data, [{ by: 'age', order: 'desc' }]);
 * // 返回: [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }]
 */
export function orderBy<T>(arr: T[], conditions: OrderCondition<T>[]): T[] {
    if (conditions.length === 0) return [...arr];

    return [...arr].sort((a, b) => {
        for (const { by, order = 'asc', natural } of conditions) {
            const valA = typeof by === 'function' ? by(a) : a[by];
            const valB = typeof by === 'function' ? by(b) : b[by];

            // 1. 处理空值 (统一逻辑：null/undefined 始终在最下)
            if (valA == null || valB == null) {
                if (valA === valB) continue;
                const res = valA == null ? 1 : -1;
                return order === 'desc' ? -res : res;
            }

            // 2. 识别类型
            const type = valA instanceof Date ? 'date' : typeof valA;
            const comparator = Comparators[type] || Comparators.default;

            // 3. 执行比较
            const result = comparator(valA, valB, natural);
            if (result !== 0) {
                return order === 'desc' ? -result : result;
            }
        }
        return 0;
    });
}

/**
 * 按指定字段对数组进行排序的便捷函数
 *
 * @template T - 数组元素类型
 * @param {T[]} arr - 需要排序的数组
 * @param {keyof T} field - 用于排序的字段
 * @param {'asc' | 'desc'} [order='asc'] - 排序方向，默认为升序
 * @returns {T[]} 排序后的新数组
 *
 * @example
 * const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
 * const sorted = sortBy(data, 'age');
 * // 返回: [{ name: 'Jane', age: 25 }, { name: 'John', age: 30 }]
 */
export const sortBy = <T>(arr: T[], field: keyof T, order: 'asc' | 'desc' = 'asc') =>
    orderBy(arr, [{ by: field, order }]);

/**
 * 使用自然排序算法对数组进行排序
 *
 * @template T - 数组元素类型
 * @param {T[]} arr - 需要排序的数组
 * @param {(item: T) => string} [keySelector] - 提取字符串键的函数，如果未提供则直接使用数组元素
 * @param {'asc' | 'desc'} [order='asc'] - 排序方向，默认为升序
 * @returns {T[]} 排序后的新数组
 *
 * @example
 * const data = ['item10', 'item1', 'item2'];
 * const sorted = naturalSort(data);
 * // 返回: ['item1', 'item2', 'item10']
 */
export const naturalSort = <T>(
    arr: T[],
    keySelector?: (item: T) => string,
    order: 'asc' | 'desc' = 'asc'
) =>
    orderBy(arr, [
        { by: (item: any) => (keySelector ? keySelector(item) : item), order, natural: true },
    ]);
