import { assertArray, assertFunction } from '../../validation';
import { InvalidInputError } from '../../error';

/**
 * 根据指定字段和顺序对数组进行排序（不修改原数组）
 */
export function sortBy<T>(
  arr: T[], 
  field: keyof T, 
  order: 'asc' | 'desc' = 'asc'
): T[] {
  assertArray(arr, 'sortBy');
  
  if (typeof field !== 'string') {
    throw new InvalidInputError(
      'Field name must be a string',
      { field } as any
    );
  }
  
  const result = [...arr];
  
  result.sort((a, b) => {
    const valueA = a[field as keyof T];
    const valueB = b[field as keyof T];
    
    // 处理 null/undefined
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return order === 'asc' ? -1 : 1;
    if (valueB == null) return order === 'asc' ? 1 : -1;
    
    // 数字比较
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return order === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    // 日期比较
    if (valueA instanceof Date && valueB instanceof Date) {
      const timeA = valueA.getTime();
      const timeB = valueB.getTime();
      return order === 'asc' ? timeA - timeB : timeB - timeA;
    }
    
    // 字符串比较
    const strA = String(valueA);
    const strB = String(valueB);
    return order === 'asc' 
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });
  
  return result;
}


/**
 * 使用自定义比较函数对数组进行排序（不修改原数组）
 * @param arr 要排序的数组
 * @param compareFn 比较函数，接受两个参数，返回负数、零或正数
 * @returns 排序后的新数组
 * 
 * @example
 * const arr = [5, 3, 8, 1];
 * const sorted = sortWith(arr, (a, b) => a - b); // 升序排序
 */
export function sortWith<T>(
  arr: T[], 
  compareFn: (a: T, b: T) => number
): T[] {
  assertArray(arr, 'arr', 'sortWith');
  assertFunction(compareFn, 'compareFn', 'sortWith');
  
  // 返回新数组，不修改原数组
  return [...arr].sort(compareFn);
}

/**
 * 使用自定义键提取函数对数组进行排序
 * @param arr 要排序的数组
 * @param keySelector 键提取函数，用于从元素中提取排序键
 * @param order 排序顺序，默认为升序
 * @returns 排序后的新数组
 * 
 * @example
 * const users = [
 *   { name: 'Alice', age: 30 },
 *   { name: 'Bob', age: 25 }
 * ];
 * // 按年龄排序
 * const sorted = sortByKey(users, user => user.age, 'desc');
 */
export function sortByKey<T, K>(
  arr: T[], 
  keySelector: (item: T) => K,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  assertArray(arr, 'arr', 'sortByKey');
  assertFunction(keySelector, 'keySelector', 'sortByKey');
  
  const compareFn = (a: T, b: T) => {
    const keyA = keySelector(a);
    const keyB = keySelector(b);
    
    // 处理 null/undefined
    if (keyA == null && keyB == null) return 0;
    if (keyA == null) return order === 'asc' ? -1 : 1;
    if (keyB == null) return order === 'asc' ? 1 : -1;
    
    // 数字比较
    if (typeof keyA === 'number' && typeof keyB === 'number') {
      return order === 'asc' ? keyA - keyB : keyB - keyA;
    }
    
    // 日期比较
    if (keyA instanceof Date && keyB instanceof Date) {
      const timeA = keyA.getTime();
      const timeB = keyB.getTime();
      return order === 'asc' ? timeA - timeB : timeB - timeA;
    }
    
    // 字符串比较
    const strA = String(keyA);
    const strB = String(keyB);
    return order === 'asc' 
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  };
  
  return sortWith(arr, compareFn);
}

