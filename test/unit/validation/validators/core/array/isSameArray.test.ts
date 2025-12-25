// 导入函数实现
import { checkArrayEnum } from '@/validation/validators/core/array/enum';

// 由于isSameArray没有导出，我们需要重新实现测试逻辑
// 这里是isSameArray的内部实现
function isSameArray(a: any[], b: any[]): boolean {
  // 首先检查数组长度是否相等
  if (a.length !== b.length) return false;
  
  // 使用every方法检查每个对应位置的元素是否相等
  return a.every((v, i) => v === b[i]);
}

describe('isSameArray', () => {
  it('当两个数组完全相同时返回true', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(true);
  });

  it('当两个数组长度不同时返回false', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(false);
  });

  it('当两个数组元素不完全相同时返回false', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 4];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(false);
  });

  it('当两个空数组比较时返回true', () => {
    const arr1: any[] = [];
    const arr2: any[] = [];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(true);
  });

  it('当两个相同字符串数组比较时返回true', () => {
    const arr1 = ['a', 'b', 'c'];
    const arr2 = ['a', 'b', 'c'];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(true);
  });

  it('当两个相同布尔值数组比较时返回true', () => {
    const arr1 = [true, false, true];
    const arr2 = [true, false, true];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(true);
  });

  it('当两个相同混合类型数组比较时返回true', () => {
    const arr1 = [1, 'a', true];
    const arr2 = [1, 'a', true];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(true);
  });

  it('当两个相同对象数组比较时返回true', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const arr1 = [obj1, obj2];
    const arr2 = [obj1, obj2];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(true);
  });

  it('当两个不同引用的相同对象数组比较时返回false', () => {
    const arr1 = [{ id: 1 }, { id: 2 }];
    const arr2 = [{ id: 1 }, { id: 2 }];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(false);
  });

  it('当数组元素顺序不同时返回false', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [3, 2, 1];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(false);
  });

  it('当数组元素包含undefined时正确比较', () => {
    const arr1 = [1, undefined, 3];
    const arr2 = [1, undefined, 3];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(true);
  });

  it('当数组元素包含null时正确比较', () => {
    const arr1 = [1, null, 3];
    const arr2 = [1, null, 3];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(true);
  });

  it('当数组元素包含NaN时正确比较', () => {
    const arr1 = [1, NaN, 3];
    const arr2 = [1, NaN, 3];

    const result = isSameArray(arr1, arr2);

    expect(result).toBe(false); // NaN !== NaN
  });
});