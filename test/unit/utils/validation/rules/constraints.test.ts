// constraints.test.ts
import {
    hasMinLength,
    hasMaxLength,
    hasLengthBetween,
    hasMinValue,
    hasMaxValue,
    isBetween,
    isGreaterThan,
    isGreaterThanOrEqual,
    isLessThan,
    isLessThanOrEqual,
    isEqualTo,
    isNotEqualTo,
    isInCollection,
    isNotInCollection,
    isEmptyString,
    isEmptyArray,
    isEmptyObject,
    isEmptyMap,
    isEmptySet,
    isEmpty,
    isArrayIndex,
    isPropertyKey,
    isSameType,
    isJSONSerializable,
    smartCompare,
    ValidationErrorCode,
} from '@orbitjs/utils';

describe('Constraints Tests', () => {
    describe('smartCompare', () => {
        it('should perform strict comparison correctly', () => {
            expect(smartCompare(5, 5)).toBe(0);
            expect(smartCompare(5, 3)).toBe(1);
            expect(smartCompare(3, 5)).toBe(-1);
            expect(smartCompare('abc', 'abc')).toBe(0);
            expect(smartCompare('abc', 'def')).toBe(-1);
            expect(smartCompare('def', 'abc')).toBe(1);
            expect(smartCompare(new Date('2020-01-01'), new Date('2020-01-01'))).toBe(0);
            expect(smartCompare(true, true)).toBe(0);
            expect(smartCompare(true, false)).toBe(1);
            expect(smartCompare(false, true)).toBe(-1);
            expect(smartCompare(5, '5')).toBe(NaN); // Different types
        });

        it('should perform loose comparison correctly', () => {
            expect(smartCompare(5, '5', false)).toBe(0);
            expect(smartCompare('10', 5, false)).toBe(1);
            expect(smartCompare(5, '10', false)).toBe(-1);

            // 添加字符串数字比较测试（覆盖字符串转数字比较的代码）
            expect(smartCompare('5', '05', false)).toBe(0); // 数值相等但字符串不等
            expect(smartCompare('10', '05', false)).toBe(1); // 10 > 5
            expect(smartCompare('05', '10', false)).toBe(-1); // 5 < 10

            // 添加布尔值比较测试
            expect(smartCompare(true, true, false)).toBe(0);
            expect(smartCompare(true, false, false)).toBe(1);
            expect(smartCompare(false, true, false)).toBe(-1);

            // 添加字符串字典序比较测试（非数字字符串）
            expect(smartCompare('abc', 'abc', false)).toBe(0);
            expect(smartCompare('abc', 'def', false)).toBe(-1);
            expect(smartCompare('def', 'abc', false)).toBe(1);
            expect(smartCompare(new Date('2020-01-01'), new Date('2020-01-01'), false)).toBe(0);

            // 添加相同类型数字比较测试（覆盖 looseCompare 中的数字比较代码）
            expect(smartCompare(5, 5, false)).toBe(0); // 相等
            expect(smartCompare(5, 3, false)).toBe(1); // 大于
            expect(smartCompare(3, 5, false)).toBe(-1); // 小于

            // 添加 NaN 处理测试
            expect(isNaN(smartCompare(NaN, 5, false))).toBe(true);
            expect(isNaN(smartCompare(5, NaN, false))).toBe(true);
            expect(isNaN(smartCompare(NaN, NaN, false))).toBe(true);
            // 测试无法转换为数字的字符串会进行字典序比较
            expect(smartCompare('not-a-number', '5', false)).toBe(1); // 按字典序 'n' > '5'
            expect(smartCompare('5', 'not-a-number', false)).toBe(-1); // 按字典序 '5' < 'n'

            const testDate = new Date('2020-01-01');
            expect(smartCompare('2020-01-01', testDate, false)).toBe(0);
            expect(smartCompare(testDate.getTime(), testDate, false)).toBe(0);

            const testDate2 = new Date('2020-01-01T00:00:00Z');
            const timestamp = testDate2.getTime();
            expect(smartCompare(testDate2, timestamp, false)).toBe(0);
            expect(smartCompare(testDate2, '2020-01-01T00:00:00Z', false)).toBe(0);
        });
    });

    describe('Length Constraints', () => {
        it('should validate minimum length', () => {
            const validator = hasMinLength(3);
            expect(validator('hello').isValid).toBe(true);
            expect(validator('hi').isValid).toBe(false);
            expect(validator([1, 2, 3, 4]).isValid).toBe(true);
            expect(validator([1, 2]).isValid).toBe(false);
            expect(
                validator(
                    new Map([
                        ['a', 1],
                        ['b', 2],
                        ['c', 3],
                    ])
                ).isValid
            ).toBe(true);
            expect(validator({ a: 1, b: 2 }).isValid).toBe(false);

            expect(validator(new Set([1, 2, 3, 4])).isValid).toBe(true); // 添加这一行
            expect(validator(new Set([1, 2])).isValid).toBe(false); // 添加这一行
        });

        it('should validate maximum length', () => {
            const validator = hasMaxLength(3);
            expect(validator('hi').isValid).toBe(true);
            expect(validator('hello').isValid).toBe(false);
            expect(validator([1, 2, 3]).isValid).toBe(true);
            expect(validator([1, 2, 3, 4]).isValid).toBe(false);
            expect(validator(new Set([1, 2, 3])).isValid).toBe(true); // 添加这一行
            expect(validator(new Set([1, 2, 3, 4])).isValid).toBe(false); // 添加这一行
        });

        it('should validate length between range', () => {
            const validator = hasLengthBetween(2, 4);
            expect(validator('hi').isValid).toBe(true);
            expect(validator('hello').isValid).toBe(false);
            expect(validator([1, 2, 3]).isValid).toBe(true);
            expect(validator([]).isValid).toBe(false);
            expect(validator(new Set([1, 2, 3])).isValid).toBe(true); // 添加这一行
            expect(validator(new Set([1])).isValid).toBe(false); // 添加这一行
        });
    });

    describe('Numeric Value Constraints', () => {
        it('should validate minimum value', () => {
            const validator = hasMinValue(5);
            expect(validator(5).isValid).toBe(true);
            expect(validator(10).isValid).toBe(true);
            expect(validator(3).isValid).toBe(false);
        });

        it('should validate maximum value', () => {
            const validator = hasMaxValue(10);
            expect(validator(10).isValid).toBe(true);
            expect(validator(5).isValid).toBe(true);
            expect(validator(15).isValid).toBe(false);
        });

        it('should validate value between range', () => {
            const validator = isBetween(5, 10);
            expect(validator(7).isValid).toBe(true);
            expect(validator(5).isValid).toBe(true);
            expect(validator(10).isValid).toBe(true);
            expect(validator(3).isValid).toBe(false);
            expect(validator(15).isValid).toBe(false);
        });

        it('should validate greater than', () => {
            const validator = isGreaterThan(5);
            expect(validator(10).isValid).toBe(true);
            expect(validator(5).isValid).toBe(false);
            expect(validator(3).isValid).toBe(false);
        });

        it('should validate greater than or equal', () => {
            const validator = isGreaterThanOrEqual(5);
            expect(validator(5).isValid).toBe(true);
            expect(validator(10).isValid).toBe(true);
            expect(validator(3).isValid).toBe(false);
        });

        it('should validate less than', () => {
            const validator = isLessThan(10);
            expect(validator(5).isValid).toBe(true);
            expect(validator(10).isValid).toBe(false);
            expect(validator(15).isValid).toBe(false);
        });

        it('should validate less than or equal', () => {
            const validator = isLessThanOrEqual(10);
            expect(validator(10).isValid).toBe(true);
            expect(validator(5).isValid).toBe(true);
            expect(validator(15).isValid).toBe(false);
        });

        it('should validate equality', () => {
            // Strict comparison (default)
            const strictValidator = isEqualTo(5);
            expect(strictValidator(5).isValid).toBe(true);
            expect(strictValidator('5').isValid).toBe(false);

            // Loose comparison
            const looseValidator = isEqualTo(5, false);
            expect(looseValidator(5).isValid).toBe(true);
            expect(looseValidator('5').isValid).toBe(true);
        });

        it('should validate inequality', () => {
            const validator = isNotEqualTo(5);
            expect(validator(3).isValid).toBe(true);
            expect(validator(5).isValid).toBe(false);
        });
    });

    describe('Collection Membership Constraints', () => {
        it('should validate inclusion in array', () => {
            const validator = isInCollection([1, 2, 3, 4, 5]);
            expect(validator(3).isValid).toBe(true);
            expect(validator(6).isValid).toBe(false);
        });

        it('should validate inclusion in set', () => {
            const validator = isInCollection(new Set([1, 2, 3, 4, 5]));
            expect(validator(3).isValid).toBe(true);
            expect(validator(6).isValid).toBe(false);
        });

        it('should validate exclusion from array', () => {
            const validator = isNotInCollection([1, 2, 3, 4, 5]);
            expect(validator(6).isValid).toBe(true);
            expect(validator(3).isValid).toBe(false);
        });

        it('should validate exclusion from set', () => {
            const validator = isNotInCollection(new Set([1, 2, 3, 4, 5]));
            expect(validator(6).isValid).toBe(true);
            expect(validator(3).isValid).toBe(false);
        });

        // 添加测试无效集合类型的用例
        it('should handle invalid collection types', () => {
            // 通过类型断言绕过 TypeScript 类型检查
            const invalidCollectionValidator = isInCollection('not-a-collection' as any);
            const result: any = invalidCollectionValidator(1);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].errorCode).toBe(ValidationErrorCode.INVALID_COLLECTION_TYPE);

            const invalidCollectionValidator2 = isNotInCollection(123 as any);
            const result2: any = invalidCollectionValidator2(1);
            expect(result2.isValid).toBe(false);
            expect(result2.errors[0].errorCode).toBe(ValidationErrorCode.INVALID_COLLECTION_TYPE);
        });
    });

    describe('Empty Value Checks', () => {
        it('should validate empty strings', () => {
            expect(isEmptyString('').isValid).toBe(true);
            expect(isEmptyString(' ').isValid).toBe(true); // trim() makes it empty
            expect(isEmptyString('hello').isValid).toBe(false);
            expect(isEmptyString(123).isValid).toBe(false); // Not a string
        });

        it('should validate empty arrays', () => {
            expect(isEmptyArray([]).isValid).toBe(true);
            expect(isEmptyArray([1, 2]).isValid).toBe(false);
            expect(isEmptyArray({}).isValid).toBe(false); // Not an array
        });

        it('should validate empty objects', () => {
            expect(isEmptyObject({}).isValid).toBe(true);
            expect(isEmptyObject({ a: 1 }).isValid).toBe(false);
            expect(isEmptyObject([]).isValid).toBe(false); // Not an object
        });

        it('should validate empty maps', () => {
            expect(isEmptyMap(new Map()).isValid).toBe(true);
            expect(isEmptyMap(new Map([['key', 'value']])).isValid).toBe(false);
            expect(isEmptyMap({}).isValid).toBe(false); // Not a map
        });

        it('should validate empty sets', () => {
            expect(isEmptySet(new Set()).isValid).toBe(true);
            expect(isEmptySet(new Set([1, 2])).isValid).toBe(false);
            expect(isEmptySet([]).isValid).toBe(false); // Not a set
        });

        it('should validate general emptiness', () => {
            expect(isEmpty(null).isValid).toBe(true);
            expect(isEmpty(undefined).isValid).toBe(true);
            expect(isEmpty('').isValid).toBe(true);
            expect(isEmpty([]).isValid).toBe(true);
            expect(isEmpty({}).isValid).toBe(true);
            expect(isEmpty(new Map()).isValid).toBe(true);
            expect(isEmpty(new Set()).isValid).toBe(true);
            expect(isEmpty('hello').isValid).toBe(false);
            expect(isEmpty([1]).isValid).toBe(false);
            expect(isEmpty({ a: 1 }).isValid).toBe(false);

            // 测试其他类型被视为非空
            expect(isEmpty(42).isValid).toBe(false); // 数字
            expect(isEmpty(true).isValid).toBe(false); // 布尔值
            expect(isEmpty(false).isValid).toBe(false); // 布尔值
            expect(isEmpty(Symbol('test')).isValid).toBe(false); // Symbol
        });
    });

    describe('Type and Index Checks', () => {
        it('should validate array indices', () => {
            expect(isArrayIndex(0).isValid).toBe(true);
            expect(isArrayIndex(10).isValid).toBe(true);
            expect(isArrayIndex(-1).isValid).toBe(false); // Negative
            expect(isArrayIndex(1.5).isValid).toBe(false); // Not integer
            expect(isArrayIndex('5').isValid).toBe(false); // Not number
            expect(isArrayIndex(2 ** 32).isValid).toBe(false); // Too large
        });

        it('should validate property keys', () => {
            expect(isPropertyKey('key').isValid).toBe(true);
            expect(isPropertyKey(123).isValid).toBe(true);
            expect(isPropertyKey(Symbol('test')).isValid).toBe(true);
            expect(isPropertyKey({}).isValid).toBe(false); // Not a valid key
        });

        it('should validate same types', () => {
            expect(isSameType(5, 10).isValid).toBe(true);
            expect(isSameType('a', 'b').isValid).toBe(true);
            expect(isSameType([], [1, 2]).isValid).toBe(true);
            expect(isSameType({}, { a: 1 }).isValid).toBe(true);
            expect(isSameType(5, '5').isValid).toBe(false);
            expect(isSameType([], {}).isValid).toBe(false);
        });
    });

    describe('JSON Serialization Check', () => {
        it('should validate JSON serializable values', () => {
            expect(isJSONSerializable(null).isValid).toBe(true);
            expect(isJSONSerializable('string').isValid).toBe(true);
            expect(isJSONSerializable(123).isValid).toBe(true);
            expect(isJSONSerializable(true).isValid).toBe(true);
            expect(isJSONSerializable([1, 2, 3]).isValid).toBe(true);
            expect(isJSONSerializable({ a: 1, b: '2' }).isValid).toBe(true);
            expect(isJSONSerializable(new Date()).isValid).toBe(true);
            expect(isJSONSerializable({ [Symbol('key')]: 'value' }).isValid).toBe(false); // Symbol key
            expect(isJSONSerializable(undefined).isValid).toBe(false);
            expect(isJSONSerializable(Symbol('test')).isValid).toBe(false);
            expect(isJSONSerializable([1, undefined, 3]).isValid).toBe(false); // Array with undefined

            // 显式测试数组中包含不可序列化元素的情况
            // expect(isJSONSerializable([1, Symbol('test'), 3]).isValid).toBe(false); // Array with symbol
            // expect(isJSONSerializable([1, { [Symbol('key')]: 'value' }, 3]).isValid).toBe(false); // Array with object containing symbol key
            expect(isJSONSerializable([1, function () {}, 3]).isValid).toBe(false); // Array with function
            // 添加这些测试用例：
            // expect(isJSONSerializable([1, undefined, 3]).isValid).toBe(false); // 已有
            // expect(isJSONSerializable([1, Symbol('test'), 3]).isValid).toBe(false); // 已有

            // // 可能还需要添加：
            // expect(isJSONSerializable([1, , 3]).isValid).toBe(false); // 稀疏数组包含 undefined
        });
    });

    describe('Numeric Value Constraints Error Cases', () => {
        it('should fail when non-number values are passed to numeric comparators', () => {
            // 测试大于比较
            const greaterThanValidator = isGreaterThan(5);
            expect(greaterThanValidator('not-a-number').isValid).toBe(false);

            // 测试大于等于比较
            const greaterThanOrEqualValidator = isGreaterThanOrEqual(5);
            expect(greaterThanOrEqualValidator('not-a-number').isValid).toBe(false);

            // 测试小于比较
            const lessThanValidator = isLessThan(10);
            expect(lessThanValidator('not-a-number').isValid).toBe(false);

            // 测试小于等于比较
            const lessThanOrEqualValidator = isLessThanOrEqual(10);
            expect(lessThanOrEqualValidator('not-a-number').isValid).toBe(false);

            // 测试范围检查
            const minValueValidator = hasMinValue(5);
            expect(minValueValidator('not-a-number').isValid).toBe(false);

            const maxValueValidator = hasMaxValue(10);
            expect(maxValueValidator('not-a-number').isValid).toBe(false);

            const betweenValidator = isBetween(5, 10);
            expect(betweenValidator('not-a-number').isValid).toBe(false);
        });
    });

    describe('isSameType Null and Undefined Checks', () => {
        it('should handle null and undefined values', () => {
            // 测试两个 null 值 - 应该返回成功
            expect(isSameType(null, null).isValid).toBe(true);

            // 测试两个 undefined 值 - 应该返回成功
            expect(isSameType(undefined, undefined).isValid).toBe(true);

            // 测试 null 和 undefined - 应该返回失败
            expect(isSameType(null, undefined).isValid).toBe(false);

            // 测试 null 和其他类型 - 应该返回失败
            expect(isSameType(null, 5).isValid).toBe(false);
            expect(isSameType('string', null).isValid).toBe(false);

            // 测试 undefined 和其他类型 - 应该返回失败
            expect(isSameType(undefined, 5).isValid).toBe(false);
            expect(isSameType('string', undefined).isValid).toBe(false);
        });
    });

    it('should cover final numeric conversion in loose comparison', () => {
        // 使用对象和数字进行比较，迫使进入最后的数字转换逻辑
        const obj = {
            valueOf: () => 42,
            toString: () => '42',
        };

        expect(smartCompare(obj, 42, false)).toBe(0);
        expect(smartCompare(obj, 43, false)).toBe(-1);
        expect(smartCompare(obj, 41, false)).toBe(1);
    });

    describe('Length Constraints', () => {
        it('should validate minimum length', () => {
            const validator = hasMinLength(3);
            expect(validator('hello').isValid).toBe(true);
            expect(validator('hi').isValid).toBe(false);
            expect(validator([1, 2, 3, 4]).isValid).toBe(true);
            expect(validator([1, 2]).isValid).toBe(false);
            expect(
                validator(
                    new Map([
                        ['a', 1],
                        ['b', 2],
                        ['c', 3],
                    ])
                ).isValid
            ).toBe(true);
            expect(validator({ a: 1, b: 2 }).isValid).toBe(false);

            expect(validator(new Set([1, 2, 3, 4])).isValid).toBe(true);
            expect(validator(new Set([1, 2])).isValid).toBe(false);

            // 测试不支持的类型应该返回错误
            expect(validator(123).isValid).toBe(false); // 数字没有长度
            expect(validator(true).isValid).toBe(false); // 布尔值没有长度
            expect(validator(null).isValid).toBe(false); // null没有长度
        });
    });
});
