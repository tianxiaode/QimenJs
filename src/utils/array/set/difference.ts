import { assertArray, assertFunction } from '../../validation';

/**
 * 获取数组差异（arr1 中有但 arr2 中没有的元素）
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  assertArray(arr1, { functionName:'difference.arr1'});
  assertArray(arr2, { functionName:'difference.arr2'});
  
  if (arr1.length === 0) {
    return [];
  }
  
  if (arr2.length === 0) {
    return [...arr1];
  }
  
  const set2 = new Set(arr2);
  return arr1.filter(item => !set2.has(item));
}

/**
 * 根据指定字段获取数组差异（对象数组）
 */
export function differenceBy<T, K extends keyof T>(
  arr1: T[],
  arr2: T[],
  field: K
): T[] {
  assertArray(arr1, { functionName:'differenceBy.arr1'});
  assertArray(arr2, { functionName:'differenceBy.arr2'});
  
  if (arr1.length === 0) {
    return [];
  }
  
  if (arr2.length === 0) {
    return [...arr1];
  }
  
  const fieldValues = new Set(arr2.map(item => item[field]));
  return arr1.filter(item => !fieldValues.has(item[field]));
}

/**
 * 根据函数获取数组差异
 */
export function differenceWith<T>(
  arr1: T[],
  arr2: T[],
  iteratee: (item: T) => any
): T[] {
  assertArray(arr1, { functionName:'differenceWith.arr1'});
  assertArray(arr2, { functionName:'differenceWith.arr2'});
  assertFunction(iteratee, {functionName:'differenceWith.iteratee'});
  
  if (arr1.length === 0) {
    return [];
  }
  
  if (arr2.length === 0) {
    return [...arr1];
  }
  
  const values = new Set(arr2.map(item => iteratee(item)));
  return arr1.filter(item => !values.has(iteratee(item)));
}

/**
 * 获取对称差集（两个数组中不共有的元素）
 */
export function symmetricDifference<T>(arr1: T[], arr2: T[]): T[] {
  assertArray(arr1, { functionName:'symmetricDifference.arr1'});
  assertArray(arr2, { functionName:'symmetricDifference.arr2'});
  
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  
  const diff1 = arr1.filter(item => !set2.has(item));
  const diff2 = arr2.filter(item => !set1.has(item));
  
  return [...diff1, ...diff2];
}

/**
 * 根据字段获取对称差集（对象数组）
 */
export function symmetricDifferenceBy<T, K extends keyof T>(
  arr1: T[],
  arr2: T[],
  field: K
): T[] {
  assertArray(arr1, { functionName:'symmetricDifferenceBy.arr1'});
  assertArray(arr2, { functionName:'symmetricDifferenceBy.arr2'});
  
  if (arr1.length === 0 && arr2.length === 0) {
    return [];
  }
  
  const values1 = new Set(arr1.map(item => item[field]));
  const values2 = new Set(arr2.map(item => item[field]));
  
  const diff1 = arr1.filter(item => !values2.has(item[field]));
  const diff2 = arr2.filter(item => !values1.has(item[field]));
  
  return [...diff1, ...diff2];
}

/**
 * 根据函数获取对称差集
 */
export function symmetricDifferenceWith<T>(
  arr1: T[],
  arr2: T[],
  iteratee: (item: T) => any
): T[] {
  assertArray(arr1, { functionName:'symmetricDifferenceWith.arr1'});
  assertArray(arr2, { functionName:'symmetricDifferenceWith.arr2'});
  assertFunction(iteratee, {functionName:'symmetricDifferenceWith.iteratee'});
  
  if (arr1.length === 0 && arr2.length === 0) {
    return [];
  }
  
  const values1 = new Set(arr1.map(item => iteratee(item)));
  const values2 = new Set(arr2.map(item => iteratee(item)));
  
  const diff1 = arr1.filter(item => !values2.has(iteratee(item)));
  const diff2 = arr2.filter(item => !values1.has(iteratee(item)));
  
  return [...diff1, ...diff2];
}
