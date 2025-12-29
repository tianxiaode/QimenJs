import { sample } from '@/utils/array/random/sample';

describe('sample utility function', () => {
  it('should return a single element when count is 1 (default)', () => {
    const input = [1, 2, 3, 4, 5];
    const result = sample(input);
    
    expect(input).toContain(result as number);
    expect(typeof result).toBe('number');
  });

  it('should return an array with specified count of elements', () => {
    const input = [1, 2, 3, 4, 5];
    const count = 3;
    const result = sample(input, count) as number[];
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(count);
    // All returned elements should be from the original array
    result.forEach(item => {
      expect(input).toContain(item);
    });
  });

  it('should handle count larger than array length', () => {
    const input = [1, 2, 3];
    const count = 10;
    const result = sample(input, count) as number[];
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(input.length);
    // Result should contain all elements from input
    expect(result.sort()).toEqual(input.sort());
  });

  it('should handle empty array', () => {
    const input: number[] = [];
    const result1 = sample(input);
    expect(result1).toBeUndefined();
    
    const result2 = sample(input, 3) as number[];
    expect(Array.isArray(result2)).toBe(true);
    expect(result2).toHaveLength(0);
  });

  it('should handle array with one element and count=1', () => {
    const input = [42];
    const result = sample(input);
    
    expect(result).toBe(42);
  });

  it('should handle array with one element and count > 1', () => {
    const input = [42];
    const result = sample(input, 3) as number[];
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(42);
  });

  it('should work with string arrays', () => {
    const input = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
    const result = sample(input, 2) as string[];
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    result.forEach(item => {
      expect(input).toContain(item);
    });
  });

  it('should work with mixed type arrays', () => {
    const input: any[] = [1, 'hello', true, { id: 1 }, [1, 2, 3]];
    const result = sample(input, 3) as any[];
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
    result.forEach(item => {
      expect(input).toContainEqual(item);
    });
  });

  it('should work with object arrays', () => {
    const obj1 = { id: 1, name: 'John' };
    const obj2 = { id: 2, name: 'Jane' };
    const obj3 = { id: 3, name: 'Bob' };
    const input = [obj1, obj2, obj3];
    
    const result = sample(input, 2) as object[];
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    result.forEach(item => {
      expect(input).toContainEqual(item);
    });
  });

  it('should return different samples on different calls (probabilistic test)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = [];
    
    // Collect 5 samples
    for (let i = 0; i < 5; i++) {
      results.push(sample(input, 3) as number[]);
    }
    
    // With high probability, at least 2 of the samples should be different
    // (though there's a tiny chance they could be the same)
    const uniqueResults = new Set(results.map(arr => JSON.stringify(arr.sort())));
    expect(uniqueResults.size).toBeGreaterThanOrEqual(1); // At least 1 unique result
  });

  it('should handle count of 0', () => {
    const input = [1, 2, 3, 4, 5];
    const result = sample(input, 0) as number[];
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('should handle negative count', () => {
    const input = [1, 2, 3, 4, 5];
    const result = sample(input, -1) as number[];
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});