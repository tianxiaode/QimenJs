import { each } from '../../../../src/utils/object/iterate';

describe('iterate.ts - each', () => {
  test('should iterate over all own properties of an object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result: { key: string, value: any }[] = [];
    
    each(obj, (value, key) => {
      result.push({ key, value });
      return true;
    });
    
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ key: 'a', value: 1 });
    expect(result).toContainEqual({ key: 'b', value: 2 });
    expect(result).toContainEqual({ key: 'c', value: 3 });
  });

  test('should not iterate over inherited properties', () => {
    const Parent = function(this: any) {
      this.parentProp = 'parent';
    };
    Parent.prototype.inheritedProp = 'inherited';
    
    const child = new (Parent as any)();
    (child as any).childProp = 'child';
    
    const result: string[] = [];
    
    each(child as any, (value, key) => {
      result.push(key);
      return true;
    });
    
    expect(result).toEqual(['parentProp', 'childProp']);
    expect(result).not.toContain('inheritedProp');
  });

  test('should stop iteration when callback returns false', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result: { key: string, value: any }[] = [];
    
    each(obj, (value, key) => {
      if (key === 'c') {
        return false; // Stop iteration
      }
      result.push({ key, value });
      return true;
    });
    
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ key: 'a', value: 1 });
    expect(result).toContainEqual({ key: 'b', value: 2 });
    expect(result).not.toContainEqual({ key: 'c', value: 3 });
    expect(result).not.toContainEqual({ key: 'd', value: 4 });
  });

  test('should allow setting the scope of the callback', () => {
    const obj = { a: 1, b: 2 };
    const scope = { context: 'test' };
    let contextValue: any;
    
    each(obj, function(this: any, value, key) {
      contextValue = this.context;
      return false; // Just check the first iteration
    }, scope);
    
    expect(contextValue).toBe('test');
  });

  test('should handle empty objects', () => {
    const obj = {};
    const result: any[] = [];
    
    each(obj, (value, key) => {
      result.push({ key, value });
      return true;
    });
    
    expect(result).toHaveLength(0);
  });

  test('should handle objects with falsy values', () => {
    const obj = { 
      a: 0, 
      b: '', 
      c: false, 
      d: null, 
      e: undefined 
    };
    
    const result: { key: string, value: any }[] = [];
    
    each(obj, (value, key) => {
      result.push({ key, value });
      return true;
    });
    
    expect(result).toHaveLength(5);
    expect(result).toContainEqual({ key: 'a', value: 0 });
    expect(result).toContainEqual({ key: 'b', value: '' });
    expect(result).toContainEqual({ key: 'c', value: false });
    expect(result).toContainEqual({ key: 'd', value: null });
    expect(result).toContainEqual({ key: 'e', value: undefined });
  });
});