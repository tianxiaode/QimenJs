import { ValidationError } from '../../error';
import { assertArray  } from '../../validation';

/**
 * 移除数组中指定的值
 */
export function removeValues<T>(arr: T[], valuesToRemove: T[]): T[] {
  assertArray(arr, { functionName:'removeValues'});
  assertArray(valuesToRemove, {functionName:'removeValues.valuesToRemove'});
  
  if (arr.length === 0) {
    return [];
  }
  
  const valuesSet = new Set(valuesToRemove);
  return arr.filter(item => !valuesSet.has(item));
}

/**
 * 根据条件拆分数组
 */
export function splitArray<T>(
  arr: T[],
  condition: (item: T, index: number) => boolean
): [T[], T[]] {
  assertArray(arr, { functionName:'splitArray'});
  
  if (typeof condition !== 'function') {
    throw new ValidationError(
      "Condition must be a function",
      { value: condition, expected: 'Function' } as any
    );
  }
  
  const matches: T[] = [];
  const nonMatches: T[] = [];
  
  for (let i = 0; i < arr.length; i++) {
    try {
      if (condition(arr[i], i)) {
        matches.push(arr[i]);
      } else {
        nonMatches.push(arr[i]);
      }
    } catch (error) {
      console.error(`Error in condition function at index ${i}:`, error);
    }
  }
  
  return [matches, nonMatches];
}
