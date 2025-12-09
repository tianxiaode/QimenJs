import { assertArray, assertNumber } from '../../validation';

/**
 * 随机抽取数组中的元素
 */
export function sample<T>(arr: T[], count: number = 1): T | T[] {
  assertArray(arr, { functionName:'sample'});
  assertNumber(count, { 
    paramName: 'count', 
    functionName: 'sample', 
    min: 1, 
    integer: true 
  });  
  
  if (count === 1) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  // Fisher-Yates 洗牌算法取前 count 个
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, Math.min(count, arr.length));
}
