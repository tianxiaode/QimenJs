import { includes } from '../../../../../src/utils/array/search/includes';

describe('includes utility function', () => {
  it('should return true when array includes the value', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(includes(arr, 3)).toBe(true);
  });

  it('should return false when array does not include the value', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(includes(arr, 6)).toBe(false);
  });

  it('should handle empty array', () => {
    const arr: number[] = [];
    expect(includes(arr, 1)).toBe(false);
  });

  it('should work with string arrays', () => {
    const arr = ['apple', 'banana', 'cherry'];
    expect(includes(arr, 'banana')).toBe(true);
    expect(includes(arr, 'orange')).toBe(false);
  });

  it('should work with object arrays when no field is specified', () => {
    const obj1 = { id: 1, name: 'Alice' };
    const obj2 = { id: 2, name: 'Bob' };
    const arr = [obj1, obj2];
    
    // When no field is specified, it checks for reference equality
    expect(includes(arr, obj1)).toBe(true);
    expect(includes(arr, { id: 1, name: 'Alice' })).toBe(false); // Different reference
  });

  it('should work with field-based matching for objects', () => {
    interface Person {
      id: number;
      name: string;
    }

    const people: Person[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ];

    // When field is specified, it matches by the field value
    expect(includes(people, { id: 2, name: 'Bob' }, 'id')).toBe(true);
    expect(includes(people, { id: 4, name: 'David' }, 'id')).toBe(false);
  });

  it('should work with field-based matching for string fields', () => {
    interface Product {
      id: number;
      name: string;
      category: string;
    }

    const products: Product[] = [
      { id: 1, name: 'Laptop', category: 'Electronics' },
      { id: 2, name: 'Book', category: 'Education' },
      { id: 3, name: 'Phone', category: 'Electronics' },
    ];

    expect(includes(products, { id: 999, name: 'Laptop', category: 'Something' }, 'name')).toBe(true);
    expect(includes(products, { id: 999, name: 'Tablet', category: 'Something' }, 'name')).toBe(false);
  });

  it('should work with field-based matching for numeric fields', () => {
    interface Score {
      id: number;
      name: string;
      value: number;
    }

    const scores: Score[] = [
      { id: 1, name: 'Alice', value: 85 },
      { id: 2, name: 'Bob', value: 92 },
      { id: 3, name: 'Charlie', value: 78 },
    ];

    expect(includes(scores, { id: 999, name: 'Any', value: 92 }, 'value')).toBe(true);
    expect(includes(scores, { id: 999, name: 'Any', value: 95 }, 'value')).toBe(false);
  });

  it('should handle primitive values with field parameter (field ignored)', () => {
    const arr = [1, 2, 3, 4, 5];
    // When value is a primitive, field parameter should be ignored
    expect(includes(arr, 3, 'nonexistent' as any)).toBe(true);
    expect(includes(arr, 6, 'nonexistent' as any)).toBe(false);
  });

  it('should handle null and undefined values', () => {
    const arr = [null, undefined, 0, false, ''];
    expect(includes(arr, null)).toBe(true);
    expect(includes(arr, undefined)).toBe(true);
    expect(includes(arr, 0)).toBe(true);
    expect(includes(arr, false)).toBe(true);
    expect(includes(arr, '')).toBe(true);
  });

  it('should handle NaN values', () => {
    const arr = [1, 2, NaN, 4, 5];
    expect(includes(arr, NaN)).toBe(true);
  });

  it('should work with boolean arrays', () => {
    const arr = [true, false, true];
    expect(includes(arr, true)).toBe(true);
    expect(includes(arr, false)).toBe(true);
    // Testing with a different type would require any type assertion
    expect(includes(arr, 'true' as any)).toBe(false); // Type mismatch
  });
});