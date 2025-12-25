import { naturalSort } from '../../../../../src/utils/array/sort/naturalSort';

describe('naturalSort utility function', () => {
  it('should sort string array in natural order', () => {
    const strings = ['item10', 'item2', 'item1'];
    const result = naturalSort(strings);
    expect(result).toEqual(['item1', 'item2', 'item10']);
  });

  it('should sort string array in natural descending order', () => {
    const strings = ['item10', 'item2', 'item1'];
    const result = naturalSort(strings, undefined, 'desc');
    expect(result).toEqual(['item10', 'item2', 'item1']);
  });

  it('should sort array using key selector function', () => {
    interface Product {
      name: string;
      id: string;
    }

    const products: Product[] = [
      { name: 'Product C', id: 'item10' },
      { name: 'Product A', id: 'item2' },
      { name: 'Product B', id: 'item1' },
    ];

    const result = naturalSort(products, (item) => item.id);
    expect(result).toEqual([
      { name: 'Product B', id: 'item1' },
      { name: 'Product A', id: 'item2' },
      { name: 'Product C', id: 'item10' },
    ]);
  });

  it('should sort array using key selector function in descending order', () => {
    interface Product {
      name: string;
      id: string;
    }

    const products: Product[] = [
      { name: 'Product C', id: 'item10' },
      { name: 'Product A', id: 'item2' },
      { name: 'Product B', id: 'item1' },
    ];

    const result = naturalSort(products, (item) => item.id, 'desc');
    expect(result).toEqual([
      { name: 'Product C', id: 'item10' },
      { name: 'Product A', id: 'item2' },
      { name: 'Product B', id: 'item1' },
    ]);
  });

  it('should handle empty array', () => {
    const result = naturalSort([]);
    expect(result).toEqual([]);
  });

  it('should handle array with one element', () => {
    const strings = ['item10'];
    const result = naturalSort(strings);
    expect(result).toEqual(['item10']);
  });

  it('should handle numeric strings correctly', () => {
    const numbers = ['10', '2', '1', '20', '3'];
    const result = naturalSort(numbers);
    expect(result).toEqual(['1', '2', '3', '10', '20']);
  });

  it('should handle mixed alphanumeric strings', () => {
    const mixed = ['v1.10', 'v1.2', 'v1.1'];
    const result = naturalSort(mixed);
    expect(result).toEqual(['v1.1', 'v1.2', 'v1.10']);
  });

  it('should not modify original array', () => {
    const original = ['item10', 'item2', 'item1'];
    const originalCopy = [...original];
    const result = naturalSort(original);

    expect(original).toEqual(originalCopy);
    expect(result).not.toBe(original);
  });
});