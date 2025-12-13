import {
    isString,
    isNotEmptyString,
    isNumber,
    isBoolean,
    isDate,
    isArray,
    isObject,
    isFunction,
    isRegExp,
    isSymbol,
    isBigInt,
    isNull,
    isUndefined,
    isPrimitive,
    isNil,
    isFiniteNumber,
    isInteger,
    isPositiveInteger,
    isNonNegativeInteger,
    isTruthy,
    isFalsy,
    isNaN,
} from '@orbitjs/utils';

describe('Validation Primitives Rules', () => {
    describe('isString', () => {
        it('should validate string values', () => {
            expect(isString('hello').isValid).toBe(true);
            expect(isString('').isValid).toBe(true);
            expect(isString(123).isValid).toBe(false);
            expect(isString(true).isValid).toBe(false);
        });
    });

    describe('isNotEmptyString', () => {
        it('should validate non-empty strings', () => {
            expect(isNotEmptyString('hello').isValid).toBe(true);
            expect(isNotEmptyString('').isValid).toBe(false);
            expect(isNotEmptyString(' ').isValid).toBe(true);
        });

        it('should handle trim option', () => {
            expect(isNotEmptyString(' ', { trim: true }).isValid).toBe(false);
            expect(isNotEmptyString(' hello ', { trim: true }).isValid).toBe(true);
            expect(isNotEmptyString(' hello ').isValid).toBe(true);
        });

        it('should fail for non-string values', () => {
            expect(isNotEmptyString(123).isValid).toBe(false);
            expect(isNotEmptyString(null).isValid).toBe(false);
        });
    });

    describe('isNumber', () => {
        it('should validate number values', () => {
            expect(isNumber(123).isValid).toBe(true);
            expect(isNumber(0).isValid).toBe(true);
            expect(isNumber(-1).isValid).toBe(true);
            expect(isNumber(NaN).isValid).toBe(true); // NaN is still typeof number
            expect(isNumber(Infinity).isValid).toBe(true); // Infinity is still typeof number
            expect(isNumber('123').isValid).toBe(false);
        });
    });

    describe('isBoolean', () => {
        it('should validate boolean values', () => {
            expect(isBoolean(true).isValid).toBe(true);
            expect(isBoolean(false).isValid).toBe(true);
            expect(isBoolean(1).isValid).toBe(false);
            expect(isBoolean('true').isValid).toBe(false);
        });
    });

    describe('isDate', () => {
        it('should validate Date objects', () => {
            expect(isDate(new Date()).isValid).toBe(true);
            expect(isDate(new Date('2023-01-01')).isValid).toBe(true);
        });

        it('should reject invalid dates', () => {
            expect(isDate(new Date('invalid')).isValid).toBe(false);
            expect(isDate('2023-01-01').isValid).toBe(false);
        });

    });

    describe('isArray', () => {
        it('should validate arrays', () => {
            expect(isArray([]).isValid).toBe(true);
            expect(isArray([1, 2, 3]).isValid).toBe(true);
            expect(isArray({}).isValid).toBe(false);
            expect(isArray('[]').isValid).toBe(false);
        });
    });

    describe('isObject', () => {
        it('should validate objects', () => {
            expect(isObject({}).isValid).toBe(true);
            expect(isObject({ a: 1 }).isValid).toBe(true);
            expect(isObject([]).isValid).toBe(false); // Arrays are not considered objects here
            expect(isObject(null).isValid).toBe(false); // null is not considered an object here
        });
    });

    describe('isFunction', () => {
        it('should validate functions', () => {
            expect(isFunction(() => {}).isValid).toBe(true);
            expect(isFunction(function () {}).isValid).toBe(true);
            expect(isFunction({}).isValid).toBe(false);
        });
    });

    describe('isRegExp', () => {
        it('should validate regular expressions', () => {
            expect(isRegExp(/abc/).isValid).toBe(true);
            expect(isRegExp(new RegExp('abc')).isValid).toBe(true);
            expect(isRegExp('/abc/').isValid).toBe(false);
        });
    });

    describe('isSymbol', () => {
        it('should validate symbols', () => {
            expect(isSymbol(Symbol('test')).isValid).toBe(true);
            expect(isSymbol('symbol').isValid).toBe(false);
        });
    });

    describe('isBigInt', () => {
        it('should validate bigints', () => {
            expect(isBigInt(BigInt(123)).isValid).toBe(true);
            expect(isBigInt(BigInt('123')).isValid).toBe(true);
            expect(isBigInt(123).isValid).toBe(false);
        });
    });

    describe('isNull', () => {
        it('should validate null values', () => {
            expect(isNull(null).isValid).toBe(true);
            expect(isNull(undefined).isValid).toBe(false);
            expect(isNull(0).isValid).toBe(false);
        });
    });

    describe('isUndefined', () => {
        it('should validate undefined values', () => {
            expect(isUndefined(undefined).isValid).toBe(true);
            expect(isUndefined(null).isValid).toBe(false);
            expect(isUndefined(0).isValid).toBe(false);
        });
    });

    describe('isPrimitive', () => {
        it('should validate primitive values', () => {
            expect(isPrimitive('string').isValid).toBe(true);
            expect(isPrimitive(123).isValid).toBe(true);
            expect(isPrimitive(true).isValid).toBe(true);
            expect(isPrimitive(Symbol('test')).isValid).toBe(true);
            expect(isPrimitive(BigInt(123)).isValid).toBe(true);
            expect(isPrimitive(null).isValid).toBe(true);
            expect(isPrimitive(undefined).isValid).toBe(true);
            expect(isPrimitive({}).isValid).toBe(false);
            expect(isPrimitive([]).isValid).toBe(false);
        });
    });

    describe('isNil', () => {
        it('should validate null or undefined values', () => {
            expect(isNil(null).isValid).toBe(true);
            expect(isNil(undefined).isValid).toBe(true);
            expect(isNil(0).isValid).toBe(false);
            expect(isNil('').isValid).toBe(false);
        });
    });

    describe('isFiniteNumber', () => {
        it('should validate finite numbers', () => {
            expect(isFiniteNumber(123).isValid).toBe(true);
            expect(isFiniteNumber(-456).isValid).toBe(true);
            expect(isFiniteNumber(0).isValid).toBe(true);
            expect(isFiniteNumber(NaN).isValid).toBe(false);
            expect(isFiniteNumber(Infinity).isValid).toBe(false);
            expect(isFiniteNumber(-Infinity).isValid).toBe(false);
            expect(isFiniteNumber('123').isValid).toBe(false);
        });
    });

    describe('isInteger', () => {
        it('should validate integers', () => {
            expect(isInteger(123).isValid).toBe(true);
            expect(isInteger(-456).isValid).toBe(true);
            expect(isInteger(0).isValid).toBe(true);
            expect(isInteger(12.34).isValid).toBe(false);
            expect(isInteger('123').isValid).toBe(false);
        });
    });

    describe('isPositiveInteger', () => {
        it('should validate positive integers', () => {
            expect(isPositiveInteger(1).isValid).toBe(true);
            expect(isPositiveInteger(123).isValid).toBe(true);
            expect(isPositiveInteger(0).isValid).toBe(false);
            expect(isPositiveInteger(-1).isValid).toBe(false);
            expect(isPositiveInteger(12.34).isValid).toBe(false);
        });
    });

    describe('isNonNegativeInteger', () => {
        it('should validate non-negative integers', () => {
            expect(isNonNegativeInteger(0).isValid).toBe(true);
            expect(isNonNegativeInteger(123).isValid).toBe(true);
            expect(isNonNegativeInteger(-1).isValid).toBe(false);
            expect(isNonNegativeInteger(12.34).isValid).toBe(false);
        });
    });

    describe('isTruthy', () => {
        it('should validate truthy values', () => {
            expect(isTruthy(true).isValid).toBe(true);
            expect(isTruthy(1).isValid).toBe(true);
            expect(isTruthy('hello').isValid).toBe(true);
            expect(isTruthy([]).isValid).toBe(true);
            expect(isTruthy({}).isValid).toBe(true);
            expect(isTruthy(false).isValid).toBe(false);
            expect(isTruthy(0).isValid).toBe(false);
            expect(isTruthy('').isValid).toBe(false);
            expect(isTruthy(null).isValid).toBe(false);
            expect(isTruthy(undefined).isValid).toBe(false);
        });
    });

    describe('isFalsy', () => {
        it('should validate falsy values', () => {
            expect(isFalsy(false).isValid).toBe(true);
            expect(isFalsy(0).isValid).toBe(true);
            expect(isFalsy('').isValid).toBe(true);
            expect(isFalsy(null).isValid).toBe(true);
            expect(isFalsy(undefined).isValid).toBe(true);
            expect(isFalsy(true).isValid).toBe(false);
            expect(isFalsy(1).isValid).toBe(false);
            expect(isFalsy('hello').isValid).toBe(false);
        });
    });

    describe('isNaN', () => {
        it('should validate NaN values', () => {
            expect(isNaN(NaN).isValid).toBe(true);
            expect(isNaN(0 / 0).isValid).toBe(true);
            expect(isNaN(123).isValid).toBe(false);
            expect(isNaN('NaN').isValid).toBe(false); // String "NaN" is not the same as NaN value
        });
    });
});
