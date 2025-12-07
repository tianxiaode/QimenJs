import { assertArray } from '../../validation';
import { InvalidInputError } from '../../error';

/**
 * 合并多个数组中的对象，并根据指定字段去重
 */
export function mergeArray<T extends Record<K, any>, K extends keyof T>(
  arrays: T[][],
  field: K
): T[] {
  assertArray(arrays, 'mergeArray');
  
  const resultMap = new Map<T[K], T>();
  
  for (const array of arrays) {
    assertArray(array, 'mergeArray.array');
    
    for (const item of array) {
      if (field in item) {
        resultMap.set(item[field], item);
      } else {
        throw new InvalidInputError(
          `Field ${String(field)} does not exist in one of the objects`,
          { field: String(field), object: item } as any
        );
      }
    }
  }
  
  return Array.from(resultMap.values());
}