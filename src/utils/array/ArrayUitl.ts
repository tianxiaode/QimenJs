
import { removeDuplicates, uniqueBy, splitArray, removeValues   } from './base'
import { intersectionBy, difference, differenceBy, differenceWith, symmetricDifference, symmetricDifferenceBy, symmetricDifferenceWith, mergeArray } from './set'
import { sortBy } from './sort'
import { findItem, includes } from './search'
import { groupBy, countBy, chunk, flatten } from './collection'
import { sample, shuffle } from './random'
// 命名空间导出（可选）
export const ArrayUtils = {
  // 基础操作
  removeDuplicates,
  uniqueBy,
  removeValues,
  splitArray,
  
  // 集合操作
  intersectionBy,
  difference,
  differenceBy,
  differenceWith,
  symmetricDifference,
  symmetricDifferenceBy,
  symmetricDifferenceWith,
  mergeArray,
  
  // 排序操作
  sortBy,
  
  // 查找操作
  findItem,
  includes,
  
  // 集合变换
  groupBy,
  countBy,
  chunk,
  flatten,
  
  // 随机操作
  sample,
  shuffle,
};