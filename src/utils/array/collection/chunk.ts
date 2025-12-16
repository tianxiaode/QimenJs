import { isArray, assertValidation, buildNumberValidator  } from '../../validation';

/**
 * 将数组分块
 */
export function chunk<T>(arr: T[], size: number): T[][] {
    assertValidation(isArray(arr), { functionName: 'chunk'})
  assertValidation(buildNumberValidator({ required: true, min: 1, integer: true})(size), { 
    require: true, 
    functionName: 'chunk', 
    min: 1, 
    integer: true 
  });  
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  
  return chunks;
}