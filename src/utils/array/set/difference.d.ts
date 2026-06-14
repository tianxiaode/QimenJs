/**
 * 计算两个数组的差集，返回在第一个数组中但不在第二个数组中的元素
 * @template T 数组元素类型
 * @param {T[]} arr1 第一个数组
 * @param {T[]} arr2 第二个数组
 * @returns {T[]} 返回在 arr1 中但不在 arr2 中的元素组成的数组
 */
export declare function difference<T>(arr1: T[], arr2: T[]): T[];
/**
 * 根据指定字段计算两个对象数组的差集，返回在第一个数组中但不在第二个数组中对应字段值相同的元素
 * @template T 对象类型
 * @template K T的键名类型
 * @param {T[]} arr1 第一个对象数组
 * @param {T[]} arr2 第二个对象数组
 * @param {K} field 用于比较的字段名
 * @returns {T[]} 返回在 arr1 中但不在 arr2 中对应字段值相同的元素组成的数组
 */
export declare function differenceBy<T, K extends keyof T>(arr1: T[], arr2: T[], field: K): T[];
/**
 * 根据提供的迭代函数计算两个数组的差集，返回在第一个数组中但不在第二个数组中经迭代后值相同的元素
 * @template T 数组元素类型
 * @param {T[]} arr1 第一个数组
 * @param {T[]} arr2 第二个数组
 * @param {(item: T) => any} iteratee 用于生成比较值的迭代函数
 * @returns {T[]} 返回在 arr1 中但不在 arr2 中经迭代后值相同的元素组成的数组
 */
export declare function differenceWith<T>(arr1: T[], arr2: T[], iteratee: (item: T) => any): T[];
/**
 * 计算两个数组的对称差集，返回在其中一个数组中但不在两个数组中的元素
 * @template T 数组元素类型
 * @param {T[]} arr1 第一个数组
 * @param {T[]} arr2 第二个数组
 * @returns {T[]} 返回在 arr1 或 arr2 中但不在两者中的元素组成的数组
 */
export declare function symmetricDifference<T>(arr1: T[], arr2: T[]): T[];
/**
 * 根据指定字段计算两个对象数组的对称差集，返回在其中一个数组中但不在两个数组中对应字段值相同的元素
 * @template T 对象类型
 * @template K T的键名类型
 * @param {T[]} arr1 第一个对象数组
 * @param {T[]} arr2 第二个对象数组
 * @param {K} field 用于比较的字段名
 * @returns {T[]} 返回在 arr1 或 arr2 中但不在两者中对应字段值相同的元素组成的数组
 */
export declare function symmetricDifferenceBy<T, K extends keyof T>(arr1: T[], arr2: T[], field: K): T[];
/**
 * 根据提供的迭代函数计算两个数组的对称差集，返回在其中一个数组中但不在两个数组中经迭代后值相同的元素
 * @template T 数组元素类型
 * @param {T[]} arr1 第一个数组
 * @param {T[]} arr2 第二个数组
 * @param {(item: T) => any} iteratee 用于生成比较值的迭代函数
 * @returns {T[]} 返回在 arr1 或 arr2 中但不在两者中经迭代后值相同的元素组成的数组
 */
export declare function symmetricDifferenceWith<T>(arr1: T[], arr2: T[], iteratee: (item: T) => any): T[];
//# sourceMappingURL=difference.d.ts.map