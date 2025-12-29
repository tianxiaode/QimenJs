import { mergeArray } from '@/utils/array/set/union';

interface TestUser {
  id: number;
  name?: string;
  age?: number;
  email?: string;
}

interface TestKeyValue {
  key: string;
  value: number;
}

describe('mergeArray', () => {
  it('should merge arrays based on the specified field', () => {
    const array1: TestUser[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const array2: TestUser[] = [
      { id: 1, name: 'Alice Updated' },
      { id: 3, name: 'Charlie' },
    ];

    const result = mergeArray([array1, array2], 'id');

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ id: 1, name: 'Alice Updated' });
    expect(result).toContainEqual({ id: 2, name: 'Bob' });
    expect(result).toContainEqual({ id: 3, name: 'Charlie' });
  });

  it('should handle arrays with different object structures', () => {
    const array1: TestUser[] = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
    ];
    const array2: TestUser[] = [
      { id: 1, email: 'alice@example.com', name: 'Alice' }, // Added name to satisfy interface
      { id: 3, name: 'Charlie', age: 35 },
    ];

    const result = mergeArray([array1, array2], 'id');

    expect(result).toHaveLength(3);
    // The second object with same id will override the first
    const itemWithId1 = result.find((item: TestUser) => item.id === 1);
    expect(itemWithId1).toEqual({ id: 1, email: 'alice@example.com', name: 'Alice' });
    expect(result).toContainEqual({ id: 2, name: 'Bob', age: 30 });
    expect(result).toContainEqual({ id: 3, name: 'Charlie', age: 35 });
  });

interface TestStringKey {
  name: string;
  age?: number;
}

  it('should work with string fields', () => {
    const array1: TestStringKey[] = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
    ];
    const array2: TestStringKey[] = [
      { name: 'Alice', age: 27 },
      { name: 'Charlie', age: 35 },
    ];

    const result = mergeArray([array1, array2], 'name');

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ name: 'Alice', age: 27 }); // Age should be updated
    expect(result).toContainEqual({ name: 'Bob', age: 30 });
    expect(result).toContainEqual({ name: 'Charlie', age: 35 });
  });

  it('should handle empty arrays', () => {
    const result = mergeArray<TestUser, 'id'>([], 'id');
    expect(result).toHaveLength(0);
  });

  it('should handle arrays with empty sub-arrays', () => {
    const array1: TestUser[] = [];
    const array2: TestUser[] = [
      { id: 1, name: 'Alice' },
    ];

    const result = mergeArray([array1, array2], 'id');
    expect(result).toEqual([{ id: 1, name: 'Alice' }]);
  });

  it('should handle arrays with no matching fields', () => {
    const array1: TestUser[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const array2: TestUser[] = [
      { id: 3, name: 'Charlie' },
      { id: 4, name: 'David' },
    ];

    const result = mergeArray([array1, array2], 'id');
    expect(result).toHaveLength(4);
    expect(result).toContainEqual({ id: 1, name: 'Alice' });
    expect(result).toContainEqual({ id: 2, name: 'Bob' });
    expect(result).toContainEqual({ id: 3, name: 'Charlie' });
    expect(result).toContainEqual({ id: 4, name: 'David' });
  });

  it('should handle primitive values in objects', () => {
    const array1: TestKeyValue[] = [
      { key: 'a', value: 10 },
      { key: 'b', value: 20 },
    ];
    const array2: TestKeyValue[] = [
      { key: 'a', value: 15 },
      { key: 'c', value: 30 },
    ];

    const result = mergeArray([array1, array2], 'key');
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ key: 'a', value: 15 }); // Value should be updated
    expect(result).toContainEqual({ key: 'b', value: 20 });
    expect(result).toContainEqual({ key: 'c', value: 30 });
  });

  it('should not include items that do not have the specified field', () => {
    const array1: TestUser[] = [
      { id: 1, name: 'Alice' },
    ];
    const arrayWithoutId: any[] = [
      { name: 'Bob' }, // Missing id field
    ];
    const array2: TestUser[] = [
      { id: 1, name: 'Alice Updated' },
      { id: 2, name: 'Charlie' },
    ];

    const result = mergeArray([array1, arrayWithoutId, array2], 'id');
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ id: 1, name: 'Alice Updated' });
    expect(result).toContainEqual({ id: 2, name: 'Charlie' });
    // Bob should not be included since he doesn't have an id field
    expect(result).not.toContainEqual({ name: 'Bob' });
  });
});