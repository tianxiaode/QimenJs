import { validatePresence, ValidationErrorBuilder } from '@/validation';
import { checkPresence } from '@/validation/validators/common/presence/check';

describe('validatePresence', () => {
    it('should return normalized validation result matching checkPresence behavior', () => {
        // 测试返回值格式与 checkPresence 一致
        const testCases = [
            { value: undefined, rule: { required: true } },
            { value: null, rule: { nullable: false } },
            { value: '', rule: { empty: false } },
            { value: 'valid', rule: {} },
        ];

        testCases.forEach(({ value, rule }) => {
            const checkResult = checkPresence(value, rule);
            const validateResult = validatePresence(value, rule);

            expect(validateResult).toEqual(ValidationErrorBuilder.normalizeResult(checkResult));
        });
    });

    it('should return null when checkPresence returns null', () => {
        const result = validatePresence('valid', {});
        expect(result).toBeNull();
    });

    it('should return array format when checkPresence returns error', () => {
        const result = validatePresence(undefined, { required: true });
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
    });

    it('should handle context parameter correctly', () => {
        const context = { field: 'testField', label: 'Test Field' };
        const result = validatePresence(undefined, { required: true }, context);

        expect(result).not.toBeNull();
        expect(Array.isArray(result)).toBe(true);
        if (result) {
            expect(result[0].context).toEqual(context);
        }
    });

    it('should handle empty results correctly', () => {
        const emptyResult = validatePresence('valid', {});
        expect(emptyResult).toBeNull();
    });
});
