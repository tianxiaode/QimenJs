import {
    isString,
    isNumber,
    isFiniteNumber,
    isInteger,
    isPositiveInteger,
    isNonNegativeInteger,
    isBoolean,
    isFunction,
    isSymbol,
    isBigInt,
    isPrimitive,
    isTruthy,
    isFalsy,
    isNaN as isNan,
} from '@orbitjs/utils';

describe('Primitive Type Validation Functions', () => {
    describe('isString', () => {
        it('should return true for strings', () => {
            expect(isString('hello')).toBe(true);
            expect(isString('')).toBe(true);
            expect(isString(String('test'))).toBe(true);
        });

        it('should return false for non-strings', () => {
            expect(isString(123)).toBe(false);
            expect(isString(true)).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString({})).toBe(false);
        });
    });

    describe('isNumber', () => {
        it('should return true for valid numbers', () => {
            expect(isNumber(123)).toBe(true);
            expect(isNumber(0)).toBe(true);
            expect(isNumber(-456)).toBe(true);
            expect(isNumber(1.23)).toBe(true);
            expect(isNumber(Infinity)).toBe(true);
        });

        it('should return false for NaN and non-numbers', () => {
            expect(isNumber(NaN)).toBe(false);
            expect(isNumber('123')).toBe(false);
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
        });
    });

    describe('isFiniteNumber', () => {
        it('should return true for finite numbers', () => {
            expect(isFiniteNumber(123)).toBe(true);
            expect(isFiniteNumber(0)).toBe(true);
            expect(isFiniteNumber(-456)).toBe(true);
            expect(isFiniteNumber(1.23)).toBe(true);
        });

        it('should return false for Infinity, NaN and non-numbers', () => {
            expect(isFiniteNumber(Infinity)).toBe(false);
            expect(isFiniteNumber(-Infinity)).toBe(false);
            expect(isFiniteNumber(NaN)).toBe(false);
            expect(isFiniteNumber('123')).toBe(false);
            expect(isFiniteNumber(null)).toBe(false);
        });
    });

    describe('isInteger', () => {
        it('should return true for integers', () => {
            expect(isInteger(123)).toBe(true);
            expect(isInteger(0)).toBe(true);
            expect(isInteger(-456)).toBe(true);
        });

        it('should return false for non-integers', () => {
            expect(isInteger(1.23)).toBe(false);
            expect(isInteger(Infinity)).toBe(false);
            expect(isInteger(NaN)).toBe(false);
            expect(isInteger('123')).toBe(false);
        });
    });

    describe('isPositiveInteger', () => {
        it('should return true for positive integers', () => {
            expect(isPositiveInteger(1)).toBe(true);
            expect(isPositiveInteger(123)).toBe(true);
        });

        it('should return false for zero, negative numbers and non-integers', () => {
            expect(isPositiveInteger(0)).toBe(false);
            expect(isPositiveInteger(-1)).toBe(false);
            expect(isPositiveInteger(1.23)).toBe(false);
            expect(isPositiveInteger('123')).toBe(false);
        });
    });

    describe('isNonNegativeInteger', () => {
        it('should return true for non-negative integers', () => {
            expect(isNonNegativeInteger(0)).toBe(true);
            expect(isNonNegativeInteger(123)).toBe(true);
        });

        it('should return false for negative numbers and non-integers', () => {
            expect(isNonNegativeInteger(-1)).toBe(false);
            expect(isNonNegativeInteger(1.23)).toBe(false);
            expect(isNonNegativeInteger('123')).toBe(false);
        });
    });

    describe('isBoolean', () => {
        it('should return true for booleans', () => {
            expect(isBoolean(true)).toBe(true);
            expect(isBoolean(false)).toBe(true);
        });

        it('should return false for non-booleans', () => {
            expect(isBoolean(1)).toBe(false);
            expect(isBoolean(0)).toBe(false);
            expect(isBoolean('true')).toBe(false);
            expect(isBoolean(null)).toBe(false);
        });
    });

    describe('isFunction', () => {
        it('should return true for functions', () => {
            expect(isFunction(() => {})).toBe(true);
            expect(isFunction(function () {})).toBe(true);
            expect(isFunction(console.log)).toBe(true);
        });

        it('should return false for non-functions', () => {
            expect(isFunction({})).toBe(false);
            expect(isFunction([])).toBe(false);
            expect(isFunction(null)).toBe(false);
            expect(isFunction(undefined)).toBe(false);
        });
    });

    describe('isSymbol', () => {
        it('should return true for symbols', () => {
            expect(isSymbol(Symbol('test'))).toBe(true);
            expect(isSymbol(Symbol())).toBe(true);
        });

        it('should return false for non-symbols', () => {
            expect(isSymbol('symbol')).toBe(false);
            expect(isSymbol({})).toBe(false);
            expect(isSymbol(null)).toBe(false);
        });
    });

    describe('isBigInt', () => {
        it('should return true for bigints', () => {
            expect(isBigInt(BigInt(123))).toBe(true);
            // 修改这一行，使用真正的 bigint 而不是字符串
            expect(isBigInt(BigInt('123'))).toBe(true);
            // 或者
            // expect(isBigInt(123n)).toBe(true);
        });

        it('should return false for non-bigints', () => {
            expect(isBigInt(123)).toBe(false);
            // 保留这个测试，因为字符串确实不应被视为 bigint
            expect(isBigInt('123n')).toBe(false);
            expect(isBigInt(null)).toBe(false);
        });
    });

    describe('isPrimitive', () => {
        it('should return true for primitive values', () => {
            expect(isPrimitive('string')).toBe(true);
            expect(isPrimitive(123)).toBe(true);
            expect(isPrimitive(true)).toBe(true);
            expect(isPrimitive(Symbol('test'))).toBe(true);
            expect(isPrimitive(BigInt(123))).toBe(true);
            expect(isPrimitive(undefined)).toBe(true);
            expect(isPrimitive(null)).toBe(true);
        });

        it('should return false for non-primitive values', () => {
            expect(isPrimitive({})).toBe(false);
            expect(isPrimitive([])).toBe(false);
            expect(isPrimitive(new Date())).toBe(false);
            expect(isPrimitive(/regex/)).toBe(false);
        });
    });

    describe('isTruthy', () => {
        it('should return true for truthy values', () => {
            expect(isTruthy('hello')).toBe(true);
            expect(isTruthy(123)).toBe(true);
            expect(isTruthy(true)).toBe(true);
            expect(isTruthy({})).toBe(true);
            expect(isTruthy([])).toBe(true);
        });

        it('should return false for falsy values', () => {
            expect(isTruthy(false)).toBe(false);
            expect(isTruthy(0)).toBe(false);
            expect(isTruthy('')).toBe(false);
            expect(isTruthy(null)).toBe(false);
            expect(isTruthy(undefined)).toBe(false);
            expect(isTruthy(NaN)).toBe(false);
        });
    });

    describe('isFalsy', () => {
        it('should return true for falsy values', () => {
            expect(isFalsy(false)).toBe(true);
            expect(isFalsy(0)).toBe(true);
            expect(isFalsy('')).toBe(true);
            expect(isFalsy(null)).toBe(true);
            expect(isFalsy(undefined)).toBe(true);
            expect(isFalsy(NaN)).toBe(true);
        });

        it('should return false for truthy values', () => {
            expect(isFalsy('hello')).toBe(false);
            expect(isFalsy(123)).toBe(false);
            expect(isFalsy(true)).toBe(false);
            expect(isFalsy({})).toBe(false);
            expect(isFalsy([])).toBe(false);
        });
    });

    describe('isNaN', () => {
        it('should return true for NaN', () => {
            expect(isNan(NaN)).toBe(true);
        });

        it('should return false for other values including non-numbers', () => {
            expect(isNan(123)).toBe(false);
            expect(isNan('NaN')).toBe(false);
            expect(isNan(undefined)).toBe(false);
            expect(isNan(null)).toBe(false);
        });
    });
});
