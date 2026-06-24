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
export declare function orderBy<T>(arr: T[], conditions: OrderCondition<T>[]): T[];
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
export declare const sortBy: <T>(arr: T[], field: keyof T, order?: "asc" | "desc") => T[];
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
export declare const naturalSort: <T>(arr: T[], keySelector?: (item: T) => string, order?: "asc" | "desc") => T[];
export {};
//# sourceMappingURL=sort.d.ts.map