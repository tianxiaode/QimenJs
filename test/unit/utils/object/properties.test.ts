import { 
  copyIfDefined, 
  replaceMembers, 
  getNestedValue, 
  setNestedValue, 
  destroyMembers 
} from '../../../../src/utils/object/properties';

describe('properties.ts - utility functions', () => {
  describe('copyIfDefined', () => {
    test('should copy defined values from source to target', () => {
      const source = { a: 1, b: undefined, c: 'value', d: null };
      const target = { e: 'existing' };
      
      const result = copyIfDefined(source, target);
      
      expect(result).toEqual({ a: 1, c: 'value', d: null, e: 'existing' });
      expect(result).toBe(target); // Should modify target
    });

    test('should recursively copy nested objects', () => {
      const source = { 
        a: { b: 1, c: undefined }, 
        d: { e: { f: 'nested' } } 
      };
      const target = { g: 'existing' };
      
      const result = copyIfDefined(source, target);
      
      expect(result).toEqual({ 
        a: { b: 1 }, 
        d: { e: { f: 'nested' } }, 
        g: 'existing' 
      });
      expect(result).toBe(target);
      expect((result as any).a).not.toBe((source as any).a);
      expect((result as any).d).not.toBe((source as any).d);
      expect((result as any).d.e).not.toBe((source as any).d.e);
    });

    test('should handle cases where target does not have nested objects', () => {
      const source = { a: { b: 1 } };
      const target = {};
      
      const result = copyIfDefined(source, target);
      
      expect(result).toEqual({ a: { b: 1 } });
      expect(result).toBe(target);
    });

    test('should handle cases where source has undefined values', () => {
      const source = { a: undefined, b: 1 };
      const target = { c: 'existing' };
      
      const result = copyIfDefined(source, target);
      
      expect(result).toEqual({ b: 1, c: 'existing' });
      expect(result).toBe(target);
    });
  });

  describe('replaceMembers', () => {
    test('should replace members in target with source members', () => {
      const source = { a: 1, b: 2 };
      const target = { c: 3, d: 4 };
      
      replaceMembers(source, target);
      
      expect(target).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    test('should recursively merge nested objects', () => {
      const source = { a: { b: 1, c: 2 } };
      const target = { a: { b: 3, d: 4 }, e: 5 };
      
      replaceMembers(source, target);
      
      expect(target).toEqual({ a: { b: 1, c: 2, d: 4 }, e: 5 });
    });

    test('should replace nested objects when types differ', () => {
      const source = { a: { b: 1 } };
      const target = { a: 'string' };
      
      replaceMembers(source, target);
      
      expect(target).toEqual({ a: { b: 1 } });
    });

    test('should handle maxDepth parameter', () => {
      const source = { a: { b: { c: { d: 'deep' } } } };
      const target = { a: { b: { c: { e: 'existing' } } } };
      
      // Using a depth of 10, which is sufficient for this test
      // The behavior is to merge at each level, so the 'e' property will remain
      replaceMembers(source, target, 10);
      
      expect(target).toEqual({ a: { b: { c: { d: 'deep', e: 'existing' } } } });
    });
  });

  describe('getNestedValue', () => {
    test('should get value at simple path', () => {
      const obj = { a: 1, b: { c: 2 } };
      
      expect(getNestedValue(obj, 'a')).toBe(1);
      expect(getNestedValue(obj, 'b.c')).toBe(2);
    });

    test('should return undefined for non-existent paths', () => {
      const obj = { a: { b: { c: 2 } } };
      
      expect(getNestedValue(obj, 'x')).toBeUndefined();
      expect(getNestedValue(obj, 'a.x')).toBeUndefined();
      expect(getNestedValue(obj, 'a.b.c.d')).toBeUndefined();
    });

    test('should handle complex nested paths', () => {
      const obj = { 
        a: { 
          b: { 
            c: { 
              d: 'value' 
            } 
          } 
        } 
      };
      
      expect(getNestedValue(obj, 'a.b.c.d')).toBe('value');
    });

    test('should handle paths with empty string values', () => {
      const obj = { a: { b: '' } };
      
      expect(getNestedValue(obj, 'a.b')).toBe('');
    });
  });

  describe('setNestedValue', () => {
    test('should set value at simple path', () => {
      const obj: any = { a: 1 };
      
      setNestedValue(obj, 'b', 2);
      
      expect(obj.b).toBe(2);
    });

    test('should set value at nested path, creating intermediate objects', () => {
      const obj: any = {};
      
      setNestedValue(obj, 'a.b.c', 'value');
      
      expect(obj.a.b.c).toBe('value');
    });

    test('should update existing nested path', () => {
      const obj: any = { a: { b: { c: 'old' } } };
      
      setNestedValue(obj, 'a.b.c', 'new');
      
      expect(obj.a.b.c).toBe('new');
    });

    test('should handle complex nested paths', () => {
      const obj: any = { a: { x: 1 } };
      
      setNestedValue(obj, 'a.b.c.d', 'deep');
      
      expect(obj.a.b.c.d).toBe('deep');
      expect(obj.a.x).toBe(1); // Original value should still exist
    });

    test('should overwrite non-object intermediate values', () => {
      const obj: any = { a: 'string' };
      
      setNestedValue(obj, 'a.b.c', 'value');
      
      expect(obj.a.b.c).toBe('value');
    });
  });

  describe('destroyMembers', () => {
    test('should call destroy method on members that have it', () => {
      const destroySpy = jest.fn();
      const obj = {
        a: { destroy: destroySpy, value: 'test' },
        b: { value: 'other' }
      };
      
      destroyMembers(obj, ['a', 'b']);
      
      expect(destroySpy).toHaveBeenCalled();
      expect((obj as any).a).toBeUndefined();
      expect((obj as any).b).toBeUndefined();
    });

    test('should recursively destroy nested objects', () => {
      const destroySpyA = jest.fn();
      const destroySpyB = jest.fn();
      const obj = {
        a: { 
          destroy: destroySpyA,
          nested: {
            b: { destroy: destroySpyB }
          }
        }
      };
      
      destroyMembers(obj, ['a']);
      
      expect(destroySpyA).toHaveBeenCalled();
      expect(destroySpyB).toHaveBeenCalled();
      expect((obj as any).a).toBeUndefined();
    });

    test('should only destroy specified members', () => {
      const destroySpy = jest.fn();
      const obj = {
        a: { destroy: destroySpy },
        b: { value: 'keep' }
      };
      
      destroyMembers(obj, ['a']);
      
      expect(destroySpy).toHaveBeenCalled();
      expect((obj as any).a).toBeUndefined();
      expect((obj as any).b).toEqual({ value: 'keep' });
    });
  });
});