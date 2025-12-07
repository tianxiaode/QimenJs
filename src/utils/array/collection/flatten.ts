import { assertArray } from '../../validation';
import { InvalidInputError } from '../../error';
/**
 * 数组扁平化
 */
export function flatten<T>(arr: any[], depth: number = 1): T[] {
  assertArray(arr, 'flatten');
  
  if (depth < 0) {
    throw new InvalidInputError(
      "Depth must be a non-negative integer",
      { depth } as any
    );
  }
  
  const result: any[] = [];
  
  const flattenRecursive = (array: any[], currentDepth: number) => {
    for (const item of array) {
      if (Array.isArray(item) && currentDepth > 0) {
        flattenRecursive(item, currentDepth - 1);
      } else {
        result.push(item);
      }
    }
  };
  
  flattenRecursive(arr, depth);
  return result;
}
