import { isObject } from '../../../../src/utils/object/base';

describe('base.ts - isObject', () => {
  test('should return true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject({ a: { b: 2 } })).toBe(true);
  });

  test('should return false for non-objects', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(false)).toBe(false);
    expect(isObject([])).toBe(false); // Array is not a plain object
    expect(isObject([1, 2, 3])).toBe(false);
    expect(isObject(function() {})).toBe(false); // Function is not a plain object
    expect(isObject(() => {})).toBe(false); // Arrow function is not a plain object
  });

  test('should return true for object types', () => {
    // According to the current implementation, Date, RegExp, Map, Set, etc. are objects
    expect(isObject(new Date())).toBe(true); // Date is an object
    expect(isObject(/regex/)).toBe(true); // RegExp is an object
    expect(isObject(new Map())).toBe(true);
    expect(isObject(new Set())).toBe(true);
    expect(isObject(new WeakMap())).toBe(true);
    expect(isObject(new WeakSet())).toBe(true);
  });
});