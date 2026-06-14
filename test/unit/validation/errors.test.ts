/**
 * 验证错误类测试
 */

import { 
    ValidationError,
    DuplicateValidatorError,
    ValidatorNotFoundError,
    ValidationTypeNotDefinedError,
    ValidationErrorCode
} from '@/validation/errors';

describe('Validation Errors', () => {
    describe('ValidationError', () => {
        it('should create validation error', () => {
            const error = new ValidationError('Validation failed', 'required', [{ field: 'name', message: 'required' }]);
            expect(error).toBeInstanceOf(Error);
            expect(error.name).toBe('ValidationError');
            expect(error.errors).toHaveLength(1);
        });

        it('should have correct name', () => {
            const error = new ValidationError('Validation failed');
            expect(error.name).toBe('ValidationError');
        });

        it('should have message', () => {
            const error = new ValidationError('Field is required', 'required');
            expect(error.message).toBe('Field is required');
        });

        it('should add error', () => {
            const error = new ValidationError('Validation failed');
            error.addError('name', 'required');
            expect(error.errors).toHaveLength(1);
            expect(error.hasErrors()).toBe(true);
        });

        it('should convert to simple object', () => {
            const error = new ValidationError('Validation failed');
            error.addError('name', 'required');
            error.addError('name', 'minLength');
            error.addError('email', 'format');
            
            const obj = error.toSimpleObject();
            expect(obj.name).toHaveLength(2);
            expect(obj.email).toHaveLength(1);
        });
    });

    describe('DuplicateValidatorError', () => {
        it('should create duplicate validator error', () => {
            const error = new DuplicateValidatorError('test-validator');
            expect(error).toBeInstanceOf(Error);
            expect(error.name).toBe('DuplicateValidatorError');
        });

        it('should have message with validator name', () => {
            const error = new DuplicateValidatorError('my-validator');
            expect(error.message).toContain('my-validator');
        });
    });

    describe('ValidatorNotFoundError', () => {
        it('should create validator not found error', () => {
            const error = new ValidatorNotFoundError('missing-validator');
            expect(error).toBeInstanceOf(Error);
            expect(error.name).toBe('ValidatorNotFoundError');
        });

        it('should have message with validator name', () => {
            const error = new ValidatorNotFoundError('my-validator');
            expect(error.message).toContain('my-validator');
        });
    });

    describe('ValidationTypeNotDefinedError', () => {
        it('should create type not defined error', () => {
            const error = new ValidationTypeNotDefinedError('custom-type');
            expect(error).toBeInstanceOf(Error);
            expect(error.name).toBe('ValidationTypeNotDefinedError');
        });

        it('should have message with type name', () => {
            const error = new ValidationTypeNotDefinedError('my-type');
            expect(error.message).toContain('my-type');
        });
    });

    describe('ValidationErrorCode', () => {
        it('should have error codes', () => {
            expect(ValidationErrorCode.REQUIRED).toBeDefined();
            expect(ValidationErrorCode.TYPE_MISMATCH).toBeDefined();
            expect(ValidationErrorCode.TOO_SMALL).toBeDefined();
            expect(ValidationErrorCode.TOO_LARGE).toBeDefined();
        });
    });
});
