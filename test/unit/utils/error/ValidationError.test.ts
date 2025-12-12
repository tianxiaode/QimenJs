import { ValidationError, BaseError } from '@/utils';

describe('ValidationError', () => {
    describe('constructor', () => {
        it('should create an instance with default values', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_FAILED');

            expect(error).toBeInstanceOf(ValidationError);
            expect(error).toBeInstanceOf(BaseError);
            expect(error.name).toBe('ValidationError');
            expect(error.message).toBe('Validation failed');
            expect(error.code).toBe('VALIDATION_FAILED');
            expect(error.errors).toEqual([]);
            expect(error.context?.errors).toEqual([]);
        });

        it('should create an instance with errors array', () => {
            const errors = [
                { field: 'username', message: 'Username is required' },
                { field: 'email', message: 'Email is invalid' },
            ];

            const error = new ValidationError(
                'Multiple validation errors',
                'MULTIPLE_ERRORS',
                errors
            );

            expect(error.message).toBe('Multiple validation errors');
            expect(error.code).toBe('MULTIPLE_ERRORS');
            expect(error.errors).toEqual(errors);
            expect(error.errors).toHaveLength(2);
            expect(error.context?.errors).toEqual(errors);
        });

        it('should create an instance with all parameters', () => {
            const errors = [{ field: 'password', message: 'Password too weak' }];

            const error = new ValidationError(
                'Password validation failed',
                'PASSWORD_VALIDATION_FAILED',
                errors,
                { userId: 123, rule: 'strength_check' }
            );

            expect(error.message).toBe('Password validation failed');
            expect(error.code).toBe('PASSWORD_VALIDATION_FAILED');
            expect(error.errors).toEqual(errors);
            expect(error.context).toEqual({
                userId: 123,
                rule: 'strength_check',
                errors,
            });
        });

        it('should handle empty errors array in context', () => {
            const error = new ValidationError('Test message', 'TEST_ERROR');

            expect(error.context?.errors).toEqual([]);
        });

        it('should handle undefined context', () => {
            const error = new ValidationError('Test message', 'TEST_ERROR', []);

            expect(error.code).toBe('TEST_ERROR');
            expect(error.context?.errors).toEqual([]);
        });
        it('should use default code when not provided', () => {
            const error = new ValidationError('Validation failed');

            expect(error.code).toBe('VALIDATION_FAILED');
            expect(error.message).toBe('Validation failed');
            expect(error.errors).toEqual([]);
            expect(error.context?.errors).toEqual([]);
        });

        it('should use default code with errors array', () => {
            const errors = [{ field: 'username', message: 'Username is required' }];

            const error = new ValidationError('Validation failed', undefined, errors);

            expect(error.code).toBe('VALIDATION_FAILED');
            expect(error.message).toBe('Validation failed');
            expect(error.errors).toEqual(errors);
            expect(error.context?.errors).toEqual(errors);
        });

        it('should use default code with errors array and context', () => {
            const errors = [{ field: 'password', message: 'Password too weak' }];

            const error = new ValidationError('Validation failed', undefined, errors, {
                userId: 123,
            });

            expect(error.code).toBe('VALIDATION_FAILED');
            expect(error.message).toBe('Validation failed');
            expect(error.errors).toEqual(errors);
            expect(error.context).toEqual({
                userId: 123,
                errors,
            });
        });
    });

    describe('addError method', () => {
        it('should add error to errors array', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR');

            expect(error.errors).toHaveLength(0);

            const result = error.addError('email', 'Invalid email format');

            expect(error.errors).toHaveLength(1);
            expect(error.errors[0]).toEqual({
                field: 'email',
                message: 'Invalid email format',
            });
            expect(result).toBe(error); // Should return this for chaining
        });

        it('should add multiple errors', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR');

            error
                .addError('username', 'Username too short')
                .addError('password', 'Password too weak')
                .addError('email', 'Email required');

            expect(error.errors).toHaveLength(3);
            expect(error.errors).toEqual([
                { field: 'username', message: 'Username too short' },
                { field: 'password', message: 'Password too weak' },
                { field: 'email', message: 'Email required' },
            ]);
        });

        it('should add errors to existing errors array', () => {
            const initialErrors = [{ field: 'username', message: 'Username taken' }];

            const error = new ValidationError(
                'Validation failed',
                'VALIDATION_ERROR',
                initialErrors
            );
            error.addError('email', 'Email invalid');

            expect(error.errors).toHaveLength(2);
            expect(error.errors[0]).toEqual(initialErrors[0]);
            expect(error.errors[1]).toEqual({ field: 'email', message: 'Email invalid' });
        });

        it('should update context errors when adding errors', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR');

            error.addError('field1', 'Error 1');
            error.addError('field2', 'Error 2');

            expect(error.context?.errors).toEqual(error.errors);
            expect(error.context?.errors).toHaveLength(2);
        });
    });

    describe('hasErrors method', () => {
        it('should return false when no errors', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR');

            expect(error.hasErrors()).toBe(false);
        });

        it('should return true when there are errors', () => {
            const errors = [{ field: 'username', message: 'Username required' }];

            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', errors);

            expect(error.hasErrors()).toBe(true);
        });

        it('should return true after adding errors', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR');

            expect(error.hasErrors()).toBe(false);

            error.addError('field', 'Error message');

            expect(error.hasErrors()).toBe(true);
        });

        it('should return true when errors were provided in constructor', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', [
                { field: 'test', message: 'test error' },
            ]);

            expect(error.hasErrors()).toBe(true);
        });
    });

    describe('toSimpleObject method', () => {
        it('should return empty object when no errors', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR');

            const result = error.toSimpleObject();

            expect(result).toEqual({});
        });

        it('should group single error by field', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', [
                { field: 'username', message: 'Username required' },
            ]);

            const result = error.toSimpleObject();

            expect(result).toEqual({
                username: ['Username required'],
            });
        });

        it('should group multiple errors by field', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', [
                { field: 'username', message: 'Username required' },
                { field: 'email', message: 'Email invalid' },
                { field: 'password', message: 'Password too short' },
            ]);

            const result = error.toSimpleObject();

            expect(result).toEqual({
                username: ['Username required'],
                email: ['Email invalid'],
                password: ['Password too short'],
            });
        });

        it('should group multiple errors for same field into array', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', [
                { field: 'password', message: 'Password too short' },
                { field: 'password', message: 'Password needs special character' },
                { field: 'email', message: 'Email invalid' },
                { field: 'password', message: 'Password cannot be common word' },
            ]);

            const result = error.toSimpleObject();

            expect(result).toEqual({
                password: [
                    'Password too short',
                    'Password needs special character',
                    'Password cannot be common word',
                ],
                email: ['Email invalid'],
            });
        });

        it('should handle errors added after construction', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', [
                { field: 'username', message: 'Username taken' },
            ]);

            error.addError('username', 'Username too short');
            error.addError('email', 'Email required');

            const result = error.toSimpleObject();

            expect(result).toEqual({
                username: ['Username taken', 'Username too short'],
                email: ['Email required'],
            });
        });

        it('should return new object instance each call', () => {
            const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', [
                { field: 'test', message: 'test error' },
            ]);

            const result1 = error.toSimpleObject();
            const result2 = error.toSimpleObject();

            expect(result1).toEqual(result2);
            expect(result1).not.toBe(result2); // Should be different object instances
        });
    });

    describe('inheritance and error properties', () => {
        it('should have correct prototype chain', () => {
            const error = new ValidationError('Test', 'TEST_ERROR');

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(BaseError);
            expect(error).toBeInstanceOf(ValidationError);
        });

        it('should have stack trace', () => {
            const error = new ValidationError('Test', 'TEST_ERROR');

            expect(error.stack).toBeDefined();
            expect(typeof error.stack).toBe('string');
        });

        it('should be throwable', () => {
            expect(() => {
                throw new ValidationError('Test error', 'TEST_ERROR');
            }).toThrow(ValidationError);

            expect(() => {
                throw new ValidationError('Test error', 'TEST_ERROR');
            }).toThrow('Test error');
        });

        it('should preserve errors when thrown and caught', () => {
            try {
                throw new ValidationError('Validation failed', 'VALIDATION_FAILED', [
                    { field: 'email', message: 'Invalid email' },
                ]);
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    expect(error.errors).toHaveLength(1);
                    expect(error.errors[0].field).toBe('email');
                }
            }
        });
    });

    describe('error scenarios', () => {
        it('should handle duplicate fields in errors array', () => {
            const errors = [
                { field: 'username', message: 'Error 1' },
                { field: 'username', message: 'Error 2' },
                { field: 'username', message: 'Error 3' },
            ];

            const error = new ValidationError(
                'Multiple errors for same field',
                'DUPLICATE_FIELDS',
                errors
            );

            expect(error.errors).toHaveLength(3);
            expect(error.toSimpleObject()).toEqual({
                username: ['Error 1', 'Error 2', 'Error 3'],
            });
        });

        it('should handle empty field names', () => {
            const errors = [
                { field: '', message: 'General error' },
                { field: 'email', message: 'Email error' },
            ];

            const error = new ValidationError('Errors with empty field', 'EMPTY_FIELD', errors);

            expect(error.toSimpleObject()).toEqual({
                '': ['General error'],
                email: ['Email error'],
            });
        });

        it('should handle special characters in field names', () => {
            const errors = [
                { field: 'user-name', message: 'Dash in field' },
                { field: 'user.name', message: 'Dot in field' },
                { field: 'user_name', message: 'Underscore in field' },
            ];

            const error = new ValidationError('Special field names', 'SPECIAL_CHARS', errors);

            const result = error.toSimpleObject();

            expect(result['user-name']).toEqual(['Dash in field']);
            expect(result['user.name']).toEqual(['Dot in field']);
            expect(result.user_name).toEqual(['Underscore in field']);
        });
    });
});
