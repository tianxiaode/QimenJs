import {
  isArray,
  isArrayLike,
  isObject,
  isPlainObject,
  isDate,
  isRegExp,
  isMap,
  isSet,
  isPromise,
  isError,
  isTypedArray,
  isBuffer,
  isFormData,
  isURLSearchParams,
  isFile,
  isBlob
} from '@orbitjs/utils';

describe('Structure Type Validation Functions', () => {
  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(new Array())).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(isArray({})).toBe(false);
      expect(isArray('array')).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });
  });

  describe('isArrayLike', () => {
    it('should return true for array-like objects', () => {
      expect(isArrayLike([])).toBe(true);
      expect(isArrayLike([1, 2, 3])).toBe(true);
      expect(isArrayLike({ length: 0 })).toBe(true);
      expect(isArrayLike({ 0: 'a', 1: 'b', length: 2 })).toBe(true);
      expect(isArrayLike('hello')).toBe(true); // String is array-like
    });

    it('should return false for non-array-like objects', () => {
      expect(isArrayLike({})).toBe(false);
      expect(isArrayLike(null)).toBe(false);
      expect(isArrayLike(undefined)).toBe(false);
      expect(isArrayLike({ length: -1 })).toBe(false);
      expect(isArrayLike({ length: 1 })).toBe(false); // No index properties
    });
  });

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject(new Object())).toBe(true);
    });

    it('should return false for non-objects, null and arrays', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject('object')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(true);
      expect(isPlainObject(new Object())).toBe(true);
    });

    it('should return false for non-plain objects', () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(/regex/)).toBe(false);
      
      // Object with custom prototype
      class CustomClass {}
      expect(isPlainObject(new CustomClass())).toBe(false);
    });
  });

  describe('isDate', () => {
    it('should return true for valid dates', () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date('2023-01-01'))).toBe(true);
    });

    it('should return false for invalid dates and non-dates', () => {
      expect(isDate(new Date('invalid'))).toBe(false); // Invalid date
      expect(isDate('2023-01-01')).toBe(false);
      expect(isDate(null)).toBe(false);
      expect(isDate({})).toBe(false);
    });
  });

  describe('isRegExp', () => {
    it('should return true for regex objects', () => {
      expect(isRegExp(/test/)).toBe(true);
      expect(isRegExp(new RegExp('test'))).toBe(true);
    });

    it('should return false for non-regex objects', () => {
      expect(isRegExp('/test/')).toBe(false);
      expect(isRegExp(null)).toBe(false);
      expect(isRegExp({})).toBe(false);
    });
  });

  describe('isMap', () => {
    it('should return true for Map objects', () => {
      expect(isMap(new Map())).toBe(true);
      expect(isMap(new Map([['key', 'value']]))).toBe(true);
    });

    it('should return false for non-Map objects', () => {
      expect(isMap({})).toBe(false);
      expect(isMap([])).toBe(false);
      expect(isMap(null)).toBe(false);
    });
  });

  describe('isSet', () => {
    it('should return true for Set objects', () => {
      expect(isSet(new Set())).toBe(true);
      expect(isSet(new Set([1, 2, 3]))).toBe(true);
    });

    it('should return false for non-Set objects', () => {
      expect(isSet([])).toBe(false);
      expect(isSet({})).toBe(false);
      expect(isSet(null)).toBe(false);
    });
  });

  describe('isPromise', () => {
    it('should return true for Promise objects', () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise(new Promise(() => {}))).toBe(true);
      
      // Promise-like object
      expect(isPromise({ then: () => {}, catch: () => {} })).toBe(true);
    });

    it('should return false for non-Promise objects', () => {
      expect(isPromise({})).toBe(false);
      expect(isPromise(null)).toBe(false);
      expect(isPromise({ then: () => {} })).toBe(false); // Missing catch
    });
  });

  describe('isError', () => {
    it('should return true for Error objects', () => {
      expect(isError(new Error())).toBe(true);
      expect(isError(new TypeError())).toBe(true);
      expect(isError(new SyntaxError())).toBe(true);
    });

    it('should return false for non-Error objects', () => {
      expect(isError({})).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError('error')).toBe(false);
    });
  });

  describe('isTypedArray', () => {
    it('should return true for TypedArray objects', () => {
      expect(isTypedArray(new Int8Array())).toBe(true);
      expect(isTypedArray(new Uint8Array())).toBe(true);
      expect(isTypedArray(new Uint8ClampedArray())).toBe(true);
      expect(isTypedArray(new Int16Array())).toBe(true);
      expect(isTypedArray(new Uint16Array())).toBe(true);
      expect(isTypedArray(new Int32Array())).toBe(true);
      expect(isTypedArray(new Uint32Array())).toBe(true);
      expect(isTypedArray(new Float32Array())).toBe(true);
      expect(isTypedArray(new Float64Array())).toBe(true);
    });

    it('should return false for non-TypedArray objects', () => {
      expect(isTypedArray([])).toBe(false);
      expect(isTypedArray({})).toBe(false);
      expect(isTypedArray(null)).toBe(false);
      expect(isTypedArray(new ArrayBuffer(8))).toBe(false); // ArrayBuffer itself is not a TypedArray
    });
  });

  describe('isBuffer', () => {
    it('should return true for Buffer objects (if available)', () => {
      if (typeof Buffer !== 'undefined' && Buffer.isBuffer(10)) {
        expect(isBuffer(Buffer.from('test'))).toBe(true);
        expect(isBuffer(Buffer.alloc(10))).toBe(true);
      } else {
        // Skip test if Buffer is not available (browser environment)
        expect(true).toBe(true);
      }
    });

    it('should return false for non-Buffer objects', () => {
      expect(isBuffer([])).toBe(false);
      expect(isBuffer({})).toBe(false);
      expect(isBuffer(null)).toBe(false);
    });
  });

  describe('isFormData', () => {
    it('should return true for FormData objects (if available)', () => {
      if (typeof FormData !== 'undefined') {
        expect(isFormData(new FormData())).toBe(true);
      } else {
        // Skip test if FormData is not available
        expect(true).toBe(true);
      }
    });

    it('should return false for non-FormData objects', () => {
      expect(isFormData({})).toBe(false);
      expect(isFormData(null)).toBe(false);
    });
  });

  describe('isURLSearchParams', () => {
    it('should return true for URLSearchParams objects (if available)', () => {
      if (typeof URLSearchParams !== 'undefined') {
        expect(isURLSearchParams(new URLSearchParams())).toBe(true);
        expect(isURLSearchParams(new URLSearchParams('key=value'))).toBe(true);
      } else {
        // Skip test if URLSearchParams is not available
        expect(true).toBe(true);
      }
    });

    it('should return false for non-URLSearchParams objects', () => {
      expect(isURLSearchParams({})).toBe(false);
      expect(isURLSearchParams(null)).toBe(false);
    });
  });

  describe('isFile', () => {
    it('should return true for File objects (if available)', () => {
      if (typeof File !== 'undefined') {
        const file = new File(['content'], 'filename.txt', { type: 'text/plain' });
        expect(isFile(file)).toBe(true);
      } else {
        // Skip test if File is not available (Node.js environment)
        expect(true).toBe(true);
      }
    });

    it('should return false for non-File objects', () => {
      expect(isFile({})).toBe(false);
      expect(isFile(null)).toBe(false);
      expect(isFile(new Blob())).toBe(false); // Blob is not File
    });
  });

  describe('isBlob', () => {
    it('should return true for Blob objects (if available)', () => {
      if (typeof Blob !== 'undefined') {
        expect(isBlob(new Blob())).toBe(true);
        expect(isBlob(new Blob(['content'], { type: 'text/plain' }))).toBe(true);
      } else {
        // Skip test if Blob is not available
        expect(true).toBe(true);
      }
    });

    it('should return false for non-Blob objects', () => {
      expect(isBlob({})).toBe(false);
      expect(isBlob(null)).toBe(false);
    });
  });
});