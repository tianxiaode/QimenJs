/**
 * 检查给定值是否为对象（非数组，非 null）
 *
 * @param obj 任意值，需要检查的值
 * @returns boolean，如果是对象返回 true，否则返回 false
 *
 * @example
 * isObject({}); // true
 * isObject([]); // false
 * isObject(null); // false
 * isObject('string'); // false
 * isObject(123); // false
 */
declare function isObject(obj: any): boolean;
export { isObject };
//# sourceMappingURL=base.d.ts.map