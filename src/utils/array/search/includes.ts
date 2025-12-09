import { assertArray } from '../../validation';

/**
 * 检查数组是否包含某个元素（支持简单值和对象）
 */
export function includes<T>(arr: T[], value: T, field?: keyof T): boolean {
  assertArray(arr, { functionName:'includes'});
  
  if (arr.length === 0) {
    return false;
  }
  
  // 如果指定了字段且 value 是对象
  if (field && typeof value === 'object' && value !== null) {
    const fieldValue = (value as any)[field];
    return arr.some(item => item[field] === fieldValue);
  }
  
  // 简单值比较
  return arr.includes(value);
}
