/**
 * 定义排序的选择器，可以是对象的键名或者一个返回排序值的函数
 * @template T 被排序的数组元素类型
 */
type OrderSelector<T> = keyof T | ((item: T) => any);

/**
 * 定义单个排序条件的接口
 * @template T 被排序的数组元素类型
 */
interface OrderCondition<T> {
    /** 排序依据，可以是对象的键名或返回排序值的函数 */
    by: OrderSelector<T>;
    /** 排序方向，默认为升序 */
    order?: 'asc' | 'desc';
}

/** 
 * 比较函数映射表，根据不同数据类型使用不同的比较函数 
 */
const Comparators: Record<string, (a: any, b: any) => number> = {
    number: (a, b) => a - b,
    date: (a, b) => a.getTime() - b.getTime(),
    string: (a, b) => a.localeCompare(b),
    default: (a, b) => String(a).localeCompare(String(b)),
};

/**
 * 根据多个排序条件对数组进行排序
 * @template T 数组元素类型
 * @param {T[]} arr 要排序的数组
 * @param {OrderCondition<T>[]} conditions 排序条件数组，每个条件包含by字段和order顺序
 * @returns {T[]} 返回排序后的新数组，不修改原数组
 */
export function orderBy<T>(arr: T[], conditions: OrderCondition<T>[]): T[] {
    if (conditions.length === 0) return [...arr];

    const getValue = (item: T, by: OrderSelector<T>) => {
        return typeof by === 'function' ? by(item) : item[by];
    };

    const compareFn = (a: T, b: T): number => {
        for (const { by, order = 'asc' } of conditions) {
            const valA = getValue(a, by);
            const valB = getValue(b, by);

            // 1. 处理空值
            if (valA == null || valB == null) {
                if (valA === valB) continue;
                const res = valA == null ? -1 : 1;
                return order === 'desc' ? -res : res;
            }

            // 2. 识别类型并获取比较器
            const type = valA instanceof Date ? 'date' : typeof valA;
            const comparator = Comparators[type] || Comparators.default;

            // 3. 执行比较
            const result = comparator(valA, valB);
            if (result !== 0) {
                return order === 'desc' ? -result : result;
            }
        }
        return 0;
    };

    return [...arr].sort(compareFn);
}