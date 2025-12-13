// tests/validation/rules/structures.test.ts
import {
    isArrayLike,
    isPlainObject,
    isMap,
    isSet,
    isPromise,
    isError,
    isTypedArray,
    isBuffer,
    isFormData,
    isURLSearchParams,
    isFile,
    isBlob,
    isIterable,
    isIterableButNotString,
    isThenable,
    isAsyncFunction,
    isGeneratorFunction,
    ValidationErrorCode,
} from '@orbitjs/utils';

describe('Structure Validation Rules', () => {
    describe('isArrayLike', () => {
        it('should validate strings as array-like', () => {
            const result = isArrayLike('hello');
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate arrays as array-like', () => {
            const result = isArrayLike([1, 2, 3]);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate array-like objects', () => {
            const result = isArrayLike({ length: 3, 0: 'a', 1: 'b', 2: 'c' });
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-array-like values', () => {
            const result = isArrayLike({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_ARRAY_LIKE);
        });
    });

    describe('isPlainObject', () => {
        it('should validate plain objects', () => {
            const result = isPlainObject({});
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate objects created with Object.create(null)', () => {
            const result = isPlainObject(Object.create(null));
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-plain objects', () => {
            const result = isPlainObject(new Date());
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_PLAIN_OBJECT);
        });
    });

    describe('isMap', () => {
        it('should validate Map instances', () => {
            const result = isMap(new Map());
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-Map values', () => {
            const result = isMap({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_MAP);
        });
    });

    describe('isSet', () => {
        it('should validate Set instances', () => {
            const result = isSet(new Set());
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-Set values', () => {
            const result = isSet([]);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_SET);
        });
    });

    describe('isPromise', () => {
        it('should validate Promise instances', () => {
            const result = isPromise(Promise.resolve());
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate thenable objects', () => {
            const result = isPromise({ then: () => {}, catch: () => {} });
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-Promise values', () => {
            const result = isPromise({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_PROMISE);
        });
    });

    describe('isError', () => {
        it('should validate Error instances', () => {
            const result = isError(new Error('test'));
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-Error values', () => {
            const result = isError('error');
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_ERROR);
        });
    });

    describe('isTypedArray', () => {
        it('should validate typed arrays', () => {
            const result = isTypedArray(new Uint8Array([1, 2, 3]));
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-typed arrays', () => {
            const result = isTypedArray([1, 2, 3]);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_TYPED_ARRAY);
        });
    });

    describe('isBuffer', () => {
        it('should validate Buffer instances (if available)', () => {
            if (typeof Buffer !== 'undefined' && 'isBuffer' in Buffer) {
                const buffer = Buffer.from('test');
                const result = isBuffer(buffer);
                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            }
        });

        it('should reject non-Buffer values', () => {
            const result = isBuffer({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_BUFFER);
        });
    });

    describe('isFormData', () => {
        it('should validate FormData instances (if available)', () => {
            if (typeof FormData !== 'undefined') {
                const formData = new FormData();
                const result = isFormData(formData);
                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            }
        });

        it('should reject non-FormData values', () => {
            const result = isFormData({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_FORM_DATA);
        });
    });

    describe('isURLSearchParams', () => {
        it('should validate URLSearchParams instances (if available)', () => {
            if (typeof URLSearchParams !== 'undefined') {
                const params = new URLSearchParams();
                const result = isURLSearchParams(params);
                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            }
        });

        it('should reject non-URLSearchParams values', () => {
            const result = isURLSearchParams({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_URL_SEARCH_PARAMS);
        });
    });

    describe('isFile', () => {
        it('should validate File instances (if available)', () => {
            if (typeof File !== 'undefined') {
                const file = new File(['content'], 'test.txt');
                const result = isFile(file);
                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            }
        });

        it('should reject non-File values', () => {
            const result = isFile({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_FILE);
        });
    });

    describe('isBlob', () => {
        it('should validate Blob instances (if available)', () => {
            if (typeof Blob !== 'undefined') {
                const blob = new Blob(['content']);
                const result = isBlob(blob);
                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            }
        });

        it('should reject non-Blob values', () => {
            const result = isBlob({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_BLOB);
        });
    });

    describe('isIterable', () => {
        it('should validate iterable objects', () => {
            const result = isIterable([1, 2, 3]);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate strings as iterable', () => {
            const result = isIterable('hello');
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-iterable values', () => {
            const result = isIterable({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_ITERABLE);
        });
    });

    describe('isIterableButNotString', () => {
        it('should validate iterables but not strings', () => {
            const result = isIterableButNotString([1, 2, 3]);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject strings even though they are iterable', () => {
            const result = isIterableButNotString('hello');
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(
                ValidationErrorCode.TYPE_NOT_ITERABLE_BUT_NOT_STRING
            );
        });
    });

    describe('isThenable', () => {
        it('should validate thenable objects', () => {
            const result = isThenable({ then: () => {} });
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-thenable values', () => {
            const result = isThenable({});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_THENABLE);
        });
    });

    describe('isAsyncFunction', () => {
        it('should validate async functions', async () => {
            const asyncFn = async () => {};
            const result = isAsyncFunction(asyncFn);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject regular functions', () => {
            const result = isAsyncFunction(() => {});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_ASYNC_FUNCTION);
        });
    });

    describe('isGeneratorFunction', () => {
        it('should validate generator functions', () => {
            const genFn = function* () {};
            const result = isGeneratorFunction(genFn);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject regular functions', () => {
            const result = isGeneratorFunction(() => {});
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(
                ValidationErrorCode.TYPE_NOT_GENERATOR_FUNCTION
            );
        });
    });

    // 在 isPlainObject 测试块中添加更多测试用例
    describe('isPlainObject', () => {
        it('should validate plain objects', () => {
            const result = isPlainObject({});
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate objects created with Object.create(null)', () => {
            const result = isPlainObject(Object.create(null));
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate object literals with properties', () => {
            const result = isPlainObject({ a: 1, b: 'test' });
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject non-plain objects', () => {
            const result = isPlainObject(new Date());
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_PLAIN_OBJECT);
        });

        it('should reject null values', () => {
            const result = isPlainObject(null);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_OBJECT);
        });

        it('should reject arrays', () => {
            const result = isPlainObject([]);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_PLAIN_OBJECT);
        });

        it('should reject custom class instances', () => {
            class TestClass {}
            const result = isPlainObject(new TestClass());
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_PLAIN_OBJECT);
        });

        it('should reject primitive values', () => {
            expect(isPlainObject('string').isValid).toBe(false);
            expect(isPlainObject(123).isValid).toBe(false);
            expect(isPlainObject(true).isValid).toBe(false);
            expect(isPlainObject(undefined).isValid).toBe(false);
        });
    });
});
