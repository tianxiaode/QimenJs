import {
    validateArray,
    validateArrayLike,
    validateObject,
    validatePlainObject,
    validateDate,
    validateRegExp,
    validateMap,
    validateSet,
    validatePromise,
    validateError,
    validateTypedArray,
    validateBuffer,
    validateFormData,
    validateURLSearchParams,
    validateFile,
    validateBlob,
    validateEmptyArray,
    validateEmptyObject,
    validateEmptyMap,
    validateEmptySet,
    validateNested,
} from '@orbitjs/utils';

// Mock browser-only APIs for Node.js environment
class MockFile {
    constructor() {}
}
class MockBlob {
    constructor() {}
}
class MockFormData {
    constructor() {}
}
class MockURLSearchParams {
    constructor() {}
}

describe('Structure Validators', () => {
    describe('validateArray', () => {
        it('should validate basic arrays', () => {
            expect(validateArray([1, 2, 3])).toBe(true);
            expect(validateArray('not an array')).toBe(false);
        });

        it('should validate non-empty arrays', () => {
            expect(validateArray([], { nonEmpty: true })).toBe(false);
            expect(validateArray([1], { nonEmpty: true })).toBe(true);
        });

        it('should validate array length constraints', () => {
            expect(validateArray([1, 2], { minLength: 3 })).toBe(false);
            expect(validateArray([1, 2, 3], { minLength: 3 })).toBe(true);
            expect(validateArray([1, 2, 3, 4, 5], { maxLength: 3 })).toBe(false);
            expect(validateArray([1, 2, 3], { maxLength: 3 })).toBe(true);
        });

        it('should validate array items with custom validator', () => {
            const isNumber = (item: any) => typeof item === 'number';
            expect(validateArray([1, 2, 3], { itemValidator: isNumber })).toBe(true);
            expect(validateArray([1, '2', 3], { itemValidator: isNumber })).toBe(false);
        });

        it('should validate unique items', () => {
            expect(validateArray([1, 2, 3], { unique: true })).toBe(true);
            expect(validateArray([1, 2, 2], { unique: true })).toBe(false);
        });

        it('should handle unique objects in arrays', () => {
            const obj1 = { id: 1 };
            const obj2 = { id: 2 };
            const obj3 = { id: 1 }; // Same content as obj1 but different reference

            // 不同引用的对象应该被认为是唯一的
            expect(validateArray([obj1, obj2], { unique: true })).toBe(true);

            // 相同引用的对象不应该被认为是唯一的
            expect(validateArray([obj1, obj1], { unique: true })).toBe(false);

            // 内容相同但引用不同的对象应该被认为是唯一的（因为使用了 Symbol.for('object')）
            expect(validateArray([obj1, obj3], { unique: true })).toBe(true);
        });
    });

    describe('validateArrayLike', () => {
        it('should validate array-like objects', () => {
            expect(validateArrayLike([1, 2, 3])).toBe(true);
            expect(validateArrayLike('string')).toBe(true);
            expect(validateArrayLike({ length: 0 })).toBe(true); // 有 length=0 的对象
            expect(validateArrayLike({ length: 3, 0: 'a', 1: 'b', 2: 'c' })).toBe(true); // 类数组对象
            expect(validateArrayLike({})).toBe(false);
        });
    });

    describe('validateObject', () => {
        it('should validate basic objects', () => {
            expect(validateObject({ a: 1 })).toBe(true);
            expect(validateObject([])).toBe(false);
        });

        it('should validate required keys', () => {
            expect(validateObject({ a: 1, b: 2 }, { requiredKeys: ['a', 'b'] })).toBe(true);
            expect(validateObject({ a: 1 }, { requiredKeys: ['a', 'b'] })).toBe(false);
        });

        it('should validate allowed keys', () => {
            expect(validateObject({ a: 1, b: 2 }, { allowedKeys: ['a', 'b', 'c'] })).toBe(true);
            expect(validateObject({ a: 1, d: 4 }, { allowedKeys: ['a', 'b', 'c'] })).toBe(false);
        });

        it('should validate object key constraints', () => {
            expect(validateObject({ a: 1, b: 2 }, { minKeys: 3 })).toBe(false);
            expect(validateObject({ a: 1, b: 2, c: 3 }, { minKeys: 3 })).toBe(true);
            expect(validateObject({ a: 1, b: 2, c: 3, d: 4 }, { maxKeys: 3 })).toBe(false);
            expect(validateObject({ a: 1, b: 2, c: 3 }, { maxKeys: 3 })).toBe(true);
        });

        // 在 validateObject 的测试块中添加
        it('should validate disallowed keys', () => {
            // 对象包含不允许的键时应该返回 false
            expect(validateObject({ a: 1, b: 2, c: 3 }, { disallowedKeys: ['b'] })).toBe(false);

            // 对象不包含不允许的键时应该返回 true
            expect(validateObject({ a: 1, c: 3 }, { disallowedKeys: ['b'] })).toBe(true);

            // 多个不允许的键
            expect(validateObject({ a: 1, b: 2 }, { disallowedKeys: ['b', 'c'] })).toBe(false);
            expect(validateObject({ a: 1, d: 4 }, { disallowedKeys: ['b', 'c'] })).toBe(true);

            // 空对象应该通过任何 disallowedKeys 检查
            expect(validateObject({}, { disallowedKeys: ['a', 'b'] })).toBe(true);
        });
    });

    describe('validatePlainObject', () => {
        it('should validate plain objects', () => {
            expect(validatePlainObject({})).toBe(true);
            expect(validatePlainObject([])).toBe(false);
            expect(validatePlainObject(new Date())).toBe(false);
        });
    });

    describe('validateDate', () => {
        it('should validate dates', () => {
            expect(validateDate(new Date())).toBe(true);
            expect(validateDate('not a date')).toBe(false);
        });

        it('should validate date ranges', () => {
            const now = new Date();
            const past = new Date(now.getTime() - 86400000);
            const future = new Date(now.getTime() + 86400000);

            expect(validateDate(past, { min: now })).toBe(false);
            expect(validateDate(future, { min: now })).toBe(true);
            expect(validateDate(future, { max: now })).toBe(false);
            expect(validateDate(past, { max: now })).toBe(true);
        });

        it('should validate past and future dates', () => {
            const now = new Date();
            const past = new Date(now.getTime() - 86400000);
            const future = new Date(now.getTime() + 86400000);

            expect(validateDate(past, { past: true })).toBe(true);
            expect(validateDate(future, { past: true })).toBe(false);
            expect(validateDate(future, { future: true })).toBe(true);
            expect(validateDate(past, { future: true })).toBe(false);
        });
    });

    describe('validateRegExp', () => {
        it('should validate regular expressions', () => {
            expect(validateRegExp(/test/)).toBe(true);
            expect(validateRegExp('not a regexp')).toBe(false);
        });
    });

    describe('validateMap', () => {
        it('should validate Maps', () => {
            expect(validateMap(new Map())).toBe(true);
            expect(validateMap({})).toBe(false);
        });

        it('should validate non-empty Maps', () => {
            expect(validateMap(new Map(), { nonEmpty: true })).toBe(false);
            expect(validateMap(new Map([['key', 'value']]), { nonEmpty: true })).toBe(true);
            expect(validateObject({}, { nonEmpty: true })).toBe(false);
            expect(validateObject({ a: 1 }, { nonEmpty: true })).toBe(true);
        });

        it('should validate Map size constraints', () => {
            const map = new Map([
                ['a', 1],
                ['b', 2],
            ]);
            expect(validateMap(map, { minSize: 3 })).toBe(false);
            expect(validateMap(map, { minSize: 2 })).toBe(true);
            expect(validateMap(map, { maxSize: 1 })).toBe(false);
            expect(validateMap(map, { maxSize: 2 })).toBe(true);
        });
    });

    describe('validateSet', () => {
        it('should validate Sets', () => {
            expect(validateSet(new Set())).toBe(true);
            expect(validateSet([])).toBe(false);
        });

        it('should validate non-empty Sets', () => {
            expect(validateSet(new Set(), { nonEmpty: true })).toBe(false);
            expect(validateSet(new Set([1, 2]), { nonEmpty: true })).toBe(true);
        });

        it('should validate Set size constraints', () => {
            const set = new Set([1, 2, 3]);
            expect(validateSet(set, { minSize: 4 })).toBe(false);
            expect(validateSet(set, { minSize: 3 })).toBe(true);
            expect(validateSet(set, { maxSize: 2 })).toBe(false);
            expect(validateSet(set, { maxSize: 3 })).toBe(true);
        });
    });

    describe('Type-specific validators', () => {
        it('should validate Promises', () => {
            // 这些会返回 true
            expect(validatePromise(Promise.resolve())).toBe(true);
            expect(validatePromise(new Promise(() => {}))).toBe(true);
            expect(validatePromise({ then() {}, catch() {} })).toBe(true); // 有 then 和 catch 方法

            // 这些会返回 false
            expect(validatePromise({ then() {} })).toBe(false); // 只有 then，没有 catch
            expect(validatePromise({ catch() {} })).toBe(false); // 只有 catch，没有 then
            expect(validatePromise({})).toBe(false); // 什么都没有
            expect(validatePromise(null)).toBe(false); // null
            expect(validatePromise('promise')).toBe(false);
        });

        it('should validate Errors', () => {
            expect(validateError(new Error())).toBe(true);
            expect(validateError('not an error')).toBe(false);
        });

        it('should validate TypedArrays', () => {
            expect(validateTypedArray(new Uint8Array())).toBe(true);
            expect(validateTypedArray(new Int16Array())).toBe(true);
            expect(validateTypedArray([])).toBe(false);
        });

        it('should validate Buffers', () => {
            // Note: In Node.js environment, actual Buffer testing would be possible
            expect(validateBuffer({})).toBe(false);
        });

        it('should validate browser APIs (mocked)', () => {
            global.File = MockFile as any;
            global.Blob = MockBlob as any;
            global.FormData = MockFormData as any;
            global.URLSearchParams = MockURLSearchParams as any;

            expect(validateFile(new File([], 'test'))).toBe(true);
            expect(validateBlob(new Blob())).toBe(true);
            expect(validateFormData(new FormData())).toBe(true);
            expect(validateURLSearchParams(new URLSearchParams())).toBe(true);
        });
    });

    describe('Empty structure validators', () => {
        it('should validate empty arrays', () => {
            expect(validateEmptyArray([])).toBe(true);
            expect(validateEmptyArray([1])).toBe(false);
        });

        it('should validate empty objects', () => {
            expect(validateEmptyObject({})).toBe(true);
            expect(validateEmptyObject({ a: 1 })).toBe(false);
        });

        it('should validate empty Maps', () => {
            expect(validateEmptyMap(new Map())).toBe(true);
            expect(validateEmptyMap(new Map([['key', 'value']]))).toBe(false);
        });

        it('should validate empty Sets', () => {
            expect(validateEmptySet(new Set())).toBe(true);
            expect(validateEmptySet(new Set([1]))).toBe(false);
        });
    });

    describe('validateNested', () => {
        it('should validate nested arrays', () => {
            const schema = {
                type: 'array' as const,
                itemSchema: { type: 'array' as const },
            };
            expect(
                validateNested(
                    [
                        [1, 2],
                        [3, 4],
                    ],
                    schema
                )
            ).toBe(true);
            expect(validateNested([[1, 2], 3], schema)).toBe(false);
        });

        it('should validate nested objects', () => {
            const schema = {
                type: 'object' as const,
                valueSchema: { type: 'array' as const },
            };
            expect(validateNested({ a: [1, 2], b: [3, 4] }, schema)).toBe(true);
            expect(validateNested({ a: [1, 2], b: 'not array' }, schema)).toBe(false);
        });

        it('should validate nested Maps', () => {
            const schema = {
                type: 'map' as const,
                valueSchema: { type: 'array' as const },
            };
            const map = new Map([
                ['a', [1, 2]],
                ['b', [3, 4]],
            ]);
            expect(validateNested(map, schema)).toBe(true);

            const invalidMap = new Map([
                ['a', [1, 2]],
                ['b', 'not array'],
            ] as any);
            expect(validateNested(invalidMap, schema)).toBe(false);
        });

        it('should validate nested Sets', () => {
            const schema = {
                type: 'set' as const,
                itemSchema: { type: 'array' as const },
            };
            const set = new Set([
                [1, 2],
                [3, 4],
            ]);
            expect(validateNested(set, schema)).toBe(true);

            const invalidSet = new Set([[1, 2], 'not array']);
            expect(validateNested(invalidSet, schema)).toBe(false);
        });
    });

    describe('validateObject - valueValidator coverage', () => {
        it('should call valueValidator for each key-value pair', () => {
            const obj = { a: 1, b: 2, c: 3 };
            const validatedPairs: [string, any][] = [];

            const valueValidator = (key: string, value: any) => {
                validatedPairs.push([key, value]);
                return true;
            };

            const result = validateObject(obj, { valueValidator });

            expect(result).toBe(true);
            expect(validatedPairs).toHaveLength(3);
            expect(validatedPairs).toEqual([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);
        });

        it('should return false when valueValidator returns false for any value', () => {
            const obj = { a: 1, b: 2, c: 3 };

            // Validator that fails for value 2
            const valueValidator = (key: string, value: any) => {
                return value !== 2;
            };

            const result = validateObject(obj, { valueValidator });
            expect(result).toBe(false);
        });

        it('should stop validation and return false immediately when valueValidator fails', () => {
            const obj = { a: 1, b: 2, c: 3 };
            let callCount = 0;

            const valueValidator = (key: string, value: any) => {
                callCount++;
                // Fail on second item
                return value !== 2;
            };

            const result = validateObject(obj, { valueValidator });

            expect(result).toBe(false);
            expect(callCount).toBe(2); // Should only call twice, not for the third item
        });

        it('should work correctly with other options combined', () => {
            const obj = { a: 1, b: 2 };

            const valueValidator = (key: string, value: any) => {
                return typeof value === 'number' && value > 0;
            };

            // Test with multiple options
            const result = validateObject(obj, {
                minKeys: 2,
                requiredKeys: ['a'],
                valueValidator,
            });

            expect(result).toBe(true);
        });

        it('should handle empty objects correctly with valueValidator', () => {
            const obj = {};

            const valueValidator = (key: string, value: any) => {
                return false;
            };

            const result = validateObject(obj, { valueValidator });
            expect(result).toBe(true); // Should pass because there are no values to validate
        });
    });

    it('should return false for invalid array types', () => {
        const schema = {
            type: 'array' as const,
            itemSchema: { type: 'array' as const },
        };

        // 测试非数组输入
        expect(validateNested('not an array', schema)).toBe(false);
        expect(validateNested({}, schema)).toBe(false);
        expect(validateNested(null, schema)).toBe(false);
    });

    it('should return false for invalid object types', () => {
        const schema = {
            type: 'object' as const,
            valueSchema: { type: 'array' as const },
        };

        // 测试非对象输入
        expect(validateNested('not an object', schema)).toBe(false);
        expect(validateNested([], schema)).toBe(false);
        expect(validateNested(null, schema)).toBe(false);
    });

    it('should return false for invalid map types', () => {
        const schema = {
            type: 'map' as const,
            valueSchema: { type: 'array' as const },
        };

        // 测试非Map输入
        expect(validateNested('not a map', schema)).toBe(false);
        expect(validateNested({}, schema)).toBe(false);
        expect(validateNested([], schema)).toBe(false);
        expect(validateNested(null, schema)).toBe(false);
    });

    it('should return false for invalid set types', () => {
        const schema = {
            type: 'set' as const,
            itemSchema: { type: 'array' as const },
        };

        // 测试非Set输入
        expect(validateNested('not a set', schema)).toBe(false);
        expect(validateNested({}, schema)).toBe(false);
        expect(validateNested([], schema)).toBe(false);
        expect(validateNested(null, schema)).toBe(false);
    });

    it('should return false for invalid schema types', () => {
        // @ts-ignore - 测试无效的schema类型
        const invalidSchema = { type: 'invalid' };

        expect(validateNested([], invalidSchema as any)).toBe(false);
        expect(validateNested({}, invalidSchema as any)).toBe(false);
        expect(validateNested(new Map(), invalidSchema as any)).toBe(false);
        expect(validateNested(new Set(), invalidSchema as any)).toBe(false);
    });

    it('should return false when nested validation fails in arrays', () => {
        const schema = {
            type: 'array' as const,
            itemSchema: {
                type: 'array' as const,
                itemSchema: { type: 'object' as const },
            },
        };

        // 内层元素不是对象，导致嵌套验证失败
        const invalidData = [
            [1, 2], // 这些元素不是对象，验证应失败
            [3, 4],
        ];

        expect(validateNested(invalidData, schema)).toBe(false);
    });

    it('should return false when nested validation fails in objects', () => {
        const schema = {
            type: 'object' as const,
            valueSchema: {
                type: 'array' as const,
                itemSchema: { type: 'object' as const },
            },
        };

        // 值不是对象数组，导致嵌套验证失败
        const invalidData = {
            a: [1, 2], // 这些元素不是对象，验证应失败
            b: [3, 4],
        };

        expect(validateNested(invalidData, schema)).toBe(false);
    });

    it('should return false when nested validation fails in maps', () => {
        const schema = {
            type: 'map' as const,
            valueSchema: {
                type: 'array' as const,
                itemSchema: { type: 'object' as const },
            },
        };

        // Map的值不是对象数组，导致嵌套验证失败
        const invalidMap = new Map([
            ['a', [1, 2]], // 这些元素不是对象，验证应失败
            ['b', [3, 4]],
        ]);

        expect(validateNested(invalidMap, schema)).toBe(false);
    });

    it('should return false when nested validation fails in sets', () => {
        const schema = {
            type: 'set' as const,
            itemSchema: {
                type: 'array' as const,
                itemSchema: { type: 'object' as const },
            },
        };

        // Set的元素不是对象数组，导致嵌套验证失败
        const invalidSet = new Set([
            [1, 2], // 这些元素不是对象，验证应失败
            [3, 4],
        ]);

        expect(validateNested(invalidSet, schema)).toBe(false);
    });

    it('should handle key schema validation in maps', () => {
        const schema = {
            type: 'map' as const,
            keySchema: { type: 'array' as const },
            valueSchema: { type: 'array' as const },
        };

        // Key不是数组，验证应失败
        const invalidMap = new Map([
            ['invalid-key', [1, 2]], // key应该也是数组
        ]);

        expect(validateNested(invalidMap, schema)).toBe(false);

        // 正确的情况
        const validMap = new Map([
            [
                [1, 2],
                [3, 4],
            ], // key和value都是数组
        ]);

        expect(validateNested(validMap, schema)).toBe(true);
    });

    it('should validate allowEmptyItems option', () => {
        // 默认情况下应该允许空项目 (null/undefined)
        expect(validateArray([1, null, 2])).toBe(true);
        expect(validateArray([1, undefined, 2])).toBe(true);

        // 明确设置 allowEmptyItems=true
        expect(validateArray([1, null, 2], { allowEmptyItems: true })).toBe(true);
        expect(validateArray([1, undefined, 2], { allowEmptyItems: true })).toBe(true);

        // allowEmptyItems=false 只有在有 itemValidator 时才生效
        expect(validateArray([1, null, 2], { allowEmptyItems: false })).toBe(true); // 注意：这里返回 true
        expect(validateArray([1, undefined, 2], { allowEmptyItems: false })).toBe(true); // 注意：这里返回 true

        // 不包含空项目的数组在 allowEmptyItems=false 时应该通过
        expect(validateArray([1, 2, 3], { allowEmptyItems: false })).toBe(true);
    });

    it('should work with allowEmptyItems and itemValidator combined', () => {
        // allowEmptyItems=false 与 itemValidator 组合使用才会真正起作用
        const isNumber = (item: any) => typeof item === 'number';

        // 包含 null 且 allowEmptyItems=false 时应该失败
        expect(
            validateArray([1, null, 3], {
                allowEmptyItems: false,
                itemValidator: isNumber,
            })
        ).toBe(false);

        // 不包含 null 且 allowEmptyItems=false 时应该成功
        expect(
            validateArray([1, 2, 3], {
                allowEmptyItems: false,
                itemValidator: isNumber,
            })
        ).toBe(true);

        // 包含 undefined 且 allowEmptyItems=false 时应该失败
        expect(
            validateArray([1, undefined, 3], {
                allowEmptyItems: false,
                itemValidator: isNumber,
            })
        ).toBe(false);
    });

    it('should work with allowEmptyItems and other options combined', () => {
        // allowEmptyItems=false 与 itemValidator 组合使用
        const isNumber = (item: any) => typeof item === 'number';

        expect(
            validateArray([1, null, 3], {
                allowEmptyItems: false,
                itemValidator: isNumber,
            })
        ).toBe(false);

        expect(
            validateArray([1, 2, 3], {
                allowEmptyItems: false,
                itemValidator: isNumber,
            })
        ).toBe(true);

        // allowEmptyItems=false 与 unique 组合使用
        expect(
            validateArray([1, null, 1], {
                allowEmptyItems: false,
                unique: true,
            })
        ).toBe(false); // 因为包含 null 而失败

        expect(
            validateArray([1, 2, 3], {
                allowEmptyItems: false,
                unique: true,
            })
        ).toBe(true);
    });

    // 添加到 validateMap 的测试中
    it('should execute key and value validator loops', () => {
        const map = new Map([
            ['a', 1],
            ['b', 2],
        ]);

        // 测试valueValidator循环
        const valueValidator = (value: any) => typeof value === 'number';
        expect(validateMap(map, { valueValidator })).toBe(true);

        const failingValueValidator = (value: any) => value !== 2;
        expect(validateMap(map, { valueValidator: failingValueValidator })).toBe(false);

        // 测试keyValidator循环
        const keyValidator = (key: string) => typeof key === 'string';
        expect(validateMap(map, { keyValidator })).toBe(true);

        const failingKeyValidator = (key: string) => key !== 'b';
        expect(validateMap(map, { keyValidator: failingKeyValidator })).toBe(false);
    });

    // 添加到 validateSet 的测试中
    it('should execute item validator loop', () => {
        const set = new Set([1, 2, 3]);

        // 测试itemValidator循环
        const itemValidator = (item: any) => typeof item === 'number';
        expect(validateSet(set, { itemValidator })).toBe(true);

        const failingItemValidator = (item: any) => item !== 2;
        expect(validateSet(set, { itemValidator: failingItemValidator })).toBe(false);
    });
});
