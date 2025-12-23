import {
    validateContains,
    validateUnique,
    ContainsRuleOptions,
    ValidationErrorCode
} from '@/utils';

describe('membership validators', () => {
    describe('validateContains', () => {
        test('should return null when value is contained in target array (default strict mode)', () => {
            const rule: ContainsRuleOptions = {
                target: [1, 2, 3, 4],
            };
            const result = validateContains(2, rule);
            expect(result).toBeNull();
        });

        test('should return error when value is not contained in target array', () => {
            const rule: ContainsRuleOptions = {
                target: [1, 2, 3, 4],
            };
            const result = validateContains(5, rule);
            expect(result).not.toBeNull();
            expect(result?.[0].code).toContain(ValidationErrorCode.NOT_ALLOWED);
        });

        test('should return null when value is not contained in target array with contains: false', () => {
            const rule: ContainsRuleOptions = {
                target: [1, 2, 3, 4],
                contains: false,
            };
            const result = validateContains(5, rule);
            expect(result).toBeNull();
        });

        test('should return error when value is contained in target array with contains: false', () => {
            const rule: ContainsRuleOptions = {
                target: [1, 2, 3, 4],
                contains: false,
            };
            const result = validateContains(2, rule);
            expect(result).not.toBeNull();
            expect(result![0].code).toContain(ValidationErrorCode.NOT_ALLOWED);
        });

        test('should work with strict mode (default)', () => {
            const rule: ContainsRuleOptions = {
                target: [1, 2, 3],
                strict: true,
            };
            const result = validateContains('1', rule); // string '1' vs number 1
            expect(result).not.toBeNull();
        });

        test('should work with non-strict mode', () => {
            const rule: ContainsRuleOptions = {
                target: [1, 2, 3],
                strict: false,
            };
            const result = validateContains('1', rule); // string '1' vs number 1
            expect(result).toBeNull();
        });

        test('should return error when target is not an array', () => {
            const rule: ContainsRuleOptions = {
                target: 'not an array',
            } as any;
            const result = validateContains(1, rule);
            expect(result).not.toBeNull();
            expect(result?.[0].code).toContain(ValidationErrorCode.INVALID_VALUE);
        });

        test('should work with target as a function', () => {
            const rule: ContainsRuleOptions = {
                target: () => [10, 20, 30],
            };
            const result = validateContains(20, rule);
            expect(result).toBeNull();
        });

        test('should work with target function returning non-array', () => {
            const rule: ContainsRuleOptions = {
                target: () => 'not array',
            } as any;
            const result = validateContains(1, rule);
            expect(result).not.toBeNull();
        });
    });

    describe('validateUnique', () => {
        test('should return null when all elements in array are unique', () => {
            const result = validateUnique([1, 2, 3, 4]);
            expect(result).toBeNull();
        });

        test('should return error when array contains duplicate elements', () => {
            const result = validateUnique([1, 2, 3, 2]);
            expect(result).not.toBeNull();
            expect(result![0].code).toContain(ValidationErrorCode.NOT_ALLOWED);
        });

        test('should return error when input is not an array', () => {
            const result = validateUnique('not an array' as any);
            expect(result).not.toBeNull();
            expect(result![0].code).toContain(ValidationErrorCode.INVALID_VALUE);
        });

        test('should handle empty arrays', () => {
            const result = validateUnique([]);
            expect(result).toBeNull();
        });

        test('should handle arrays with one element', () => {
            const result = validateUnique([42]);
            expect(result).toBeNull();
        });

        test('should handle arrays with duplicate elements at the beginning', () => {
            const result = validateUnique([1, 1, 2, 3]);
            expect(result).not.toBeNull();
        });

        test('should handle arrays with duplicate elements at the end', () => {
            const result = validateUnique([1, 2, 3, 1]);
            expect(result).not.toBeNull();
        });

        test('should handle arrays with different types', () => {
            const result = validateUnique([1, '1', 2]); // number 1 vs string '1'
            expect(result).toBeNull();
        });
    });
});