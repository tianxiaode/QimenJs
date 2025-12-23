import { checkStringLength } from '@/utils/validation/validators/core/string/length';
import { ValidationErrorContext, StringRuleOptions, ValidationErrorCode } from '@/utils';

describe('checkStringLength', () => {
    describe('exactLength validation', () => {
        it('should return null when string length matches exactLength', () => {
            const rule: StringRuleOptions = { exactLength: 5 };
            const result = checkStringLength('hello', rule);
            expect(result).toBeNull();
        });

        it('should return OUT_OF_RANGE error when string length does not match exactLength', () => {
            const rule: StringRuleOptions = { exactLength: 5 };
            const result = checkStringLength('hi', rule); // 'hi' 长度为2，不是5
            expect(result).not.toBeNull();
            expect(result?.code).toBe(ValidationErrorCode.OUT_OF_RANGE);
            expect(result?.params?.min).toBe(5); // 期望长度下限
            expect(result?.params?.max).toBe(5); // 期望长度上限
            expect(result?.params?.value).toBe(2); // 实际长度
        });

        it('should prioritize exactLength over minLength and maxLength', () => {
            const rule: StringRuleOptions = {
                exactLength: 5,
                minLength: 3,
                maxLength: 10,
            };
            const result = checkStringLength('hello world', rule); // 长度为11，不是5
            expect(result?.code).toBe(ValidationErrorCode.OUT_OF_RANGE);
            expect(result?.params?.min).toBe(5);
            expect(result?.params?.max).toBe(5);
            expect(result?.params?.value).toBe(11);
        });
    });

    describe('minLength validation', () => {
        it('should return null when string length is greater than or equal to minLength', () => {
            const rule: StringRuleOptions = { minLength: 3 };
            const result = checkStringLength('hello', rule);
            expect(result).toBeNull();
        });

        it('should return error when string length is less than minLength', () => {
            const rule: StringRuleOptions = { minLength: 5 };
            const result = checkStringLength('hi', rule);
            expect(result).not.toBeNull();
            expect(result?.code).toBe(ValidationErrorCode.TOO_SMALL);
            expect(result?.params?.min).toBe(5);
        });
    });

    describe('maxLength validation', () => {
        it('should return null when string length is less than or equal to maxLength', () => {
            const rule: StringRuleOptions = { maxLength: 10 };
            const result = checkStringLength('hello', rule);
            expect(result).toBeNull();
        });

        it('should return error when string length is greater than maxLength', () => {
            const rule: StringRuleOptions = { maxLength: 3 };
            const result = checkStringLength('hello world', rule);
            expect(result).not.toBeNull();
            expect(result?.code).toBe(ValidationErrorCode.TOO_LARGE);
            expect(result?.params?.max).toBe(3);
        });
    });

    describe('with context', () => {
        it('should include context in error result', () => {
            const rule: StringRuleOptions = { minLength: 5 };
            const context: ValidationErrorContext = {
                field: 'username',
                value: 'hi',
            };
            const result = checkStringLength('hi', rule, context);
            expect(result?.context).toEqual(context);
        });
    });

    describe('empty string handling', () => {
        it('should validate empty string against minLength', () => {
            const rule: StringRuleOptions = { minLength: 1 };
            const result = checkStringLength('', rule);
            expect(result?.code).toBe(ValidationErrorCode.TOO_SMALL);
        });

        it('should validate empty string against exactLength', () => {
            const rule: StringRuleOptions = { exactLength: 0 };
            const result = checkStringLength('', rule);
            expect(result).toBeNull();
        });
    });

    describe('multiple constraints', () => {
        it('should validate when all constraints are satisfied', () => {
            const rule: StringRuleOptions = {
                minLength: 3,
                maxLength: 10,
            };
            const result = checkStringLength('hello', rule);
            expect(result).toBeNull();
        });

        it('should return error for minLength when both constraints fail', () => {
            const rule: StringRuleOptions = {
                minLength: 5,
                maxLength: 3,
            };
            const result = checkStringLength('hi', rule);
            expect(result?.code).toBe(ValidationErrorCode.TOO_SMALL);
        });

        it('should return error for maxLength when both constraints fail', () => {
            const rule: StringRuleOptions = {
                minLength: 2,
                maxLength: 3,
            };
            const result = checkStringLength('hello world', rule);
            expect(result?.code).toBe(ValidationErrorCode.TOO_LARGE);
        });
    });
});
