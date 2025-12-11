// primitives.test.ts
import {
    validateString,
    validateNumber,
    validateBoolean,
    validateFunction,
    validateSymbol,
    validateBigInt,
    validatePrimitive,
    validateTruthy,
    validateFalsy,
    validateInteger,
    validatePositiveInteger,
    validateNonNegativeInteger,
    validateFiniteNumber,
    validateNaN,
    validateEqual,
    validateNotEqual,
    validateNil,
    validateNotNil,
    createValidator,
    createConditionalValidator,
} from '@orbitjs/utils';

describe('Primitive Validators', () => {
    describe('validateString', () => {
        it('should validate basic strings', () => {
            expect(validateString('hello')).toBe(true);
            expect(validateString(123)).toBe(false);
        });

        it('should validate non-empty strings', () => {
            expect(validateString('', { nonEmpty: true })).toBe(false);
            expect(validateString(' ', { nonEmpty: true })).toBe(true);
            expect(validateString('a', { nonEmpty: true })).toBe(true);
        });

        it('should validate non-empty strings with trim', () => {
            expect(validateString('', { nonEmpty: true, trim: true })).toBe(false);
            // 使用 trim 选项后，空格字符串会被认为是"空"的
            expect(validateString(' ', { nonEmpty: true, trim: true })).toBe(false);
            expect(validateString(' a ', { nonEmpty: true, trim: true })).toBe(true);
        });

        it('should validate string length constraints', () => {
            expect(validateString('hi', { minLength: 3 })).toBe(false);
            expect(validateString('hello', { minLength: 3 })).toBe(true);
            expect(validateString('hello', { maxLength: 3 })).toBe(false);
            expect(validateString('hi', { maxLength: 3 })).toBe(true);
        });

        it('should validate with trim option', () => {
            expect(validateString('  hello  ', { trim: true, minLength: 3 })).toBe(true);
            expect(validateString('  hello  ', { trim: false, minLength: 3 })).toBe(true);
        });

        it('should validate allowed and disallowed values', () => {
            expect(validateString('apple', { allowedValues: ['apple', 'banana'] })).toBe(true);
            expect(validateString('orange', { allowedValues: ['apple', 'banana'] })).toBe(false);
            expect(validateString('apple', { disallowedValues: ['apple', 'banana'] })).toBe(false);
            expect(validateString('orange', { disallowedValues: ['apple', 'banana'] })).toBe(true);
        });
    });

    describe('validateNumber', () => {
        it('should validate basic numbers', () => {
            expect(validateNumber(42)).toBe(true);
            expect(validateNumber('42')).toBe(false);
        });

        it('should validate number range constraints', () => {
            expect(validateNumber(5, { min: 10 })).toBe(false);
            expect(validateNumber(15, { min: 10 })).toBe(true);
            expect(validateNumber(15, { max: 10 })).toBe(false);
            expect(validateNumber(5, { max: 10 })).toBe(true);
        });

        it('should validate integer constraint', () => {
            expect(validateNumber(42, { integer: true })).toBe(true);
            expect(validateNumber(42.5, { integer: true })).toBe(false);
        });

        it('should validate positive/negative constraints', () => {
            expect(validateNumber(5, { positive: true })).toBe(true);
            expect(validateNumber(-5, { positive: true })).toBe(false);
            expect(validateNumber(-5, { negative: true })).toBe(true);
            expect(validateNumber(5, { negative: true })).toBe(false);
            expect(validateNumber(0, { nonNegative: true })).toBe(true);
            expect(validateNumber(-1, { nonNegative: true })).toBe(false);
        });

        it('should validate finite constraint', () => {
            expect(validateNumber(Infinity, { finite: true })).toBe(false);
            expect(validateNumber(Infinity, { finite: false })).toBe(true);
            expect(validateNumber(42, { finite: true })).toBe(true);
        });

        it('should validate allowed values', () => {
            expect(validateNumber(42, { allowedValues: [1, 42, 100] })).toBe(true);
            expect(validateNumber(43, { allowedValues: [1, 42, 100] })).toBe(false);
        });

        // 添加测试用例以覆盖第253行 (negative 条件)
        it('should handle zero correctly for negative constraint', () => {
            expect(validateNumber(0, { negative: true })).toBe(false);
            expect(validateNumber(-0, { negative: true })).toBe(false); // -0 在JavaScript中等于 0
        });

        // 添加测试用例以覆盖第258行 (positive 条件)
        it('should handle zero correctly for positive constraint', () => {
            expect(validateNumber(0, { positive: true })).toBe(false);
        });

        // 在 primitives.test.ts 的 Specialized number validators 部分添加缺失的测试用例

        it('should validate integers with nonNegative option', () => {
            expect(validateInteger(42)).toBe(true);
            expect(validateInteger(42.5)).toBe(false);

            expect(validateInteger(5, { min: 10 })).toBe(false);
            expect(validateInteger(15, { min: 10 })).toBe(true);

            expect(validateInteger(-5, { positive: true })).toBe(false);
            expect(validateInteger(5, { positive: true })).toBe(true);
        });

        // 添加测试用例以覆盖 validateInteger 中的 nonNegative 条件 (第257-260行)
        it('should validate nonNegative constraint in validateInteger', () => {
            expect(validateInteger(-1, { nonNegative: true })).toBe(false);
            expect(validateInteger(0, { nonNegative: true })).toBe(true);
            expect(validateInteger(1, { nonNegative: true })).toBe(true);
            // 测试同时使用 nonNegative 和 max 参数
            expect(validateInteger(15, { nonNegative: true, max: 10 })).toBe(false);
            expect(validateInteger(5, { nonNegative: true, max: 10 })).toBe(true);
            // 测试同时使用 nonNegative 和 min 参数
            expect(validateInteger(5, { nonNegative: true, min: 10 })).toBe(false);
            expect(validateInteger(15, { nonNegative: true, min: 10 })).toBe(true);
        });

        it('should validate integers with max constraint', () => {
            expect(validateInteger(15, { max: 10 })).toBe(false);
            expect(validateInteger(5, { max: 10 })).toBe(true);
            // 结合其他选项测试
            expect(validateInteger(-5, { max: 10, min: -5 })).toBe(true);
            expect(validateInteger(15, { max: 10, min: -5 })).toBe(false);
        });
    });

    describe('Type validators', () => {
        it('should validate booleans', () => {
            expect(validateBoolean(true)).toBe(true);
            expect(validateBoolean(false)).toBe(true);
            expect(validateBoolean(1)).toBe(false);
        });

        it('should validate functions', () => {
            expect(validateFunction(() => {})).toBe(true);
            expect(validateFunction({})).toBe(false);
        });

        it('should validate symbols', () => {
            expect(validateSymbol(Symbol('test'))).toBe(true);
            expect(validateSymbol('symbol')).toBe(false);
        });

        it('should validate bigints', () => {
            expect(validateBigInt(BigInt(42))).toBe(true);
            expect(validateBigInt(42)).toBe(false);
        });

        it('should validate primitives', () => {
            expect(validatePrimitive(42)).toBe(true);
            expect(validatePrimitive('hello')).toBe(true);
            expect(validatePrimitive(true)).toBe(true);
            expect(validatePrimitive({})).toBe(false);
        });
    });

    describe('Truthy/Falsy validators', () => {
        it('should validate truthy values', () => {
            expect(validateTruthy(1)).toBe(true);
            expect(validateTruthy('')).toBe(false);
            expect(validateTruthy(null)).toBe(false);
        });

        it('should validate falsy values', () => {
            expect(validateFalsy(0)).toBe(true);
            expect(validateFalsy(1)).toBe(false);
            expect(validateFalsy('hello')).toBe(false);
        });
    });

    describe('Specialized number validators', () => {
        it('should validate integers', () => {
            expect(validateInteger(42)).toBe(true);
            expect(validateInteger(42.5)).toBe(false);

            expect(validateInteger(5, { min: 10 })).toBe(false);
            expect(validateInteger(15, { min: 10 })).toBe(true);

            expect(validateInteger(-5, { positive: true })).toBe(false);
            expect(validateInteger(5, { positive: true })).toBe(true);
        });

        // 添加测试用例以覆盖第268行 (negative 条件)
        it('should handle zero correctly for negative constraint in validateInteger', () => {
            expect(validateInteger(0, { negative: true })).toBe(false);
            expect(validateInteger(-5, { negative: true })).toBe(true);
        });

        // 添加测试用例以覆盖第261行 (positive 条件)
        it('should handle zero correctly for positive constraint in validateInteger', () => {
            expect(validateInteger(0, { positive: true })).toBe(false);
            expect(validateInteger(5, { positive: true })).toBe(true);
        });

        it('should validate positive integers', () => {
            expect(validatePositiveInteger(42)).toBe(true);
            expect(validatePositiveInteger(-42)).toBe(false);
            expect(validatePositiveInteger(0)).toBe(false);

            expect(validatePositiveInteger(5, { min: 10 })).toBe(false);
            expect(validatePositiveInteger(15, { min: 10 })).toBe(true);
        });

        it('should validate non-negative integers', () => {
            expect(validateNonNegativeInteger(42)).toBe(true);
            expect(validateNonNegativeInteger(0)).toBe(true);
            expect(validateNonNegativeInteger(-42)).toBe(false);

            expect(validateNonNegativeInteger(5, { min: 10 })).toBe(false);
            expect(validateNonNegativeInteger(15, { min: 10 })).toBe(true);
        });

        // 添加测试用例以覆盖第299行 (validateNonNegativeInteger中的min/max)
        it('should validate non-negative integer with min/max constraints', () => {
            expect(validateNonNegativeInteger(5, { min: 10 })).toBe(false);
            expect(validateNonNegativeInteger(0, { min: 0 })).toBe(true);
            expect(validateNonNegativeInteger(15, { max: 10 })).toBe(false);
            expect(validateNonNegativeInteger(5, { max: 10 })).toBe(true);
        });

        it('should validate finite numbers', () => {
            expect(validateFiniteNumber(42)).toBe(true);
            expect(validateFiniteNumber(Infinity)).toBe(false);

            expect(validateFiniteNumber(5, { min: 10 })).toBe(false);
            expect(validateFiniteNumber(15, { min: 10 })).toBe(true);
        });

        // 添加测试用例以覆盖第330行 (validateFiniteNumber中的max)
        it('should validate finite number with max constraint', () => {
            expect(validateFiniteNumber(15, { max: 10 })).toBe(false);
            expect(validateFiniteNumber(5, { max: 10 })).toBe(true);
        });

        it('should validate NaN', () => {
            expect(validateNaN(NaN)).toBe(true);
            expect(validateNaN(42)).toBe(false);
        });

        // 添加测试用例以覆盖第361行 (validatePositiveInteger中的max)
        it('should validate positive integer with max constraint', () => {
            expect(validatePositiveInteger(15, { max: 10 })).toBe(false);
            expect(validatePositiveInteger(5, { max: 10 })).toBe(true);
        });
    });

    describe('Equality validators', () => {
        it('should validate equality', () => {
            expect(validateEqual(42, 42)).toBe(true);
            expect(validateEqual(42, '42')).toBe(false);
            expect(validateEqual('hello', 'hello')).toBe(true);
        });

        it('should validate inequality', () => {
            expect(validateNotEqual(42, 43)).toBe(true);
            expect(validateNotEqual(42, 42)).toBe(false);
        });
    });

    describe('Nil validators', () => {
        it('should validate nil values', () => {
            expect(validateNil(null)).toBe(true);
            expect(validateNil(undefined)).toBe(true);
            expect(validateNil(0)).toBe(false);
        });

        it('should validate not-nil values', () => {
            expect(validateNotNil(42)).toBe(true);
            expect(validateNotNil('hello')).toBe(true);
            expect(validateNotNil(null)).toBe(false);
            expect(validateNotNil(undefined)).toBe(false);
        });
    });

    describe('Custom validators', () => {
        it('should create custom validator', () => {
            const isEven = createValidator(
                (value): value is number => typeof value === 'number' && value % 2 === 0
            );

            expect(isEven(42)).toBe(true);
            expect(isEven(41)).toBe(false);
        });

        it('should create conditional validator', () => {
            const isEven = (value: any): value is number =>
                typeof value === 'number' && value % 2 === 0;

            const isPositiveEven = createConditionalValidator(isEven, value => value > 0);

            expect(isPositiveEven(42)).toBe(true);
            expect(isPositiveEven(-42)).toBe(false);
            expect(isPositiveEven(41)).toBe(false);
        });
    });
});
