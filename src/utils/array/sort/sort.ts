/** 排序选择器 */
type OrderSelector<T> = keyof T | ((item: T) => any);

/** 排序条件 */
export interface OrderCondition<T> {
    by: OrderSelector<T>;
    order?: 'asc' | 'desc';
    natural?: boolean; // 是否针对字符串开启自然排序
}

/** * 比较函数映射表 (保留你喜欢的结构)
 */
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
 * 统一排序引擎
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

/** 语法糖扩展 */
export const sortBy = <T>(arr: T[], field: keyof T, order: 'asc' | 'desc' = 'asc') =>
    orderBy(arr, [{ by: field, order }]);

export const naturalSort = <T>(
    arr: T[],
    keySelector?: (item: T) => string,
    order: 'asc' | 'desc' = 'asc'
) =>
    orderBy(arr, [
        { by: (item: any) => (keySelector ? keySelector(item) : item), order, natural: true },
    ]);
