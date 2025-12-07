/**
 * 类型检查函数
 */

/**
 * 检查是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * 检查是否为对象（非null，非数组）
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 检查是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * 检查是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 检查是否为数字（包括检查NaN）
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 检查是否为整数
 */
export function isInteger(value: any): value is number {
  return Number.isInteger(value);
}

/**
 * 检查是否为正整数
 */
export function isPositiveInteger(value: any): value is number {
  return Number.isInteger(value) && value > 0;
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查是否为日期对象
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * 检查是否为空值（null或undefined）
 */
export function isNil(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * 检查是否为空字符串
 */
export function isEmptyString(value: any): boolean {
  return typeof value === 'string' && value.trim() === '';
}

/**
 * 检查数组是否为空
 */
export function isEmptyArray(value: any): boolean {
  return Array.isArray(value) && value.length === 0;
}

/**
 * 检查对象是否为空
 */
export function isEmptyObject(value: any): boolean {
  return isObject(value) && Object.keys(value).length === 0;
}