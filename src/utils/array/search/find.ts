import { assertArray } from '../../validation';

/**
 * 在数组中查找具有指定字段和值的项
 */
export function findItem<T, K extends keyof T>(
  arr: T[],
  field: K,
  value: T[K]
): T | undefined {
  assertArray(arr, { functionName:'findItem'});
  
  if (arr.length === 0) {
    return undefined;
  }
  
  return arr.find(item => {
    const itemValue = item[field];
    
    // 特殊处理 NaN
    if (typeof value === 'number' && typeof itemValue === 'number' && 
        isNaN(value) && isNaN(itemValue)) {
      return true;
    }
    
    return itemValue === value;
  });
}