/**
 * 支持多个排序条件的排序（类似 SQL 的 ORDER BY）
 * @param arr 要排序的数组
 * @param orders 排序条件数组，每个条件可以是字段名或自定义比较函数
 * @returns 排序后的新数组
 * 
 * @example
 * const users = [
 *   { name: 'Alice', age: 30, city: 'NYC' },
 *   { name: 'Bob', age: 25, city: 'LA' },
 *   { name: 'Charlie', age: 30, city: 'NYC' }
 * ];
 * 
 * // 先按城市升序，再按年龄降序，再按名字升序
 * const sorted = orderBy(users, [
 *   { key: 'city', order: 'asc' },
 *   { key: 'age', order: 'desc' },
 *   { key: 'name', order: 'asc' }
 * ]);
 * 
 * @example
 * // 使用自定义键提取函数
 * const sorted2 = orderBy(users, [
 *   { keySelector: user => user.city.toLowerCase(), order: 'asc' },
 *   { keySelector: user => user.age, order: 'desc' }
 * ]);
 */
export function orderBy<T>(
  arr: T[],
  orders: Array<{
    // 字段名或键提取函数，二选一
    key?: keyof T;
    keySelector?: (item: T) => any;
    order?: 'asc' | 'desc';
  }>
): T[] {
  assertArray(arr, 'arr', 'orderBy');
  assertArray(orders, 'orders', 'orderBy');
  
  if (orders.length === 0) {
    return [...arr]; // 没有排序条件，返回副本
  }
  
  // 验证每个排序条件
  orders.forEach((order, index) => {
    if (!order.key && !order.keySelector) {
      throw new Error(`Order condition at index ${index} must have either 'key' or 'keySelector'`);
    }
    
    if (order.key && order.keySelector) {
      throw new Error(`Order condition at index ${index} cannot have both 'key' and 'keySelector'`);
    }
  });
  
  // 创建组合比较函数
  const compareFn = (a: T, b: T): number => {
    for (const condition of orders) {
      let keyA: any;
      let keyB: any;
      
      if (condition.keySelector) {
        keyA = condition.keySelector(a);
        keyB = condition.keySelector(b);
      } else if (condition.key) {
        keyA = a[condition.key];
        keyB = b[condition.key];
      }
      
      const order = condition.order || 'asc';
      
      // 处理 null/undefined
      if (keyA == null && keyB == null) continue;
      if (keyA == null) return order === 'asc' ? -1 : 1;
      if (keyB == null) return order === 'asc' ? 1 : -1;
      
      // 数字比较
      if (typeof keyA === 'number' && typeof keyB === 'number') {
        const diff = keyA - keyB;
        if (diff !== 0) {
          return order === 'asc' ? diff : -diff;
        }
        continue; // 相等则继续下一个条件
      }
      
      // 日期比较
      if (keyA instanceof Date && keyB instanceof Date) {
        const diff = keyA.getTime() - keyB.getTime();
        if (diff !== 0) {
          return order === 'asc' ? diff : -diff;
        }
        continue;
      }
      
      // 字符串比较
      const strA = String(keyA);
      const strB = String(keyB);
      const diff = strA.localeCompare(strB);
      if (diff !== 0) {
        return order === 'asc' ? diff : -diff;
      }
      // 相等则继续下一个条件
    }
    
    return 0; // 所有条件都相等
  };
  
  return sortWith(arr, compareFn);
}

/**
 * 自然排序（对于包含数字的字符串）
 * @param arr 要排序的数组
 * @param keySelector 键提取函数，默认为元素本身
 * @param order 排序顺序
 * @returns 自然排序后的新数组
 * 
 * @example
 * const files = ['file1', 'file10', 'file2', 'file20'];
 * const naturalSorted = naturalSort(files); // ['file1', 'file2', 'file10', 'file20']
 */
export function naturalSort<T>(
  arr: T[],
  keySelector?: (item: T) => string,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  assertArray(arr, 'arr', 'naturalSort');
  
  // 自然排序比较函数
  const naturalCompare = (a: string, b: string): number => {
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base'
    });
    return collator.compare(a, b);
  };
  
  const compareFn = (a: T, b: T) => {
    const strA = keySelector ? keySelector(a) : String(a);
    const strB = keySelector ? keySelector(b) : String(b);
    
    const result = naturalCompare(strA, strB);
    return order === 'asc' ? result : -result;
  };
  
  return sortWith(arr, compareFn);
}