import { checkStringPattern } from '@/utils/validation/validators/core/string/pattern';
import { ValidationErrorCode, ValidationErrorContext } from '@/utils';

describe('checkStringPattern', () => {
    // 测试基本功能：匹配模式
    test('should return null when string matches the pattern', () => {
        const value = 'hello123';
        const rule = { pattern: /^\w+$/ };
        const result = checkStringPattern(value, rule);

        expect(result).toBeNull();
    });

    // 测试基本功能：不匹配模式
    test('should return pattern mismatch error when string does not match the pattern', () => {
        const value = 'hello world!';
        const rule = { pattern: /^\w+$/ };
        const result = checkStringPattern(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
        expect(result!.params).toEqual({
            pattern: '^\\w+$',
            value: 'hello world!',
        });
    });

    // 测试边界情况：没有定义 pattern
    test('should return null when no pattern is defined in rule', () => {
        const value = 'any string';
        const rule = {};
        const result = checkStringPattern(value, rule as any);

        expect(result).toBeNull();
    });

    // 测试空字符串
    test('should handle empty string correctly', () => {
        const value = '';
        const rule = { pattern: /^$/ };
        const result = checkStringPattern(value, rule);

        expect(result).toBeNull();
    });

    // 测试空字符串不匹配的情况
    test('should return error when empty string does not match pattern', () => {
        const value = '';
        const rule = { pattern: /^\d+$/ };
        const result = checkStringPattern(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
    });

    // 测试复杂正则表达式
    test('should work with complex regex patterns', () => {
        const value = 'test@example.com';
        const rule = { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };
        const result = checkStringPattern(value, rule);

        expect(result).toBeNull();
    });

    // 测试复杂正则表达式不匹配
    test('should return error with complex regex patterns when not matching', () => {
        const value = 'not-an-email';
        const rule = { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };
        const result = checkStringPattern(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
    });

    // 测试带有标志的正则表达式
    test('should handle regex with flags', () => {
        const value = 'Hello World';
        const rule = { pattern: /^[a-z\s]+$/i }; // i flag for case-insensitive
        const result = checkStringPattern(value, rule);

        expect(result).toBeNull();
    });

    // 测试带有上下文信息
    test('should include context in error when provided', () => {
        const value = 'invalid@email';
        const rule = { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };
        const context: ValidationErrorContext = { field: 'email', label: 'Email Address' };
        const result = checkStringPattern(value, rule, context);

        expect(result).not.toBeNull();
        expect(result!.context).toEqual(context);
    });

    // 测试包含特殊字符的模式
    test('should handle patterns with special characters', () => {
        const value = 'Price: $19.99';
        const rule = { pattern: /^Price: \$\d+\.\d{2}$/ };
        const result = checkStringPattern(value, rule);

        expect(result).toBeNull();
    });

    // 测试包含特殊字符的模式不匹配
    test('should return error for special character patterns when not matching', () => {
        const value = 'Price: 19.99';
        const rule = { pattern: /^Price: \$\d+\.\d{2}$/ };
        const result = checkStringPattern(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
    });

    // 测试数字字符串验证
    test('should validate numeric strings', () => {
        const value = '12345';
        const rule = { pattern: /^\d+$/ };
        const result = checkStringPattern(value, rule);

        expect(result).toBeNull();
    });

    // 测试数字字符串验证失败
    test('should return error for non-numeric strings when expecting numeric', () => {
        const value = '123abc';
        const rule = { pattern: /^\d+$/ };
        const result = checkStringPattern(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
    });
});
