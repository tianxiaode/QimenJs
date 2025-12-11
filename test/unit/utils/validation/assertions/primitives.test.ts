// src/utils/validation/assertions/primitives.test.ts
import {
    assertString,
    assertNumber,
    assertBoolean,
    assertFunction,
    assertSymbol,
    assertBigInt,
    assertPrimitive,
    assertTruthy,
    assertFalsy,
    assertInteger,
    assertPositiveInteger,
    assertNonNegativeInteger,
    assertFiniteNumber,
    assertNaN,
    assertEqual,
    assertNotEqual,
    assertNil,
    assertNotNil,
    createAssertion,
    InvalidInputError,
} from '@orbitjs/utils';

describe('Validation Assertions', () => {
    // 通过createAssertion函数间接测试createErrorContext的行为
    describe('Error Context Generation', () => {
        it('should generate correct error context with paramName', () => {
            const assertTest = createAssertion(
                (value): value is number => typeof value === 'number' && value === 42,
                'must be 42'
            );
            
            expect(() => assertTest(41, 'myParam'))
                .toThrow(/Parameter 'myParam' must be 42/);
        });
        
        it('should generate correct error context without paramName', () => {
            const assertTest = createAssertion(
                (value): value is number => typeof value === 'number' && value === 42,
                'must be 42'
            );
            
            expect(() => assertTest(41))
                .toThrow(/Value must be 42/);
        });
        
        it('should include function name in error messages when provided', () => {
            const assertTest = createAssertion(
                (value): value is number => typeof value === 'number' && value === 42,
                'must be 42'
            );
            
            expect(() => assertTest(41, 'myParam', 'myFunction'))
                .toThrow(/Parameter 'myParam' must be 42 in myFunction/);
        });
        
        it('should generate correct error context with only functionName', () => {
            const assertTest = createAssertion(
                (value): value is number => typeof value === 'number' && value === 42,
                'must be 42'
            );
            
            expect(() => assertTest(41, undefined, 'myFunction'))
                .toThrow(/Value must be 42 in myFunction/);
        });
    });

    describe('assertString', () => {
        it('should pass for valid strings', () => {
            expect(() => assertString('hello')).not.toThrow();
        });

        it('should throw for non-strings', () => {
            expect(() => assertString(123)).toThrow(InvalidInputError);
            expect(() => assertString(null)).toThrow(InvalidInputError);
        });

        it('should validate non-empty strings', () => {
            expect(() => assertString('hello', { nonEmpty: true })).not.toThrow();
            expect(() => assertString('', { nonEmpty: true })).toThrow(InvalidInputError);
        });

        it('should validate string length', () => {
            expect(() => assertString('hi', { minLength: 2, maxLength: 5 })).not.toThrow();
            expect(() => assertString('h', { minLength: 2 })).toThrow(InvalidInputError);
            expect(() => assertString('hello world', { maxLength: 5 })).toThrow(InvalidInputError);
        });

        it('should validate allowed and disallowed values', () => {
            expect(() => assertString('a', { allowedValues: ['a', 'b'] })).not.toThrow();
            expect(() => assertString('c', { allowedValues: ['a', 'b'] })).toThrow(
                InvalidInputError
            );
            expect(() => assertString('a', { disallowedValues: ['a', 'b'] })).toThrow(
                InvalidInputError
            );
            expect(() => assertString('c', { disallowedValues: ['a', 'b'] })).not.toThrow();
        });

        it('should trim strings when trim option is enabled', () => {
            // 测试 trim 对 minLength 的影响
            expect(() => assertString('  hello  ', { trim: true, minLength: 5 })).not.toThrow();
            expect(() => assertString('  hi  ', { trim: true, minLength: 5 })).toThrow(
                InvalidInputError
            );

            // 测试 trim 对 maxLength 的影响
            expect(() => assertString('  hello  ', { trim: true, maxLength: 5 })).not.toThrow();
            expect(() => assertString('  hello world  ', { trim: true, maxLength: 5 })).toThrow(
                InvalidInputError
            );

            // 测试 trim 对 nonEmpty 的影响
            expect(() => assertString('  ', { trim: true, nonEmpty: true })).toThrow(
                InvalidInputError
            );
            expect(() => assertString('  hello  ', { trim: true, nonEmpty: true })).not.toThrow();

            // 测试 trim 对 allowedValues 的影响
            expect(() =>
                assertString('  hello  ', { trim: true, allowedValues: ['hello', 'world'] })
            ).not.toThrow();
            expect(() =>
                assertString('  test  ', { trim: true, allowedValues: ['hello', 'world'] })
            ).toThrow(InvalidInputError);

            // 测试 trim 对 disallowedValues 的影响
            expect(() =>
                assertString('  hello  ', { trim: true, disallowedValues: ['hello', 'world'] })
            ).toThrow(InvalidInputError);
            expect(() =>
                assertString('  test  ', { trim: true, disallowedValues: ['hello', 'world'] })
            ).not.toThrow();
        });

        it('should not trim strings when trim option is disabled or not specified', () => {
            // 默认情况下不应该修剪
            expect(() => assertString('  hello  ', { minLength: 7 })).not.toThrow();
            expect(() => assertString('  hello  ', { maxLength: 9 })).not.toThrow();

            // 明确设置为 false 时也不应该修剪
            expect(() => assertString('  hello  ', { trim: false, minLength: 7 })).not.toThrow();
        });
        
        // 测试错误消息格式
        it('should generate proper error messages with context', () => {
            // 测试带参数名的错误消息
            expect(() => assertString(123, { paramName: 'testParam' }))
                .toThrow(/Parameter 'testParam' must be a string/);
                
            // 测试带函数名的错误消息
            expect(() => assertString(123, { functionName: 'testFunction' }))
                .toThrow(/Value must be a string in testFunction/);
                
            // 测试同时带参数名和函数名的错误消息
            expect(() => assertString(123, { 
                paramName: 'testParam', 
                functionName: 'testFunction' 
            })).toThrow(/Parameter 'testParam' must be a string in testFunction/);
        });
    });

    describe('assertNumber', () => {
        it('should pass for valid numbers', () => {
            expect(() => assertNumber(42)).not.toThrow();
            expect(() => assertNumber(3.14)).not.toThrow();
        });

        it('should throw for non-numbers', () => {
            expect(() => assertNumber('123')).toThrow(InvalidInputError);
            expect(() => assertNumber(NaN)).toThrow(InvalidInputError);
            expect(() => assertNumber(Infinity)).toThrow(InvalidInputError);
        });

        it('should validate integer numbers', () => {
            expect(() => assertNumber(42, { integer: true })).not.toThrow();
            expect(() => assertNumber(3.14, { integer: true })).toThrow(InvalidInputError);
        });

        it('should validate positive numbers', () => {
            expect(() => assertNumber(5, { positive: true })).not.toThrow();
            expect(() => assertNumber(-5, { positive: true })).toThrow(InvalidInputError);
            expect(() => assertNumber(0, { positive: true })).toThrow(InvalidInputError);
        });

        it('should validate negative numbers', () => {
            expect(() => assertNumber(-5, { negative: true })).not.toThrow();
            expect(() => assertNumber(5, { negative: true })).toThrow(InvalidInputError);
            expect(() => assertNumber(0, { negative: true })).toThrow(InvalidInputError);
        });

        it('should validate non-negative numbers', () => {
            expect(() => assertNumber(0, { nonNegative: true })).not.toThrow();
            expect(() => assertNumber(5, { nonNegative: true })).not.toThrow();
            expect(() => assertNumber(-5, { nonNegative: true })).toThrow(InvalidInputError);
        });

        it('should validate min and max values', () => {
            expect(() => assertNumber(5, { min: 0, max: 10 })).not.toThrow();
            expect(() => assertNumber(-5, { min: 0 })).toThrow(InvalidInputError);
            expect(() => assertNumber(15, { max: 10 })).toThrow(InvalidInputError);
        });

        it('should validate allowed values', () => {
            expect(() => assertNumber(1, { allowedValues: [1, 2, 3] })).not.toThrow();
            expect(() => assertNumber(4, { allowedValues: [1, 2, 3] })).toThrow(InvalidInputError);
        });
        
        // 测试错误消息格式
        it('should generate proper error messages with context', () => {
            expect(() => assertNumber('not-a-number', { paramName: 'count' }))
                .toThrow(/Parameter 'count' must be a number/);
        });
    });

    describe('assertBoolean', () => {
        it('should pass for boolean values', () => {
            expect(() => assertBoolean(true)).not.toThrow();
            expect(() => assertBoolean(false)).not.toThrow();
        });

        it('should throw for non-boolean values', () => {
            expect(() => assertBoolean('true')).toThrow(InvalidInputError);
            expect(() => assertBoolean(1)).toThrow(InvalidInputError);
        });
        
        // 测试错误消息格式
        it('should generate proper error messages with context', () => {
            expect(() => assertBoolean('true', { paramName: 'flag' }))
                .toThrow(/Parameter 'flag' must be a boolean/);
        });
    });

    describe('assertFunction', () => {
        it('should pass for function values', () => {
            expect(() => assertFunction(() => {})).not.toThrow();
            expect(() => assertFunction(function test() {})).not.toThrow();
        });

        it('should throw for non-function values', () => {
            expect(() => assertFunction('function')).toThrow(InvalidInputError);
            expect(() => assertFunction({})).toThrow(InvalidInputError);
        });
    });

    describe('assertSymbol', () => {
        it('should pass for symbol values', () => {
            expect(() => assertSymbol(Symbol('test'))).not.toThrow();
            expect(() => assertSymbol(Symbol.iterator)).not.toThrow();
        });

        it('should throw for non-symbol values', () => {
            expect(() => assertSymbol('symbol')).toThrow(InvalidInputError);
            expect(() => assertSymbol({})).toThrow(InvalidInputError);
        });
    });

    describe('assertBigInt', () => {
        it('should pass for bigint values', () => {
            expect(() => assertBigInt(BigInt(42))).not.toThrow();
            expect(() => assertBigInt(BigInt(123))).not.toThrow();
        });

        it('should throw for non-bigint values', () => {
            expect(() => assertBigInt(42)).toThrow(InvalidInputError);
            expect(() => assertBigInt('42n')).toThrow(InvalidInputError);
        });
    });

    describe('assertPrimitive', () => {
        it('should pass for primitive values', () => {
            expect(() => assertPrimitive('string')).not.toThrow();
            expect(() => assertPrimitive(42)).not.toThrow();
            expect(() => assertPrimitive(true)).not.toThrow();
            expect(() => assertPrimitive(Symbol('test'))).not.toThrow();
            expect(() => assertPrimitive(BigInt(42))).not.toThrow();
            expect(() => assertPrimitive(undefined)).not.toThrow();
            expect(() => assertPrimitive(null)).not.toThrow();
        });

        it('should throw for non-primitive values', () => {
            expect(() => assertPrimitive({})).toThrow(InvalidInputError);
            expect(() => assertPrimitive([])).toThrow(InvalidInputError);
        });
    });

    describe('assertTruthy', () => {
        it('should pass for truthy values', () => {
            expect(() => assertTruthy('hello')).not.toThrow();
            expect(() => assertTruthy(42)).not.toThrow();
            expect(() => assertTruthy(true)).not.toThrow();
            expect(() => assertTruthy({})).not.toThrow();
        });

        it('should throw for falsy values', () => {
            expect(() => assertTruthy(false)).toThrow(InvalidInputError);
            expect(() => assertTruthy(0)).toThrow(InvalidInputError);
            expect(() => assertTruthy('')).toThrow(InvalidInputError);
            expect(() => assertTruthy(null)).toThrow(InvalidInputError);
        });
    });

    describe('assertFalsy', () => {
        it('should pass for falsy values', () => {
            expect(() => assertFalsy(false)).not.toThrow();
            expect(() => assertFalsy(0)).not.toThrow();
            expect(() => assertFalsy('')).not.toThrow();
            expect(() => assertFalsy(null)).not.toThrow();
            expect(() => assertFalsy(undefined)).not.toThrow();
        });

        it('should throw for truthy values', () => {
            expect(() => assertFalsy('hello')).toThrow(InvalidInputError);
            expect(() => assertFalsy(42)).toThrow(InvalidInputError);
            expect(() => assertFalsy(true)).toThrow(InvalidInputError);
            expect(() => assertFalsy({})).toThrow(InvalidInputError);
        });
    });

    describe('assertInteger', () => {
        it('should pass for integer values', () => {
            expect(() => assertInteger(42)).not.toThrow();
            expect(() => assertInteger(-5)).not.toThrow();
        });

        it('should throw for non-integer values', () => {
            expect(() => assertInteger(3.14)).toThrow(InvalidInputError);
            expect(() => assertInteger('42')).toThrow(InvalidInputError);
        });

        it('should validate positive integers', () => {
            expect(() => assertInteger(5, { positive: true })).not.toThrow();
            expect(() => assertInteger(-5, { positive: true })).toThrow(InvalidInputError);
            expect(() => assertInteger(0, { positive: true })).toThrow(InvalidInputError);
        });

        it('should validate negative integers', () => {
            expect(() => assertInteger(-5, { negative: true })).not.toThrow();
            expect(() => assertInteger(5, { negative: true })).toThrow(InvalidInputError);
            expect(() => assertInteger(0, { negative: true })).toThrow(InvalidInputError);
        });

        it('should validate non-negative integers', () => {
            expect(() => assertInteger(0, { nonNegative: true })).not.toThrow();
            expect(() => assertInteger(5, { nonNegative: true })).not.toThrow();
            expect(() => assertInteger(-5, { nonNegative: true })).toThrow(InvalidInputError);
        });

        it('should validate min and max values', () => {
            expect(() => assertInteger(5, { min: 0, max: 10 })).not.toThrow();
            expect(() => assertInteger(-5, { min: 0 })).toThrow(InvalidInputError);
            expect(() => assertInteger(15, { max: 10 })).toThrow(InvalidInputError);
        });
    });

    describe('assertPositiveInteger', () => {
        it('should pass for positive integers', () => {
            expect(() => assertPositiveInteger(42)).not.toThrow();
            expect(() => assertPositiveInteger(1)).not.toThrow();
        });

        it('should throw for non-positive integers', () => {
            expect(() => assertPositiveInteger(0)).toThrow(InvalidInputError);
            expect(() => assertPositiveInteger(-5)).toThrow(InvalidInputError);
            expect(() => assertPositiveInteger(3.14)).toThrow(InvalidInputError);
        });

        it('should validate min value correctly for positive integers', () => {
            // 测试一个符合正整数要求但小于指定min值的情况
            expect(() => assertPositiveInteger(2, { min: 5 })).toThrow(InvalidInputError);
            // 测试一个符合正整数要求且大于等于指定min值的情况
            expect(() => assertPositiveInteger(5, { min: 2 })).not.toThrow();
            expect(() => assertPositiveInteger(2, { min: 2 })).not.toThrow();
        });

        it('should validate max value correctly for positive integers', () => {
            // 测试一个符合正整数要求但大于指定max值的情况
            expect(() => assertPositiveInteger(10, { max: 5 })).toThrow(InvalidInputError);
            // 测试一个符合正整数要求且小于等于指定max值的情况
            expect(() => assertPositiveInteger(5, { max: 10 })).not.toThrow();
            expect(() => assertPositiveInteger(5, { max: 5 })).not.toThrow();
        });
    });

    describe('assertNonNegativeInteger', () => {
        it('should pass for non-negative integers', () => {
            expect(() => assertNonNegativeInteger(42)).not.toThrow();
            expect(() => assertNonNegativeInteger(0)).not.toThrow();
        });

        it('should throw for negative integers', () => {
            expect(() => assertNonNegativeInteger(-1)).toThrow(InvalidInputError);
            expect(() => assertNonNegativeInteger(3.14)).toThrow(InvalidInputError);
        });

        it('should validate min value correctly for non-negative integers', () => {
            expect(() => assertNonNegativeInteger(5, { min: 3 })).not.toThrow();
            expect(() => assertNonNegativeInteger(2, { min: 3 })).toThrow(InvalidInputError);
            expect(() => assertNonNegativeInteger(0, { min: 0 })).not.toThrow();
        });

        it('should validate max value correctly for non-negative integers', () => {
            // 测试一个符合非负整数要求但大于指定max值的情况
            expect(() => assertNonNegativeInteger(10, { max: 5 })).toThrow(InvalidInputError);
            // 测试一个符合非负整数要求且小于等于指定max值的情况
            expect(() => assertNonNegativeInteger(5, { max: 10 })).not.toThrow();
            expect(() => assertNonNegativeInteger(5, { max: 5 })).not.toThrow();
            expect(() => assertNonNegativeInteger(0, { max: 0 })).not.toThrow();
        });

        it('should validate min and max values', () => {
            expect(() => assertNonNegativeInteger(5, { min: 0, max: 10 })).not.toThrow();
            expect(() => assertNonNegativeInteger(-1, { min: 0 })).toThrow(InvalidInputError);
            expect(() => assertNonNegativeInteger(15, { max: 10 })).toThrow(InvalidInputError);
        });
    });

    describe('assertFiniteNumber', () => {
        it('should pass for finite numbers', () => {
            expect(() => assertFiniteNumber(42)).not.toThrow();
            expect(() => assertFiniteNumber(3.14)).not.toThrow();
            expect(() => assertFiniteNumber(0)).not.toThrow();
        });

        it('should throw for non-finite numbers', () => {
            expect(() => assertFiniteNumber(Infinity)).toThrow(InvalidInputError);
            expect(() => assertFiniteNumber(-Infinity)).toThrow(InvalidInputError);
            expect(() => assertFiniteNumber(NaN)).toThrow(InvalidInputError);
        });

        it('should validate min and max values', () => {
            expect(() => assertFiniteNumber(5, { min: 0, max: 10 })).not.toThrow();
            expect(() => assertFiniteNumber(-5, { min: 0 })).toThrow(InvalidInputError);
            expect(() => assertFiniteNumber(15, { max: 10 })).toThrow(InvalidInputError);
        });
    });

    describe('assertNaN', () => {
        it('should pass for NaN values', () => {
            expect(() => assertNaN(NaN)).not.toThrow();
        });

        it('should throw for non-NaN values', () => {
            expect(() => assertNaN(42)).toThrow(InvalidInputError);
            expect(() => assertNaN(Infinity)).toThrow(InvalidInputError);
        });
    });

    describe('assertEqual', () => {
        it('should pass for equal values', () => {
            expect(() => assertEqual(42, 42)).not.toThrow();
            expect(() => assertEqual('hello', 'hello')).not.toThrow();
        });

        it('should throw for non-equal values', () => {
            expect(() => assertEqual(42, 43)).toThrow(InvalidInputError);
            expect(() => assertEqual('hello', 'world')).toThrow(InvalidInputError);
        });
    });

    describe('assertNotEqual', () => {
        it('should pass for non-equal values', () => {
            expect(() => assertNotEqual(42, 43)).not.toThrow();
            expect(() => assertNotEqual('hello', 'world')).not.toThrow();
        });

        it('should throw for equal values', () => {
            expect(() => assertNotEqual(42, 42)).toThrow(InvalidInputError);
            expect(() => assertNotEqual('hello', 'hello')).toThrow(InvalidInputError);
        });
    });

    describe('assertNil', () => {
        it('should pass for null or undefined values', () => {
            expect(() => assertNil(null)).not.toThrow();
            expect(() => assertNil(undefined)).not.toThrow();
        });

        it('should throw for non-nil values', () => {
            expect(() => assertNil(42)).toThrow(InvalidInputError);
            expect(() => assertNil('')).toThrow(InvalidInputError);
            expect(() => assertNil(false)).toThrow(InvalidInputError);
        });
    });

    describe('assertNotNil', () => {
        it('should pass for non-nil values', () => {
            expect(() => assertNotNil(42)).not.toThrow();
            expect(() => assertNotNil('hello')).not.toThrow();
            expect(() => assertNotNil({})).not.toThrow();
        });

        it('should throw for nil values', () => {
            expect(() => assertNotNil(null)).toThrow(InvalidInputError);
            expect(() => assertNotNil(undefined)).toThrow(InvalidInputError);
        });
    });

    describe('createAssertion', () => {
        it('should create a custom assertion function', () => {
            const assertEven = createAssertion(
                (value): value is number => typeof value === 'number' && value % 2 === 0,
                'must be an even number'
            );

            expect(() => assertEven(4)).not.toThrow();
            expect(() => assertEven(3)).toThrow(InvalidInputError);
        });

        it('should support custom error messages', () => {
            const assertEven = createAssertion(
                (value): value is number => typeof value === 'number' && value % 2 === 0,
                (value, paramName) => `Parameter '${paramName}' with value ${value} must be even`
            );

            expect(() => assertEven(3, 'num')).toThrow(/Parameter 'num' with value 3 must be even/);
        });
        
        it('should generate proper error messages using createErrorContext', () => {
            const assertTest = createAssertion(
                (value): value is number => typeof value === 'number' && value === 42,
                'must be 42'
            );
            
            // 测试各种错误消息格式
            expect(() => assertTest(41, 'myParam'))
                .toThrow(/Parameter 'myParam' must be 42/);
                
            expect(() => assertTest(41))
                .toThrow(/Value must be 42/);
                
            expect(() => assertTest(41, 'myParam', 'myFunction'))
                .toThrow(/Parameter 'myParam' must be 42 in myFunction/);
        });
    });
});