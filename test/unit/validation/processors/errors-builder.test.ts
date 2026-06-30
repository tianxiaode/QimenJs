/**
 * ValidationErrorBuilder 单元测试
 */

import { ValidationErrorBuilder } from '@/validation/errors/builder';
import { ValidationErrorCode } from '@/validation/errors/codes';

describe('ValidationErrorBuilder', () => {
    describe('createError', () => {
        it('should create error with code', () => {
            const error = ValidationErrorBuilder.createError(ValidationErrorCode.REQUIRED);
            expect(error.code).toBe(ValidationErrorCode.REQUIRED);
        });

        it('should create error with params', () => {
            const error = ValidationErrorBuilder.createError(ValidationErrorCode.TYPE_MISMATCH, {
                params: { expectedType: 'string', actualType: 'number' },
            });
            expect(error.params!.expectedType).toBe('string');
            expect(error.params!.actualType).toBe('number');
        });
    });

    describe('required', () => {
        it('should create required error', () => {
            const error = ValidationErrorBuilder.required();
            expect(error.code).toBe(ValidationErrorCode.REQUIRED);
        });
    });

    describe('type_mismatch', () => {
        it('should create type mismatch error', () => {
            const error = ValidationErrorBuilder.type_mismatch('string', 'number');
            expect(error.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(error.params!.expectedType).toBe('string');
            expect(error.params!.actualType).toBe('number');
        });
    });

    describe('invalid_value', () => {
        it('should create invalid value error', () => {
            const error = ValidationErrorBuilder.invalid_value(42);
            expect(error.code).toBe(ValidationErrorCode.INVALID_VALUE);
            expect(error.params!.value).toBe(42);
        });
    });

    describe('too_small', () => {
        it('should create too small error', () => {
            const error = ValidationErrorBuilder.too_small(5, 3);
            expect(error.code).toBe(ValidationErrorCode.TOO_SMALL);
            expect(error.params!.min).toBe(5);
            expect(error.params!.exclusive).toBe(false);
        });

        it('should support exclusive mode', () => {
            const error = ValidationErrorBuilder.too_small(5, 5, true);
            expect(error.params!.exclusive).toBe(true);
        });
    });

    describe('too_large', () => {
        it('should create too large error', () => {
            const error = ValidationErrorBuilder.too_large(10, 15);
            expect(error.code).toBe(ValidationErrorCode.TOO_LARGE);
            expect(error.params!.max).toBe(10);
        });
    });

    describe('out_of_range', () => {
        it('should create out of range error', () => {
            const error = ValidationErrorBuilder.out_of_range(1, 10, 15);
            expect(error.code).toBe(ValidationErrorCode.OUT_OF_RANGE);
            expect(error.params!.min).toBe(1);
            expect(error.params!.max).toBe(10);
        });
    });

    describe('invalid_format', () => {
        it('should create invalid format error', () => {
            const error = ValidationErrorBuilder.invalid_format('email', 'not-email', 'email');
            expect(error.code).toBe(ValidationErrorCode.INVALID_FORMAT);
        });
    });

    describe('pattern_mismatch', () => {
        it('should create pattern mismatch error with string pattern', () => {
            const error = ValidationErrorBuilder.pattern_mismatch('^[a-z]+$', '123');
            expect(error.code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
            expect(error.params!.pattern).toBe('^[a-z]+$');
        });

        it('should create pattern mismatch error with RegExp', () => {
            const error = ValidationErrorBuilder.pattern_mismatch(/^[a-z]+$/, '123');
            expect(error.code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
            expect(error.params!.pattern).toBe('/^[a-z]+$/');
        });
    });

    describe('not_allowed', () => {
        it('should create not allowed error', () => {
            const error = ValidationErrorBuilder.not_allowed('red', ['blue', 'green']);
            expect(error.code).toBe(ValidationErrorCode.NOT_ALLOWED);
            expect(error.params!.value).toBe('red');
            expect(error.params!.allowedValues).toEqual(['blue', 'green']);
        });
    });

    describe('missing_field', () => {
        it('should create missing field error', () => {
            const error = ValidationErrorBuilder.missing_field('name');
            expect(error.code).toBe(ValidationErrorCode.MISSING_FIELD);
            expect(error.params!.field).toBe('name');
        });
    });

    describe('duplicate', () => {
        it('should create duplicate error', () => {
            const error = ValidationErrorBuilder.duplicate('array', 1);
            expect(error.code).toBe(ValidationErrorCode.DUPLICATE);
        });
    });

    describe('condition_failed', () => {
        it('should create condition failed error', () => {
            const error = ValidationErrorBuilder.condition_failed('age', 'positive', -1);
            expect(error.code).toBe(ValidationErrorCode.CONDITION_FAILED);
        });
    });

    describe('custom', () => {
        it('should create custom error', () => {
            const error = ValidationErrorBuilder.custom('CUSTOM_001', 'Custom error message');
            expect(error.code).toBe(ValidationErrorCode.CUSTOM);
            expect(error.params!.customCode).toBe('CUSTOM_001');
            expect(error.params!.message).toBe('Custom error message');
        });
    });

    describe('password errors', () => {
        it('should create password_too_short error', () => {
            const error = ValidationErrorBuilder.password_too_short(8, 5);
            expect(error.code).toBe(ValidationErrorCode.PASSWORD_TOO_SHORT);
            expect(error.params!.minLength).toBe(8);
            expect(error.params!.actualLength).toBe(5);
        });

        it('should create password_missing_uppercase error', () => {
            const error = ValidationErrorBuilder.password_missing_uppercase();
            expect(error.code).toBe(ValidationErrorCode.PASSWORD_MISSING_UPPERCASE);
        });

        it('should create password_missing_lowercase error', () => {
            const error = ValidationErrorBuilder.password_missing_lowercase();
            expect(error.code).toBe(ValidationErrorCode.PASSWORD_MISSING_LOWERCASE);
        });

        it('should create password_missing_digit error', () => {
            const error = ValidationErrorBuilder.password_missing_digit();
            expect(error.code).toBe(ValidationErrorCode.PASSWORD_MISSING_DIGIT);
        });

        it('should create password_missing_special error', () => {
            const error = ValidationErrorBuilder.password_missing_special();
            expect(error.code).toBe(ValidationErrorCode.PASSWORD_MISSING_SPECIAL);
        });
    });

    describe('throwIfAny', () => {
        it('should not throw when no errors', () => {
            expect(() => {
                ValidationErrorBuilder.throwIfAny('test', {}, [], {});
            }).not.toThrow();
        });

        it('should throw when there are errors', () => {
            const errors = [ValidationErrorBuilder.required()];
            expect(() => {
                ValidationErrorBuilder.throwIfAny('test', {}, errors, {});
            }).toThrow();
        });
    });
});
