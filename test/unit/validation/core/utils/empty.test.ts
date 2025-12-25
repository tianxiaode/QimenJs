import { isEmptyValue } from '@/validation';

describe('isEmptyValue', () => {
  describe('should return true for empty values', () => {
    it('should return true for empty string', () => {
      expect(isEmptyValue('')).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isEmptyValue([])).toBe(true);
    });

    it('should return true for empty Map', () => {
      expect(isEmptyValue(new Map())).toBe(true);
    });

    it('should return true for empty Set', () => {
      expect(isEmptyValue(new Set())).toBe(true);
    });

    it('should return true for empty object', () => {
      expect(isEmptyValue({})).toBe(true);
    });

    it('should return true for object with no own properties', () => {
      expect(isEmptyValue(Object.create(null))).toBe(true);
    });
  });

  describe('should return false for non-empty values', () => {
    it('should return false for non-empty string', () => {
      expect(isEmptyValue('hello')).toBe(false);
    });

    it('should return false for non-empty array', () => {
      expect(isEmptyValue([1, 2, 3])).toBe(false);
    });

    it('should return false for non-empty Map', () => {
      const map = new Map();
      map.set('key', 'value');
      expect(isEmptyValue(map)).toBe(false);
    });

    it('should return false for non-empty Set', () => {
      const set = new Set();
      set.add('value');
      expect(isEmptyValue(set)).toBe(false);
    });

    it('should return false for non-empty object', () => {
      expect(isEmptyValue({ key: 'value' })).toBe(false);
    });
  });

  describe('should return false for other data types', () => {
    it('should return false for null', () => {
      expect(isEmptyValue(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isEmptyValue(undefined)).toBe(false);
    });

    it('should return false for number zero', () => {
      expect(isEmptyValue(0)).toBe(false);
    });

    it('should return false for negative zero', () => {
      expect(isEmptyValue(-0)).toBe(false);
    });

    it('should return false for positive infinity', () => {
      expect(isEmptyValue(Infinity)).toBe(false);
    });

    it('should return false for negative infinity', () => {
      expect(isEmptyValue(-Infinity)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isEmptyValue(NaN)).toBe(false);
    });

    it('should return false for boolean false', () => {
      expect(isEmptyValue(false)).toBe(false);
    });

    it('should return false for boolean true', () => {
      expect(isEmptyValue(true)).toBe(false);
    });

    it('should return false for symbol', () => {
      expect(isEmptyValue(Symbol())).toBe(false);
      expect(isEmptyValue(Symbol('test'))).toBe(false);
    });

    it('should return false for date', () => {
      expect(isEmptyValue(new Date())).toBe(false);
    });

    it('should return false for function', () => {
      expect(isEmptyValue(function() {})).toBe(false);
      expect(isEmptyValue(() => {})).toBe(false);
    });

    it('should return false for class', () => {
      expect(isEmptyValue(class A {})).toBe(false);
    });

    it('should return false for promise', () => {
      expect(isEmptyValue(Promise.resolve())).toBe(false);
    });

    it('should return false for error', () => {
      expect(isEmptyValue(new Error())).toBe(false);
    });

    it('should return false for typed arrays', () => {
      expect(isEmptyValue(new Int8Array())).toBe(false);
      expect(isEmptyValue(new Uint8Array())).toBe(false);
      expect(isEmptyValue(new Uint8ClampedArray())).toBe(false);
      expect(isEmptyValue(new Int16Array())).toBe(false);
      expect(isEmptyValue(new Uint16Array())).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for non-empty typed arrays', () => {
      expect(isEmptyValue(new Int8Array([1, 2, 3]))).toBe(false);
    });

    it('should return false for object with non-enumerable properties', () => {
      const obj = {};
      Object.defineProperty(obj, 'nonEnum', {
        value: 'value',
        enumerable: false
      });
      expect(isEmptyValue(obj)).toBe(true); // Only counts enumerable properties
    });

    it('should return false for object with only inherited properties', () => {
      const parent = { inherited: 'value' };
      const child = Object.create(parent);
      expect(isEmptyValue(child)).toBe(true); // Only counts own properties
    });
  });
});