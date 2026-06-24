/**
 * 深度克隆对象或数组
 *
 * 该函数会创建一个对象或数组的深度副本，确保克隆后的内容与原始内容完全独立
 * 支持以下类型的深度克隆：null, undefined, 基本类型, 数组, 日期, 正则表达式, 普通对象
 *
 * @param obj 需要克隆的对象或数组
 * @returns 返回对象或数组的深度副本
 *
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = clone(original);
 * cloned.b.c = 99;
 * console.log(original.b.c); // 输出: 2 (原对象未被修改)
 */
export declare function clone<T>(obj: T): T;
/**
 * 深度合并两个对象
 *
 * 将源对象的属性合并到目标对象中，如果目标对象和源对象有相同的属性，
 * 且两者都是对象，则递归合并这些属性。否则，源对象的值将覆盖目标对象的值。
 *
 * @param target 目标对象，将被修改并接收源对象的属性
 * @param source 源对象，其属性将被合并到目标对象
 * @returns 返回合并后的目标对象
 *
 * @example
 * const target = { a: 1, b: { c: 2 } };
 * const source = { b: { d: 3 }, e: 4 };
 * const result = deepMerge(target, source);
 * console.log(result); // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 */
export declare function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any>;
//# sourceMappingURL=clone.d.ts.map