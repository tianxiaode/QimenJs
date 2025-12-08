/**
 * 基本类型检查函数
 * 这些函数用于检查 JavaScript 的基本数据类型
 */

/**
 * 检查是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 检查是否为数字（排除 NaN）
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 检查是否为有限数字（排除 Infinity 和 NaN）
 */
export function isFiniteNumber(value: any): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * 检查是否为整数
 */
export function isInteger(value: any): value is number {
  return Number.isInteger(value);
}

/**
 * 检查是否为正整数（大于0的整数）
 */
export function isPositiveInteger(value: any): value is number {
  return Number.isInteger(value) && value > 0;
}

/**
 * 检查是否为非负整数（大于等于0的整数）
 */
export function isNonNegativeInteger(value: any): value is number {
  return Number.isInteger(value) && value >= 0;
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * 检查是否为 Symbol
 */
export function isSymbol(value: any): value is symbol {
  return typeof value === 'symbol';
}

/**
 * 检查是否为 BigInt
 */
export function isBigInt(value: any): value is bigint {
  return typeof value === 'bigint';
}

/**
 * 检查值是否为原始类型（primitives）
 * 包括：string, number, boolean, symbol, bigint, undefined, null
 */
export function isPrimitive(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint' ||
    typeof value === 'undefined'
  );
}

/**
 * 检查值是否为真值（truthy）
 */
export function isTruthy(value: any): boolean {
  return !!value;
}

/**
 * 检查值是否为假值（falsy）
 */
export function isFalsy(value: any): boolean {
  return !value;
}

/**
 * 检查是否为 NaN（使用 Number.isNaN，比 isNaN 更严格）
 */
export function isNaN(value: any): value is number {
  return Number.isNaN(value);
}