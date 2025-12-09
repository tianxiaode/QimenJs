import { ValidationError } from '../../error';
import { assertArray } from '../../validation';

/**
 * 基于指定字段查找数组交集
 */
export function intersectionBy<T, K extends keyof T>(
  arr1: T[], 
  arr2: T[], 
  field: K
): T[] {
  assertArray(arr1, { functionName:'intersectionBy.arr1'});
  assertArray(arr2, { functionName:'intersectionBy.arr2'});
  
  if (typeof field !== 'string') {
    throw new ValidationError(
      "Field must be a string",
      { field } as any
    );
  }
  
  if (arr1.length === 0 || arr2.length === 0) {
    return [];
  }
  
  const set2 = new Set(arr2.map(item => item[field]));
  return arr1.filter(item => set2.has(item[field]));
}
