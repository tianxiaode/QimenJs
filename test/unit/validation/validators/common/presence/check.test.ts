import { checkPresence } from '@/validation/validators/common/presence/check';
import { ValidationErrorBuilder, ValidationErrorContext } from '@/validation';

describe('checkPresence', () => {
    describe('required rule', () => {
        it('should return required error when value is undefined and required is true', () => {
            const context: ValidationErrorContext = { field: 'testField' };
            const result = checkPresence(undefined, { required: true }, context);

            expect(result).toEqual(ValidationErrorBuilder.required(context));
        });

        it('should return null when value is not undefined and required is true', () => {
            const result = checkPresence('value', { required: true });
            expect(result).toBeNull();
        });

        it('should return null when value is undefined and required is not set', () => {
            const result = checkPresence(undefined, {});
            expect(result).toBeNull();
        });

        it('should return null when value is undefined and required is false', () => {
            const result = checkPresence(undefined, { required: false });
            expect(result).toBeNull();
        });
    });

    describe('nullable rule', () => {
        it('should return invalid_value error when value is null and nullable is false', () => {
            const context: ValidationErrorContext = { field: 'testField' };
            const result = checkPresence(null, { nullable: false }, context);

            expect(result).toEqual(
                ValidationErrorBuilder.invalid_value(null, {
                    ...context,
                    expected: 'non-null',
                })
            );
        });

        it('should return null when value is null and nullable is true', () => {
            const result = checkPresence(null, { nullable: true });
            expect(result).toBeNull();
        });

        it('should return null when value is null and nullable is not set', () => {
            const result = checkPresence(null, {});
            expect(result).toBeNull();
        });

        it('should return null when value is not null and nullable is false', () => {
            const result = checkPresence('value', { nullable: false });
            expect(result).toBeNull();
        });
    });

    describe('empty rule', () => {
        it('should return invalid_value error when value is empty string and empty is false', () => {
            const context: ValidationErrorContext = { field: 'testField' };
            const result = checkPresence('', { empty: false }, context);

            expect(result).toEqual(
                ValidationErrorBuilder.invalid_value('', {
                    ...context,
                    expected: 'non-empty',
                })
            );
        });

        it('should return invalid_value error when value is empty array and empty is false', () => {
            const context: ValidationErrorContext = { field: 'testField' };
            const result = checkPresence([], { empty: false }, context);

            expect(result).toEqual(
                ValidationErrorBuilder.invalid_value([], {
                    ...context,
                    expected: 'non-empty',
                })
            );
        });

        it('should return invalid_value error when value is empty object and empty is false', () => {
            const context: ValidationErrorContext = { field: 'testField' };
            const result = checkPresence({}, { empty: false }, context);

            expect(result).toEqual(
                ValidationErrorBuilder.invalid_value(
                    {},
                    {
                        ...context,
                        expected: 'non-empty',
                    }
                )
            );
        });

        it('should return null when value is empty string and empty is true', () => {
            const result = checkPresence('', { empty: true });
            expect(result).toBeNull();
        });

        it('should return null when value is empty array and empty is true', () => {
            const result = checkPresence([], { empty: true });
            expect(result).toBeNull();
        });

        it('should return null when value is empty object and empty is true', () => {
            const result = checkPresence({}, { empty: true });
            expect(result).toBeNull();
        });

        it('should return null when value is not empty and empty is false', () => {
            const result = checkPresence('value', { empty: false });
            expect(result).toBeNull();
        });

        it('should return null when value is not empty and empty is not set', () => {
            const result = checkPresence('value', {});
            expect(result).toBeNull();
        });
    });

    describe('combined rules', () => {
        it('should return required error when value is undefined, required is true, and empty is false', () => {
            const context: ValidationErrorContext = { field: 'testField' };
            const result = checkPresence(undefined, { required: true, empty: false }, context);

            expect(result).toEqual(ValidationErrorBuilder.required(context));
        });

        it('should return invalid_value error when value is null, nullable is false, and required is true', () => {
            const context: ValidationErrorContext = { field: 'testField' };
            const result = checkPresence(null, { required: true, nullable: false }, context);

            expect(result).toEqual(
                ValidationErrorBuilder.invalid_value(null, {
                    ...context,
                    expected: 'non-null',
                })
            );
        });
    });
});
