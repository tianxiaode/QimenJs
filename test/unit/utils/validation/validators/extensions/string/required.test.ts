import { validateRequiredString, ValidationErrorCode } from '@/utils';

describe('validateRequiredString', () => {
    it('should return null when value is a non-empty string', () => {
        const result = validateRequiredString('hello', {});
        expect(result).toBeNull();
    });

    it('should return null when value is an empty string', () => {
        const result = validateRequiredString('', {});
        expect(result).toBeNull();
    });

    it('should return error when value is undefined', () => {
        const result = validateRequiredString(undefined, {});
        expect(result).not.toBeNull();
        expect(result![0].code).toBe(ValidationErrorCode.REQUIRED);
    });

    it('should return error when value is null', () => {
        const result = validateRequiredString(null, {});
        expect(result).not.toBeNull();
        expect(result![0].code).toBe(ValidationErrorCode.INVALID_VALUE);
    });

    it('should return error when value is not a string', () => {
        const result = validateRequiredString(123, {});
        expect(result).not.toBeNull();
        expect(result![0].code).toBe(ValidationErrorCode.TYPE_MISMATCH);
    });

    it('should allow string with length constraints', () => {
        const result = validateRequiredString('test', { minLength: 3, maxLength: 10 });
        expect(result).toBeNull();
    });

    it('should return error when length constraints are not met', () => {
        const result = validateRequiredString('hi', { minLength: 5 });
        expect(result).not.toBeNull();
        expect(result![0].code).toBe(ValidationErrorCode.TOO_SMALL);
    });

    it('should validate pattern when provided', () => {
        const result = validateRequiredString('hello123', { pattern: /^[a-z\d]+$/ });
        expect(result).toBeNull();
    });

    it('should return error when pattern does not match', () => {
        const result = validateRequiredString('hello 123', { pattern: /^[a-z\d]+$/ });
        expect(result).not.toBeNull();
        expect(result![0].code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
    });

    it('should work with context propagation', () => {
        const context = { field: 'username', label: 'Username' };
        const result = validateRequiredString(null, {}, context);
        expect(result).not.toBeNull();
        // 从返回的上下文中安全地删除 expected 属性
        const resultContext = result![0].context;
        const { expected, ...returnedContext } = resultContext as any;
        expect(returnedContext).toEqual(context);
    });
});