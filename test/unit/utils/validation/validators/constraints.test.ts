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
        it('should validate minimum value with same types', () => {
            expect(validateMin(5, 3)).toBe(true);
            expect(validateMin(2, 3)).toBe(false);
        });

        it('should validate minimum value with different types (loose comparison)', () => {
            expect(validateMin('5', 3)).toBe(true); // 字符串数字现在可以比较
            expect(validateMin(5, '3' as any)).toBe(true);
            expect(validateMin('2', 3)).toBe(false);
        });

        it('should validate maximum value with same types', () => {
            expect(validateMax(5, 10)).toBe(true);
            expect(validateMax(15, 10)).toBe(false);
        });

        it('should validate maximum value with different types (loose comparison)', () => {
            expect(validateMax('5', 10)).toBe(true); // 字符串数字现在可以比较
            expect(validateMax(5, '10' as any)).toBe(true);
            expect(validateMax('15', 10)).toBe(false);
        });

        it('should validate numeric range with same types', () => {
            expect(validateRange(5, 3, 10)).toBe(true);
            expect(validateRange(2, 3, 10)).toBe(false);
            expect(validateRange(15, 3, 10)).toBe(false);
        });

        it('should validate numeric range with different types (loose comparison)', () => {
            expect(validateRange('7', 3, 10)).toBe(true); // 字符串数字现在可以比较
            expect(validateRange(7, '3' as any, '10' as any)).toBe(true);
            expect(validateRange('2', 3, 10)).toBe(false);
        });

        it('should validate greater than with same types', () => {
            expect(validateGreaterThan(5, 3)).toBe(true);
            expect(validateGreaterThan(3, 5)).toBe(false);
        });

        it('should validate greater than with different types (loose comparison)', () => {
            expect(validateGreaterThan('5', 3)).toBe(true); // 字符串数字现在可以比较
            expect(validateGreaterThan(5, '3')).toBe(true);
            expect(validateGreaterThan('3', 5)).toBe(false);
        });

        it('should validate greater than or equal to with same types', () => {
            expect(validateGreaterThanOrEqualTo(5, 3)).toBe(true);
            expect(validateGreaterThanOrEqualTo(5, 5)).toBe(true);
            expect(validateGreaterThanOrEqualTo(3, 5)).toBe(false);
        });

        it('should validate greater than or equal to with different types (loose comparison)', () => {
            expect(validateGreaterThanOrEqualTo('5', 5)).toBe(true); // 字符串数字现在可以比较
            expect(validateGreaterThanOrEqualTo(5, '5')).toBe(true);
            expect(validateGreaterThanOrEqualTo('3', 5)).toBe(false);
        });

        it('should validate less than with same types', () => {
            expect(validateLessThan(3, 5)).toBe(true);
            expect(validateLessThan(5, 3)).toBe(false);
        });

        it('should validate less than with different types (loose comparison)', () => {
            expect(validateLessThan('3', 5)).toBe(true); // 字符串数字现在可以比较
            expect(validateLessThan(3, '5')).toBe(true);
            expect(validateLessThan('5', 3)).toBe(false);
        });

        it('should validate less than or equal to with same types', () => {
            expect(validateLessThanOrEqualTo(3, 5)).toBe(true);
            expect(validateLessThanOrEqualTo(5, 5)).toBe(true);
            expect(validateLessThanOrEqualTo(7, 5)).toBe(false);
        });

        it('should validate less than or equal to with different types (loose comparison)', () => {
            expect(validateLessThanOrEqualTo('5', 5)).toBe(true); // 字符串数字现在可以比较
            expect(validateLessThanOrEqualTo(5, '5')).toBe(true);
            expect(validateLessThanOrEqualTo('7', 5)).toBe(false);
        });

        it('should validate between inclusive with same types', () => {
            expect(validateBetween(5, 3, 10)).toBe(true);
            expect(validateBetween(3, 3, 10)).toBe(true);
            expect(validateBetween(10, 3, 10)).toBe(true);
            expect(validateBetween(2, 3, 10)).toBe(false);
        });

        it('should validate between inclusive with different types (loose comparison)', () => {
            expect(validateBetween('5', 3, 10)).toBe(true); // 字符串数字现在可以比较
            expect(validateBetween(5, '3', '10')).toBe(true);
            expect(validateBetween('2', 3, 10)).toBe(false);
        });

        it('should validate between exclusive with same types', () => {
            expect(validateBetweenExclusive(5, 3, 10)).toBe(true);
            expect(validateBetweenExclusive(3, 3, 10)).toBe(false);
            expect(validateBetweenExclusive(10, 3, 10)).toBe(false);
            expect(validateBetweenExclusive(2, 3, 10)).toBe(false);
        });

        it('should validate between exclusive with different types (loose comparison)', () => {
            expect(validateBetweenExclusive('5', 3, 10)).toBe(true); // 字符串数字现在可以比较
            expect(validateBetweenExclusive(5, '3', '10')).toBe(true);
            expect(validateBetweenExclusive('3', 3, 10)).toBe(false);
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
            expect(validateIn('b', obj)).toBe(true);
            expect(validateIn(4, obj)).toBe(false);
        });

        it('should validate exclusion', () => {
            expect(validateNotIn(4, [1, 2, 3])).toBe(true);
            expect(validateNotIn(2, [1, 2, 3])).toBe(false);
        });
    });

    describe('Equality validations', () => {
        it('should validate equality with strict comparison', () => {
            expect(validateEqualTo(5, 5, true)).toBe(true);
            expect(validateEqualTo(5, '5', true)).toBe(false); // 严格比较
            expect(validateEqualTo({}, {}, true)).toBe(false); // Different references
        });

        it('should validate equality with loose comparison (default)', () => {
            expect(validateEqualTo(5, 5)).toBe(true); // 默认宽松比较
            expect(validateEqualTo(5, '5')).toBe(true); // 宽松比较
            expect(validateEqualTo('5', 5)).toBe(true);
            expect(validateEqualTo(true, 1)).toBe(true);
            expect(validateEqualTo(false, 0)).toBe(true);
            expect(validateEqualTo(null, undefined)).toBe(true);
        });

        it('should validate inequality with strict comparison', () => {
            expect(validateNotEqualTo(5, 3, true)).toBe(true);
            expect(validateNotEqualTo(5, 5, true)).toBe(false);
            expect(validateNotEqualTo(5, '5', true)).toBe(true); // 严格比较
        });

        it('should validate inequality with loose comparison (default)', () => {
            expect(validateNotEqualTo(5, 3)).toBe(true); // 默认宽松比较
            expect(validateNotEqualTo(5, '3')).toBe(true);
            expect(validateNotEqualTo(5, 5)).toBe(false);
            expect(validateNotEqualTo(5, '5')).toBe(false); // 宽松比较
            expect(validateNotEqualTo(true, 1)).toBe(false);
        });

        it('should validate string numeric comparisons', () => {
            // 字符串数字比较（数字转换）
            expect(validateEqualTo('5', '5')).toBe(true);
            expect(validateEqualTo('5', '5.0')).toBe(true);
            expect(validateGreaterThan('10', '5')).toBe(true); // 数字比较，不是字典序
            expect(validateLessThan('5', '10')).toBe(true); // 数字比较，不是字典序

            // 字符串数字与普通字符串
            expect(validateEqualTo('abc', 'abc')).toBe(true);
            expect(validateGreaterThan('def', 'abc')).toBe(true); // 字典序比较
            expect(validateLessThan('abc', 'def')).toBe(true); // 字典序比较
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

    describe('Cross-type comparisons', () => {
        it('should validate cross-type numeric comparisons', () => {
            // 字符串数字与数字比较
            expect(validateGreaterThan('10', 5)).toBe(true);
            expect(validateLessThan('5', 10)).toBe(true);
            expect(validateEqualTo('5', 5)).toBe(true);

            // 日期比较
            const date1 = new Date('2023-01-01');
            const date2 = new Date('2023-12-31');
            expect(validateGreaterThan(date2, date1)).toBe(true);

            // 日期字符串与日期对象比较
            expect(validateGreaterThan(new Date('2023-12-31'), '2023-01-01')).toBe(true);

            // 时间戳与日期比较
            const timestamp = Date.now();
            const date = new Date(timestamp);
            expect(validateEqualTo(date, timestamp)).toBe(true);
        });

        it('should handle invalid comparisons gracefully', () => {
            expect(validateGreaterThan('abc', 'def')).toBe(false);
            expect(validateLessThan({}, [])).toBe(false);
            expect(validateGreaterThan(null, undefined)).toBe(false);
        });

        it('should handle generic number conversion', () => {
            // 测试通用数字转换逻辑
            expect(validateEqualTo(true, 1)).toBe(true);
            expect(validateEqualTo(false, 0)).toBe(true);
            expect(validateGreaterThan(true, false)).toBe(true);

            // null/undefined 转换 - 这些应该是 false，因为:
            // undefined == 0 是 false
            // Number(undefined) 是 NaN
            expect(validateEqualTo(null, 0)).toBe(true); // null == 0 为 false, 但 Number(null) == 0 为 true
            expect(validateEqualTo(undefined, 0)).toBe(false); // undefined == 0 为 false, Number(undefined) 是 NaN

            // 更准确的测试:
            expect(validateEqualTo(null, 0)).toBe(true); // null 转换为数字是 0
            expect(validateEqualTo(undefined, 0)).toBe(false); // undefined 转换为数字是 NaN，NaN 不等于 0
        });

        // 添加到 Cross-type comparisons 描述块中
        it('should handle date conversions', () => {
            const date = new Date('2023-01-01');
            const timestamp = date.getTime();
            const dateString = '2023-01-01';

            // Date 与字符串比较
            expect(validateEqualTo(date, dateString)).toBe(true);
            expect(validateGreaterThan(date, '2022-12-31')).toBe(true);
            expect(validateLessThan(date, '2023-01-02')).toBe(true);

            // Date 与时间戳比较
            expect(validateEqualTo(date, timestamp)).toBe(true);
            expect(validateGreaterThan(date, timestamp - 1000)).toBe(true);
            expect(validateLessThan(date, timestamp + 1000)).toBe(true);

            // 字符串与 Date 比较
            expect(validateEqualTo(dateString, date)).toBe(true);
            expect(validateGreaterThan('2023-01-02', date)).toBe(true);
            expect(validateLessThan('2022-12-31', date)).toBe(true);

            // 数字与 Date 比较
            expect(validateEqualTo(timestamp, date)).toBe(true);
            expect(validateGreaterThan(timestamp + 1000, date)).toBe(true);
            expect(validateLessThan(timestamp - 1000, date)).toBe(true);
        });

        it('should handle string-number bidirectional conversions', () => {
            // 字符串转数字
            expect(validateEqualTo('5', 5)).toBe(true);
            expect(validateGreaterThan('10', 5)).toBe(true);
            expect(validateLessThan('5', 10)).toBe(true);

            // 数字转字符串
            expect(validateEqualTo(5, '5')).toBe(true);
            expect(validateGreaterThan(10, '5')).toBe(true);
            expect(validateLessThan(5, '10')).toBe(true);

            // 边界情况
            expect(validateEqualTo('0', 0)).toBe(true);
            expect(validateEqualTo('-5', -5)).toBe(true);
            expect(validateEqualTo('5.5', 5.5)).toBe(true);
        });

        // 可以添加到 Cross-type comparisons 描述块中（可选）
        it('should handle exceptions gracefully', () => {
            // 创建一个会抛出异常的对象
            const evilObject = {
                valueOf() {
                    throw new Error('Evil object!');
                },
                toString() {
                    throw new Error('Evil object!');
                },
            };

            // 这些比较应该不会抛出异常，而是返回 false（因为内部会返回 NaN）
            expect(validateEqualTo(evilObject, 5)).toBe(false);
            expect(validateGreaterThan(evilObject, 5)).toBe(false);
            expect(validateLessThan(evilObject, 5)).toBe(false);
        });

        // 可以添加到 Equality validations 或 Cross-type comparisons 中
        it('should handle string dictionary comparisons', () => {
            // 相等的情况
            expect(validateEqualTo('abc', 'abc', true)).toBe(true);

            // 小于的情况
            expect(validateLessThan('abc', 'def', true)).toBe(true);
            expect(validateGreaterThan('abc', 'def', true)).toBe(false);

            // 大于的情况
            expect(validateGreaterThan('def', 'abc', true)).toBe(true);
            expect(validateLessThan('def', 'abc', true)).toBe(false);

            // 边界情况
            expect(validateLessThan('a', 'aa', true)).toBe(true); // 较短的字符串
            expect(validateGreaterThan('aa', 'a', true)).toBe(true); // 较长的字符串
        });

        // 添加到 Cross-type comparisons 描述块中
        it('should handle date comparisons with all branches', () => {
            const date1 = new Date('2023-01-01');
            const date2 = new Date('2023-12-31');
            const invalidDate = new Date(NaN); // 无效日期

            // 测试无效日期比较 (覆盖 isNaN 分支)
            expect(validateEqualTo(invalidDate, date1, true)).toBe(false);
            expect(validateEqualTo(date1, invalidDate, true)).toBe(false);
            expect(validateEqualTo(invalidDate, invalidDate, true)).toBe(true);

            // 测试相等的日期 (覆盖 diff === 0 分支)
            const sameDate1 = new Date('2023-01-01');
            const sameDate2 = new Date('2023-01-01');
            expect(validateEqualTo(sameDate1, sameDate2, true)).toBe(true);

            // 测试小于的情况 (覆盖 diff < 0 为 true 分支)
            expect(validateLessThan(date1, date2, true)).toBe(true);
            expect(validateGreaterThan(date1, date2, true)).toBe(false);

            // 测试大于的情况 (覆盖 diff < 0 为 false 分支)
            expect(validateGreaterThan(date2, date1, true)).toBe(true);
            expect(validateLessThan(date2, date1, true)).toBe(false);
        });

        // 添加到 Cross-type comparisons 描述块中
        it('should handle boolean comparisons with all branches', () => {
            // 情况1：相等的布尔值 (value === other 为 true)
            expect(validateEqualTo(true, true, true)).toBe(true); // true === true
            expect(validateEqualTo(false, false, true)).toBe(true); // false === false

            // 情况2：true > false (value === other 为 false 且 value 为 true)
            expect(validateGreaterThan(true, false, true)).toBe(true);
            expect(validateLessThan(true, false, true)).toBe(false);

            // 情况3：false < true (value === other 为 false 且 value 为 false)
            expect(validateLessThan(false, true, true)).toBe(true);
            expect(validateGreaterThan(false, true, true)).toBe(false);

            // 验证相等性
            expect(validateEqualTo(true, false, true)).toBe(false); // true !== false
            expect(validateEqualTo(false, true, true)).toBe(false); // false !== true
        });

        // 添加到 Cross-type comparisons 描述块中
        it('should return NaN for unsupported types comparison', () => {
            // 测试不支持的类型比较（严格模式下）
            expect(validateEqualTo({}, [], true)).toBe(false); // 对象 vs 数组
            expect(validateGreaterThan(/regex/, function () {}, true)).toBe(false); // 正则 vs 函数
            expect(validateLessThan(Symbol('a'), Symbol('b'), true)).toBe(false); // Symbol 比较

            // 测试不同类型间的比较（严格模式下）
            expect(validateEqualTo([], {}, true)).toBe(false); // 数组 vs 对象
            expect(validateGreaterThan(new Map(), new Set(), true)).toBe(false); // Map vs Set

            // 验证这些比较返回 false（因为 smartCompare 返回 NaN，而 validateEqualTo 检查是否等于 0）
        });
    });

    describe('Factory functions', () => {
        it('should create range validator', () => {
            const validator = createRangeValidator(3, 10);
            expect(validator(5)).toBe(true);
            expect(validator(2)).toBe(false);
            expect(validator(15)).toBe(false);
            expect(validator('7')).toBe(true); // 字符串数字现在可以比较
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

        it('should return false for non-supported collection types in validateIn', () => {
            expect(validateIn(1, 'string' as any)).toBe(false); // 字符串不是支持的集合类型
            expect(validateIn(1, 123 as any)).toBe(false); // 数字不是支持的集合类型
            expect(validateIn(1, true as any)).toBe(false); // 布尔值不是支持的集合类型
        });

        it('should return false for non-supported types in validateEmpty', () => {
            expect(validateEmpty(123)).toBe(false); // 数字不是支持的类型
            expect(validateEmpty(true)).toBe(false); // 布尔值不是支持的类型
        });
    });
});
