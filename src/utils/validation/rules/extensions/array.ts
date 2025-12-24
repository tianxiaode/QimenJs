import { ArrayRuleOptions } from '../core';

export interface ArrayRequiredRuleOptions extends Omit<
    ArrayRuleOptions,
    'required' | 'nullable' | 'empty'
> {}

/** 关系约束 */
//   some?: ValidationRuleBase;
//   every?: ValidationRuleBase;
//   none?: ValidationRuleBase;

export interface UniqueByRuleOptions<T = any> extends ArrayRequiredRuleOptions {
    /**
     * 指定用于唯一性比较的属性名或计算函数
     *
     * - 当为字符串时：表示对象的属性名，将使用该属性的值进行比较
     * - 当为函数时：接收数组元素作为参数，返回用于比较的值
     */
    uniqueBy: string | ((item: T) => any);
}

/**
 * 数组排序验证规则选项
 *
 * 该接口用于配置数组元素的排序验证规则，确保数组元素按照指定顺序排列。
 *
 * @template T - 数组元素的类型
 *
 * @example
 * ```typescript
 * // 升序排列
 * const ascRule: SortedRuleOptions<number> = {
 *   sorted: 'asc'
 * };
 *
 * // 自定义排序函数
 * const customRule: SortedRuleOptions<User> = {
 *   sorted: (a, b) => a.age - b.age // 按年龄升序排列
 * };
 * ```
 */
export interface SortedRuleOptions<T = any> extends ArrayRequiredRuleOptions {
    /**
     * 排序方式或自定义排序函数
     *
     * - 'asc': 升序排列
     * - 'desc': 降序排列
     * - 函数: 自定义比较函数，返回值大于0表示第一个元素应在第二个元素之后
     */
    sorted: 'asc' | 'desc' | ((a: T, b: T) => number);
}
