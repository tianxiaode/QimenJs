import {
    validateMinLength,
    validateMaxLength,
    validateLengthRange,
    validateMin,
    validateMax,
    validateRange,
    validateIn,
    validateNotIn,
    validateAllConstraints,
    validateAnyConstraints,
    validateNotConstraints,
    validateEqualTo,
    validateNotEqualTo,
    validateStrictEqualTo,
    validateStrictNotEqualTo,
    validateGreaterThan,
    validateGreaterThanOrEqualTo,
    validateLessThan,
    validateLessThanOrEqualTo,
    validateBetween,
    validateBetweenExclusive,
    validateEmpty,
    validateNotEmpty,
    validateTruthyConstraint,
    validateFalsyConstraint,
    createRangeValidator,
    createLengthValidator,
    createInValidator,
} from '@orbitjs/utils';

describe('Validation Constraints', () => {
    describe('Length validations', () => {
        it('should validate minimum length for strings', () => {
            expect(validateMinLength('hello', 3)).toBe(true);
            expect(validateMinLength('hi', 5)).toBe(false);
        });

        it('should validate minimum length for arrays', () => {
            expect(validateMinLength([1, 2, 3], 2)).toBe(true);
            expect(validateMinLength([1], 3)).toBe(false);
        });

        it('should validate minimum length for objects', () => {
            expect(validateMinLength({ a: 1, b: 2 }, 1)).toBe(true);
            expect(validateMinLength({ a: 1 }, 3)).toBe(false);
        });

        it('should validate minimum length for Maps', () => {
            const map = new Map([
                ['a', 1],
                ['b', 2],
            ]);
            expect(validateMinLength(map, 1)).toBe(true);
            expect(validateMinLength(new Map(), 1)).toBe(false);
        });

        it('should validate minimum length for Sets', () => {
            const set = new Set([1, 2, 3]);
            expect(validateMinLength(set, 2)).toBe(true);
            expect(validateMinLength(new Set(), 1)).toBe(false);
        });

        // 在 "should validate maximum length for strings and arrays" 测试中添加 Map 和 Set 的测试用例
        it('should validate maximum length for strings, arrays, maps, and sets', () => {
            // 字符串测试
            expect(validateMaxLength('hello', 10)).toBe(true);
            expect(validateMaxLength('hello world', 5)).toBe(false);

            // 数组测试
            expect(validateMaxLength([1, 2, 3], 5)).toBe(true);
            expect(validateMaxLength([1, 2, 3, 4, 5, 6], 5)).toBe(false);

            // Map 测试
            const map1 = new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);
            const map2 = new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
                ['d', 4],
                ['e', 5],
                ['f', 6],
            ]);
            expect(validateMaxLength(map1, 5)).toBe(true);
            expect(validateMaxLength(map2, 5)).toBe(false);

            // Set 测试
            const set1 = new Set([1, 2, 3]);
            const set2 = new Set([1, 2, 3, 4, 5, 6]);
            expect(validateMaxLength(set1, 5)).toBe(true);
            expect(validateMaxLength(set2, 3)).toBe(false);
        });
        it('should validate length range', () => {
            expect(validateLengthRange('hello', 3, 10)).toBe(true);
            expect(validateLengthRange('hi', 3, 10)).toBe(false);
            expect(validateLengthRange('too long string', 3, 10)).toBe(false);
        });
    });

    describe('Numeric validations', () => {
        it('should validate minimum value', () => {
            expect(validateMin(5, 3)).toBe(true);
            expect(validateMin(2, 3)).toBe(false);
            expect(validateMin('5', 3)).toBe(false); // Not a number
        });

        it('should validate maximum value', () => {
            expect(validateMax(5, 10)).toBe(true);
            expect(validateMax(15, 10)).toBe(false);
            expect(validateMax('5', 10)).toBe(false); // Not a number
        });

        it('should validate numeric range', () => {
            expect(validateRange(5, 3, 10)).toBe(true);
            expect(validateRange(2, 3, 10)).toBe(false);
            expect(validateRange(15, 3, 10)).toBe(false);
        });

        it('should validate greater than', () => {
            expect(validateGreaterThan(5, 3)).toBe(true);
            expect(validateGreaterThan(3, 5)).toBe(false);
            expect(validateGreaterThan('5', 3)).toBe(false);
        });

        it('should validate greater than or equal to', () => {
            expect(validateGreaterThanOrEqualTo(5, 3)).toBe(true);
            expect(validateGreaterThanOrEqualTo(5, 5)).toBe(true);
            expect(validateGreaterThanOrEqualTo(3, 5)).toBe(false);
        });

        it('should validate less than', () => {
            expect(validateLessThan(3, 5)).toBe(true);
            expect(validateLessThan(5, 3)).toBe(false);
            expect(validateLessThan('3', 5)).toBe(false);
        });

        it('should validate less than or equal to', () => {
            expect(validateLessThanOrEqualTo(3, 5)).toBe(true);
            expect(validateLessThanOrEqualTo(5, 5)).toBe(true);
            expect(validateLessThanOrEqualTo(7, 5)).toBe(false);
        });

        it('should validate between inclusive', () => {
            expect(validateBetween(5, 3, 10)).toBe(true);
            expect(validateBetween(3, 3, 10)).toBe(true);
            expect(validateBetween(10, 3, 10)).toBe(true);
            expect(validateBetween(2, 3, 10)).toBe(false);
        });

        it('should validate between exclusive', () => {
            expect(validateBetweenExclusive(5, 3, 10)).toBe(true);
            expect(validateBetweenExclusive(3, 3, 10)).toBe(false);
            expect(validateBetweenExclusive(10, 3, 10)).toBe(false);
            expect(validateBetweenExclusive(2, 3, 10)).toBe(false);
        });
    });

    describe('Collection validations', () => {
        it('should validate inclusion in array', () => {
            expect(validateIn(2, [1, 2, 3])).toBe(true);
            expect(validateIn(4, [1, 2, 3])).toBe(false);
        });

        it('should validate inclusion in Set', () => {
            const set = new Set([1, 2, 3]);
            expect(validateIn(2, set)).toBe(true);
            expect(validateIn(4, set)).toBe(false);
        });

        it('should validate inclusion in object values', () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(validateIn(2, obj)).toBe(true);
            expect(validateIn(4, obj)).toBe(false);
        });

        it('should validate exclusion', () => {
            expect(validateNotIn(4, [1, 2, 3])).toBe(true);
            expect(validateNotIn(2, [1, 2, 3])).toBe(false);
        });
    });

    describe('Equality validations', () => {
        it('should validate equality', () => {
            expect(validateEqualTo(5, 5)).toBe(true);
            expect(validateEqualTo(5, '5')).toBe(false);
            expect(validateEqualTo({}, {})).toBe(false); // Different references
        });

        it('should validate inequality', () => {
            expect(validateNotEqualTo(5, 3)).toBe(true);
            expect(validateNotEqualTo(5, 5)).toBe(false);
        });

        it('should validate strict equality', () => {
            expect(validateStrictEqualTo(5, 5)).toBe(true);
            expect(validateStrictEqualTo(5, '5')).toBe(false);
        });

        it('should validate strict inequality', () => {
            expect(validateStrictNotEqualTo(5, 3)).toBe(true);
            expect(validateStrictNotEqualTo(5, 5)).toBe(false);
        });
    });

    describe('Logical validations', () => {
        it('should validate all constraints', () => {
            const validators = [(v: number) => v > 0, (v: number) => v < 10];
            expect(validateAllConstraints(5, validators)).toBe(true);
            expect(validateAllConstraints(15, validators)).toBe(false);
        });

        it('should validate any constraints', () => {
            const validators = [(v: number) => v < 0, (v: number) => v > 10];
            expect(validateAnyConstraints(15, validators)).toBe(true);
            expect(validateAnyConstraints(5, validators)).toBe(false);
        });

        it('should validate not constraints', () => {
            const validator = (v: number) => v > 0;
            expect(validateNotConstraints(-5, validator)).toBe(true);
            expect(validateNotConstraints(5, validator)).toBe(false);
        });
    });

    describe('Emptiness validations', () => {
        it('should validate empty values', () => {
            expect(validateEmpty(null)).toBe(true);
            expect(validateEmpty(undefined)).toBe(true);
            expect(validateEmpty('')).toBe(true);
            expect(validateEmpty('   ')).toBe(true);
            expect(validateEmpty([])).toBe(true);
            expect(validateEmpty({})).toBe(true);
            expect(validateEmpty(new Map())).toBe(true);
            expect(validateEmpty(new Set())).toBe(true);
        });

        it('should validate non-empty values', () => {
            expect(validateNotEmpty('hello')).toBe(true);
            expect(validateNotEmpty([1, 2])).toBe(true);
            expect(validateNotEmpty({ a: 1 })).toBe(true);
            expect(validateNotEmpty(new Map([['a', 1]]))).toBe(true);
            expect(validateNotEmpty(new Set([1]))).toBe(true);
        });
    });

    describe('Truthiness validations', () => {
        it('should validate truthy constraint', () => {
            expect(validateTruthyConstraint(true)).toBe(true);
            expect(validateTruthyConstraint(1)).toBe(true);
            expect(validateTruthyConstraint('hello')).toBe(true);
            expect(validateTruthyConstraint(false)).toBe(false);
            expect(validateTruthyConstraint(0)).toBe(false);
            expect(validateTruthyConstraint('')).toBe(false);
        });

        it('should validate falsy constraint', () => {
            expect(validateFalsyConstraint(false)).toBe(true);
            expect(validateFalsyConstraint(0)).toBe(true);
            expect(validateFalsyConstraint('')).toBe(true);
            expect(validateFalsyConstraint(true)).toBe(false);
            expect(validateFalsyConstraint(1)).toBe(false);
            expect(validateFalsyConstraint('hello')).toBe(false);
        });
    });

    describe('Factory functions', () => {
        it('should create range validator', () => {
            const validator = createRangeValidator(3, 10);
            expect(validator(5)).toBe(true);
            expect(validator(2)).toBe(false);
            expect(validator(15)).toBe(false);
        });

        it('should create length validator', () => {
            const validator = createLengthValidator(3, 10);
            expect(validator('hello')).toBe(true);
            expect(validator('hi')).toBe(false);
            expect(validator('very long string')).toBe(false);
        });

        it('should create inclusion validator', () => {
            const validator = createInValidator([1, 2, 3]);
            expect(validator(2)).toBe(true);
            expect(validator(4)).toBe(false);
        });

        it('should validate maximum length for objects', () => {
            expect(validateMaxLength({ a: 1, b: 2 }, 3)).toBe(true);
            expect(validateMaxLength({ a: 1, b: 2, c: 3, d: 4 }, 3)).toBe(false);
        });

        it('should validate empty plain objects', () => {
            expect(validateEmpty({})).toBe(true);
            expect(validateEmpty({ a: 1 })).toBe(false);
        });

        it('should return false for non-supported types in maxLength', () => {
            expect(validateMaxLength(123, 5)).toBe(false); // Numbers
            expect(validateMaxLength(true, 5)).toBe(false); // Booleans
            expect(validateMaxLength(null, 5)).toBe(false); // null
            expect(validateMaxLength(undefined, 5)).toBe(false); // undefined
        });

        it('should return false for non-supported types in minLength', () => {
            expect(validateMinLength(123, 5)).toBe(false); // Numbers
            expect(validateMinLength(true, 5)).toBe(false); // Booleans
            expect(validateMinLength(null, 5)).toBe(false); // null
            expect(validateMinLength(undefined, 5)).toBe(false); // undefined
        });

        // 在 Collection validations 描述块中添加
        it('should return false for non-supported collection types in validateIn', () => {
            expect(validateIn(1, 'string' as any)).toBe(false); // 字符串不是支持的集合类型
            expect(validateIn(1, 123  as any)).toBe(false); // 数字不是支持的集合类型
            expect(validateIn(1, true  as any)).toBe(false); // 布尔值不是支持的集合类型
        });

        // 在 Emptiness validations 描述块中添加
        it('should return false for non-supported types in validateEmpty', () => {
            expect(validateEmpty(123)).toBe(false); // 数字不是支持的类型
            expect(validateEmpty(true)).toBe(false); // 布尔值不是支持的类型
        });
    });
});
