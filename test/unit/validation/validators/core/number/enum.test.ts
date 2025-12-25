import { checkNumberEnum } from '@/validation/validators/core/number/enum';
import { ValidationErrorBuilder } from '@/validation';

describe('checkNumberEnum', () => {
    const mockContext = { field: 'testField', value: 5 };

    it('should return null when enum rule is not defined', () => {
        const value = 5;
        const rule = { required: true }; // 没有 enum 属性

        const result = checkNumberEnum(value, rule, mockContext);

        expect(result).toBeNull();
    });

    it('should return null when value is null', () => {
        const value = null;
        const rule = { enum: [1, 2, 3] as const };

        const result = checkNumberEnum(value, rule, mockContext);

        expect(result).toBeNull();
    });

    it('should return null when value is undefined', () => {
        const value = undefined;
        const rule = { enum: [1, 2, 3] as const };

        const result = checkNumberEnum(value, rule, mockContext);

        expect(result).toBeNull();
    });

    it('should return null when value is in the enum list', () => {
        const value = 2;
        const rule = { enum: [1, 2, 3] as const };

        const result = checkNumberEnum(value, rule, mockContext);

        expect(result).toBeNull();
    });

    it('should return null when value is 0 and 0 is in the enum list', () => {
        const value = 0;
        const rule = { enum: [0, 1, 2] as const };

        const result = checkNumberEnum(value, rule, mockContext);

        expect(result).toBeNull();
    });

    it('should return null when value is NaN and NaN is in the enum list (using includes which handles NaN specially)', () => {
        const value = NaN;
        const rule = { enum: [NaN, 1, 2] as const };

        const result = checkNumberEnum(value, rule, mockContext);

        // NaN is a special case - Array.includes() actually works with NaN
        expect(result).toBeNull();
    });

    it('should return an error when value is not in the enum list', () => {
        const value = 5;
        const rule = { enum: [1, 2, 3] as const };
        const expectedError = ValidationErrorBuilder.not_allowed(value, [1, 2, 3], mockContext);

        const result = checkNumberEnum(value, rule, mockContext);

        expect(result).toEqual(expectedError);
    });

    it('should return an error when value is a float not in the enum list', () => {
        const value = 4.5;
        const rule = { enum: [1, 2, 3] as const };
        const expectedError = ValidationErrorBuilder.not_allowed(value, [1, 2, 3], mockContext);

        const result = checkNumberEnum(value, rule, mockContext);

        expect(result).toEqual(expectedError);
    });

    it('should return an error when value is negative and not in the enum list', () => {
        const value = -5;
        const rule = { enum: [1, 2, 3] as const };
        const expectedError = ValidationErrorBuilder.not_allowed(value, [1, 2, 3], mockContext);

        const result = checkNumberEnum(value, rule, mockContext);

        expect(result).toEqual(expectedError);
    });

    it('should properly pass context to the error builder', () => {
        const value = 10;
        const rule = { enum: [1, 2, 3] as const };
        const context = { field: 'age', label: 'Age', value: 10 };

        const result = checkNumberEnum(value, rule, context);

        expect(result).toEqual({
            code: 'VALIDATION_NOT_ALLOWED',
            params: { value: 10, allowedValues: [1, 2, 3] },
            context: { field: 'age', label: 'Age', value: 10 },
        });
    });
});
