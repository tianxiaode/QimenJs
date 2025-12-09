import { assertArray } from '../../validation';

/**
 * 根据指定字段将数组分组
 */
export function groupBy<T, K extends keyof T>(
  arr: T[], 
  key: K
): Map<T[K], T[]> {
  assertArray(arr, { functionName:'groupBy'});
  
  const groups = new Map<T[K], T[]>();
  
  for (const item of arr) {
    const keyValue = item[key];
    const group = groups.get(keyValue) || [];
    group.push(item);
    groups.set(keyValue, group);
  }
  
  return groups;
}

/**
 * 统计数组中各元素出现的次数
 */
export function countBy<T>(
  arr: T[], 
  classifier?: (item: T) => any
): Map<any, number> {
  assertArray(arr, { functionName:'countBy'});
  
  const counts = new Map<any, number>();
  
  for (const item of arr) {
    const key = classifier ? classifier(item) : item;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  
  return counts;
}
