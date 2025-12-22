import {
    ValidationErrorBuilder,    
    ValidationErrorCode,
    ValidationRuleError,
} from '@/utils/validation';

describe('ValidationErrorBuilder', () => {
    const mockContext = { path: 'test.field' };

    describe('required', () => {
        it('should create a required validation error', () => {
            const error = ValidationErrorBuilder.required(mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.REQUIRED,
                params: {},
                context: mockContext,
            });
        });
    });

    describe('type_mismatch', () => {
        it('should create a type mismatch validation error', () => {
            const error = ValidationErrorBuilder.type_mismatch('string', 'number', mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.TYPE_MISMATCH,
                params: {
                    expectedType: 'string',
                    actualType: 'number',
                },
                context: mockContext,
            });
        });
    });

    describe('invalid_value', () => {
        it('should create an invalid value validation error', () => {
            const error = ValidationErrorBuilder.invalid_value(null, mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.INVALID_VALUE,
                params: {
                    value: null,
                },
                context: mockContext,
            });
        });
    });

    describe('too_small', () => {
        it('should create a too small validation error with default exclusive flag', () => {
            const error = ValidationErrorBuilder.too_small(5, 3, undefined, mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.TOO_SMALL,
                params: {
                    min: 5,
                    value: 3,
                    exclusive: false,
                },
                context: mockContext,
            });
        });

        it('should create a too small validation error with exclusive flag set to true', () => {
            const error = ValidationErrorBuilder.too_small(5, 3, true, mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.TOO_SMALL,
                params: {
                    min: 5,
                    value: 3,
                    exclusive: true,
                },
                context: mockContext,
            });
        });
    });

    describe('too_large', () => {
        it('should create a too large validation error with default exclusive flag', () => {
            const error = ValidationErrorBuilder.too_large(10, 15, undefined, mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.TOO_LARGE,
                params: {
                    max: 10,
                    value: 15,
                    exclusive: false,
                },
                context: mockContext,
            });
        });

        it('should create a too large validation error with exclusive flag set to true', () => {
            const error = ValidationErrorBuilder.too_large(10, 15, true, mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.TOO_LARGE,
                params: {
                    max: 10,
                    value: 15,
                    exclusive: true,
                },
                context: mockContext,
            });
        });
    });

    describe('out_of_range', () => {
        it('should create an out of range validation error', () => {
            const error = ValidationErrorBuilder.out_of_range(1, 10, 15, mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.OUT_OF_RANGE,
                params: {
                    min: 1,
                    max: 10,
                    value: 15,
                },
                context: mockContext,
            });
        });
    });

    describe('invalid_format', () => {
        it('should create an invalid format validation error', () => {
            const error = ValidationErrorBuilder.invalid_format(
                'email',
                'invalid-email',
                'email',
                mockContext
            );

            expect(error).toEqual({
                code: ValidationErrorCode.INVALID_FORMAT,
                params: {
                    field: 'email',
                    value: 'invalid-email',
                    format: 'email',
                },
                context: mockContext,
            });
        });
    });

    describe('pattern_mismatch', () => {
        it('should create a pattern mismatch validation error with string pattern', () => {
            const error = ValidationErrorBuilder.pattern_mismatch('[a-z]+', '123', mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.PATTERN_MISMATCH,
                params: {
                    pattern: '[a-z]+',
                    value: '123',
                },
                context: mockContext,
            });
        });

        it('should create a pattern mismatch validation error with RegExp pattern', () => {
            const error = ValidationErrorBuilder.pattern_mismatch(/[a-z]+/, '123', mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.PATTERN_MISMATCH,
                params: {
                    pattern: '/[a-z]+/',
                    value: '123',
                },
                context: mockContext,
            });
        });
    });

    describe('not_allowed', () => {
        it('should create a not allowed validation error', () => {
            const allowedValues = ['red', 'green', 'blue'];
            const error = ValidationErrorBuilder.not_allowed('yellow', allowedValues, mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.NOT_ALLOWED,
                params: {
                    value: 'yellow',
                    allowedValues,
                },
                context: mockContext,
            });
        });
    });

    describe('missing_field', () => {
        it('should create a missing field validation error', () => {
            const error = ValidationErrorBuilder.missing_field('username', mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.MISSING_FIELD,
                params: {
                    field: 'username',
                },
                context: mockContext,
            });
        });
    });

    describe('duplicate', () => {
        it('should create a duplicate validation error', () => {
            const error = ValidationErrorBuilder.duplicate(
                'email',
                'test@example.com',
                mockContext
            );

            expect(error).toEqual({
                code: ValidationErrorCode.DUPLICATE,
                params: {
                    field: 'email',
                    value: 'test@example.com',
                },
                context: mockContext,
            });
        });
    });

    describe('condition_failed', () => {
        it('should create a condition failed validation error', () => {
            const error = ValidationErrorBuilder.condition_failed(
                'age',
                'must be >= 18',
                15,
                mockContext
            );

            expect(error).toEqual({
                code: ValidationErrorCode.CONDITION_FAILED,
                params: {
                    field: 'age',
                    condition: 'must be >= 18',
                    value: 15,
                },
                context: mockContext,
            });
        });
    });

    describe('custom', () => {
        it('should create a custom validation error', () => {
            const error = ValidationErrorBuilder.custom(
                'CUSTOM_CODE',
                'Custom error message',
                mockContext
            );

            expect(error).toEqual({
                code: ValidationErrorCode.CUSTOM,
                params: {
                    customCode: 'CUSTOM_CODE',
                    message: 'Custom error message',
                },
                context: mockContext,
            });
        });
    });

    describe('password related errors', () => {
        it('should create a password too short validation error', () => {
            const error = ValidationErrorBuilder.password_too_short(8, 5, mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.PASSWORD_TOO_SHORT,
                params: {
                    minLength: 8,
                    actualLength: 5,
                },
                context: mockContext,
            });
        });

        it('should create a password missing uppercase validation error', () => {
            const error = ValidationErrorBuilder.password_missing_uppercase(mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.PASSWORD_MISSING_UPPERCASE,
                params: {},
                context: mockContext,
            });
        });

        it('should create a password missing lowercase validation error', () => {
            const error = ValidationErrorBuilder.password_missing_lowercase(mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.PASSWORD_MISSING_LOWERCASE,
                params: {},
                context: mockContext,
            });
        });

        it('should create a password missing digit validation error', () => {
            const error = ValidationErrorBuilder.password_missing_digit(mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.PASSWORD_MISSING_DIGIT,
                params: {},
                context: mockContext,
            });
        });

        it('should create a password missing special character validation error', () => {
            const error = ValidationErrorBuilder.password_missing_special(mockContext);

            expect(error).toEqual({
                code: ValidationErrorCode.PASSWORD_MISSING_SPECIAL,
                params: {},
                context: mockContext,
            });
        });
    });

    describe('throwIfAny', () => {
        it('should throw ValidationError when errors array is not empty', () => {
            const errors: ValidationRuleError[] = [ValidationErrorBuilder.required()];

            expect(() => {
                ValidationErrorBuilder.throwIfAny('test-value', 'test-rule', errors);
            }).toThrow();
        });

        it('should not throw when errors array is empty', () => {
            const errors: ValidationRuleError[] = [];

            expect(() => {
                ValidationErrorBuilder.throwIfAny('test-value', 'test-rule', errors);
            }).not.toThrow();
        });
    });
});

