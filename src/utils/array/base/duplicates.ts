import { isArray  } from '../../validation';
import { InvalidInputError } from '@/utils/error';

/**
 * 移除数组中的重复元素
 */
export function removeDuplicates<T>(arr: T[]): T[] {

  if(isArray(arr)) throw new In;
  
  
  const seen = new Set<T>();
  const result: T[] = [];
  
  for (const item of arr) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  
  return result;
}

/**
 * 根据指定字段去重
 */
export function uniqueBy<T, K extends keyof T>(
  arr: T[], 
  key: K | ((item: T) => any)
): T[] {
    assertArray(arr,{ functionName: 'uniqueBy' });
  
  const seen = new Map<any, T>();
  
  for (const item of arr) {
    const keyValue = typeof key === 'function' 
      ? key(item)
      : item[key];
    
    if (!seen.has(keyValue)) {
      seen.set(keyValue, item);
    }
  }
  
  return Array.from(seen.values());
}
