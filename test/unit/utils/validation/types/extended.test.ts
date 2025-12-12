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
    isBlob,
    isNil,
    isEmpty,
    isIterable,
    isIterableButNotString,
    isAsyncFunction,
    isGeneratorFunction,
    isJSONSerializable,
    isArrayIndex,
    isPropertyKey,
    isNumericString,
    isIntegerString,
    isSameType,
    isNull,
    isUndefined,
    isThenable
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
            if (typeof Buffer !== 'undefined') {
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

        // 在 extended.test.ts 文件末尾添加

        describe('Extended Type Validation Functions', () => {
            describe('isNil', () => {
                it('should return true for null and undefined', () => {
                    expect(isNil(null)).toBe(true);
                    expect(isNil(undefined)).toBe(true);
                });

                it('should return false for other values', () => {
                    expect(isNil(0)).toBe(false);
                    expect(isNil('')).toBe(false);
                    expect(isNil(false)).toBe(false);
                });
            });

            describe('isEmpty', () => {
                it('should return true for empty values', () => {
                    expect(isEmpty(null)).toBe(true);
                    expect(isEmpty(undefined)).toBe(true);
                    expect(isEmpty('')).toBe(true);
                    expect(isEmpty([])).toBe(true);
                    expect(isEmpty({})).toBe(true);
                    expect(isEmpty(new Map())).toBe(true);
                    expect(isEmpty(new Set())).toBe(true);
                });

                it('should return false for non-empty values', () => {
                    expect(isEmpty('hello')).toBe(false);
                    expect(isEmpty([1])).toBe(false);
                    expect(isEmpty({ a: 1 })).toBe(false);
                    expect(isEmpty(new Map([['key', 'value']]))).toBe(false);
                    expect(isEmpty(new Set([1]))).toBe(false);
                });

                it('should return false for unsupported types', () => {
                    expect(isEmpty(123)).toBe(false);
                    expect(isEmpty(true)).toBe(false);
                });
            });

            describe('isIterable', () => {
                it('should return true for iterable objects', () => {
                    expect(isIterable([])).toBe(true);
                    expect(isIterable('string')).toBe(true);
                    expect(isIterable(new Map())).toBe(true);
                    expect(isIterable(new Set())).toBe(true);
                });

                it('should return false for non-iterable objects', () => {
                    expect(isIterable(null)).toBe(false);
                    expect(isIterable(undefined)).toBe(false);
                    expect(isIterable({})).toBe(false);
                    expect(isIterable(123)).toBe(false);
                });
            });

            describe('isIterableButNotString', () => {
                it('should return true for iterable but not string objects', () => {
                    expect(isIterableButNotString([])).toBe(true);
                    expect(isIterableButNotString(new Map())).toBe(true);
                    expect(isIterableButNotString(new Set())).toBe(true);
                });

                it('should return false for strings and non-iterable objects', () => {
                    expect(isIterableButNotString('string')).toBe(false);
                    expect(isIterableButNotString(null)).toBe(false);
                    expect(isIterableButNotString({})).toBe(false);
                });
            });

            describe('isAsyncFunction', () => {
                it('should return true for async functions', () => {
                    const asyncFn = async () => {};
                    expect(isAsyncFunction(asyncFn)).toBe(true);
                });

                it('should return false for non-async functions', () => {
                    const normalFn = () => {};
                    expect(isAsyncFunction(normalFn)).toBe(false);
                    expect(isAsyncFunction(null)).toBe(false);
                    expect(isAsyncFunction({})).toBe(false);
                });
            });

            describe('isGeneratorFunction', () => {
                it('should return true for generator functions', () => {
                    function* generatorFn() {}
                    expect(isGeneratorFunction(generatorFn)).toBe(true);
                });

                it('should return false for non-generator functions', () => {
                    const normalFn = () => {};
                    expect(isGeneratorFunction(normalFn)).toBe(false);
                    expect(isGeneratorFunction(null)).toBe(false);
                    expect(isGeneratorFunction({})).toBe(false);
                });
            });

            describe('isJSONSerializable', () => {
                it('should return true for JSON serializable values', () => {
                    expect(isJSONSerializable(null)).toBe(true);
                    expect(isJSONSerializable(123)).toBe(true);
                    expect(isJSONSerializable('string')).toBe(true);
                    expect(isJSONSerializable(true)).toBe(true);
                    expect(isJSONSerializable([])).toBe(true);
                    expect(isJSONSerializable({})).toBe(true);
                    expect(isJSONSerializable(new Date())).toBe(true);
                    expect(isJSONSerializable([1, 'two', { three: 3 }])).toBe(true);
                });

                it('should return false for non-JSON serializable values', () => {
                    expect(isJSONSerializable(undefined)).toBe(false);
                    expect(isJSONSerializable(() => {})).toBe(false);
                    expect(isJSONSerializable(Symbol('test'))).toBe(false);
                    expect(isJSONSerializable({ fn: () => {} })).toBe(false);
                });
            });

            describe('isArrayIndex', () => {
                it('should return true for valid array indices', () => {
                    expect(isArrayIndex(0)).toBe(true);
                    expect(isArrayIndex(1)).toBe(true);
                    expect(isArrayIndex(4294967294)).toBe(true); // 2^32 - 2
                });

                it('should return false for invalid array indices', () => {
                    expect(isArrayIndex(-1)).toBe(false);
                    expect(isArrayIndex(4294967295)).toBe(false); // 2^32 - 1
                    expect(isArrayIndex(1.5)).toBe(false);
                    expect(isArrayIndex('0')).toBe(false);
                });
            });

            describe('isPropertyKey', () => {
                it('should return true for valid property keys', () => {
                    expect(isPropertyKey('string')).toBe(true);
                    expect(isPropertyKey(123)).toBe(true);
                    expect(isPropertyKey(Symbol('test'))).toBe(true);
                });

                it('should return false for invalid property keys', () => {
                    expect(isPropertyKey(null)).toBe(false);
                    expect(isPropertyKey(undefined)).toBe(false);
                    expect(isPropertyKey({})).toBe(false);
                    expect(isPropertyKey(() => {})).toBe(false);
                });
            });

            describe('isNumericString', () => {
                it('should return true for numeric strings', () => {
                    expect(isNumericString('123')).toBe(true);
                    expect(isNumericString('123.45')).toBe(true);
                    expect(isNumericString('-123')).toBe(true);
                    expect(isNumericString('1e10')).toBe(true);
                    expect(isNumericString('0')).toBe(true);
                });

                it('should return false for non-numeric strings', () => {
                    expect(isNumericString('abc')).toBe(false);
                    expect(isNumericString('')).toBe(false);
                    expect(isNumericString('  ')).toBe(false);
                    expect(isNumericString(null)).toBe(false);
                    expect(isNumericString(123)).toBe(false); // Not a string
                });
            });

            describe('isIntegerString', () => {
                it('should return true for integer strings', () => {
                    expect(isIntegerString('123')).toBe(true);
                    expect(isIntegerString('-456')).toBe(true);
                    expect(isIntegerString('0')).toBe(true);
                });

                it('should return false for non-integer strings', () => {
                    expect(isIntegerString('123.45')).toBe(false);
                    expect(isIntegerString('abc')).toBe(false);
                    expect(isIntegerString('')).toBe(false);
                    expect(isIntegerString(null)).toBe(false);
                    expect(isIntegerString(123)).toBe(false); // Not a string
                });
            });

            describe('isSameType', () => {
                it('should return true for same type values', () => {
                    expect(isSameType(1, 2)).toBe(true);
                    expect(isSameType('a', 'b')).toBe(true);
                    expect(isSameType([], [1, 2])).toBe(true);
                    expect(isSameType({}, { a: 1 })).toBe(true);
                    expect(isSameType(null, null)).toBe(true);
                    expect(isSameType(undefined, undefined)).toBe(true);
                });

                it('should return false for different type values', () => {
                    expect(isSameType(1, '1')).toBe(false);
                    expect(isSameType([], {})).toBe(false);
                    expect(isSameType(null, undefined)).toBe(false);
                    expect(isSameType(1, null)).toBe(false);
                });
            });
        });

        // 在适当的位置添加以下测试代码

        describe('isNull', () => {
            it('should return true for null', () => {
                expect(isNull(null)).toBe(true);
            });

            it('should return false for non-null values', () => {
                expect(isNull(undefined)).toBe(false);
                expect(isNull(0)).toBe(false);
                expect(isNull('')).toBe(false);
                expect(isNull(false)).toBe(false);
                expect(isNull({})).toBe(false);
            });
        });

        describe('isUndefined', () => {
            it('should return true for undefined', () => {
                expect(isUndefined(undefined)).toBe(true);
                expect(isUndefined(void 0)).toBe(true);
            });

            it('should return false for defined values', () => {
                expect(isUndefined(null)).toBe(false);
                expect(isUndefined(0)).toBe(false);
                expect(isUndefined('')).toBe(false);
                expect(isUndefined(false)).toBe(false);
                expect(isUndefined({})).toBe(false);
            });
        });

        describe('isThenable', () => {
            it('should return true for thenable objects', () => {
                expect(isThenable({ then: () => {} })).toBe(true);
                expect(isThenable(Promise.resolve())).toBe(true);
                expect(isThenable({ then: function () {} })).toBe(true);
            });

            it('should return false for non-thenable objects', () => {
                expect(isThenable(null)).toBe(false);
                expect(isThenable(undefined)).toBe(false);
                expect(isThenable({})).toBe(false);
                expect(isThenable({ then: 'not a function' })).toBe(false);
                expect(isThenable(() => {})).toBe(false);
            });
        });
    });
});