describe('ValidationErrorBuilder.normalizeResult', () => {
    it('should return null for falsy values', () => {
        expect(ValidationErrorBuilder.normalizeResult(null)).toBeNull();
        expect(ValidationErrorBuilder.normalizeResult(undefined as any)).toBeNull();
    });

    it('should return array as is', () => {
        const errors: ValidationRuleError[] = [
            ValidationErrorBuilder.required(),
            ValidationErrorBuilder.invalid_value(null),
        ];

        expect(ValidationErrorBuilder.normalizeResult(errors)).toBe(errors);
    });

    it('should wrap single error in array', () => {
        const error = ValidationErrorBuilder.required();
        const result = ValidationErrorBuilder.normalizeResult(error);

        expect(Array.isArray(result)).toBeTruthy();
        expect(result).toHaveLength(1);
        expect(result![0]).toBe(error);
    });

    describe('ValidationErrorBuilder.createError', () => {
        it('should create validation error with empty params when options is undefined', () => {
            const error = ValidationErrorBuilder.createError(ValidationErrorCode.REQUIRED);

            expect(error).toEqual({
                code: ValidationErrorCode.REQUIRED,
                params: {},
                context: undefined,
            });
        });

        it('should create validation error with empty params when options.params is undefined', () => {
            const error = ValidationErrorBuilder.createError(ValidationErrorCode.REQUIRED, {});

            expect(error).toEqual({
                code: ValidationErrorCode.REQUIRED,
                params: {},
                context: undefined,
            });
        });

        it('should create validation error with provided params', () => {
            const testParams = { field: 'test', value: 'testValue' };
            const error = ValidationErrorBuilder.createError(ValidationErrorCode.REQUIRED, {
                params: testParams,
            });

            expect(error).toEqual({
                code: ValidationErrorCode.REQUIRED,
                params: testParams,
                context: undefined,
            });
        });

        it('should create validation error with provided context', () => {
            const testContext = { path: 'test.field' };
            const error = ValidationErrorBuilder.createError(ValidationErrorCode.REQUIRED, {
                context: testContext,
            });

            expect(error).toEqual({
                code: ValidationErrorCode.REQUIRED,
                params: {},
                context: testContext,
            });
        });
    });
});
