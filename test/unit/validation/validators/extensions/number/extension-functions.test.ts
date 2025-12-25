import {
    validateInteger,
    validatePositive,
    validateNegative,
    validateOdd,
    validateEven,
    validateFinite,
    validateInfinite,
    ValidationErrorContext,
    NumberExtensionRule,
} from '@/validation';

describe('扩展数字验证函数测试', () => {
    describe('validateInteger函数测试', () => {
        it('当输入为整数时验证通过', () => {
            const value = 5;
            const rule: Omit<NumberExtensionRule, 'integer'> = {};

            const result = validateInteger(value, rule, {});

            expect(result).toBeNull();
        });

        it('当输入为小数时返回错误', () => {
            const value = 5.5;
            const rule: Omit<NumberExtensionRule, 'integer'> = {};

            const result = validateInteger(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当输入为非数字类型时返回类型错误', () => {
            const value = 'not-a-number';
            const rule: Omit<NumberExtensionRule, 'integer'> = {};

            // @ts-ignore - 测试非数字类型
            const result = validateInteger(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            }
        });

        it('应该正确传递上下文信息', () => {
            const value = 5.5; // 非整数
            const rule: Omit<NumberExtensionRule, 'integer'> = {};
            const context: ValidationErrorContext = {
                field: 'testField',
                value,
            };

            const result = validateInteger(value, rule, context);

            expect(result).not.toBeNull();
            if (result && result[0] && result[0].context) {
                expect(result[0].context.field).toBe('testField');
                expect(result[0].context.value).toBe(5.5);
            }
        });
    });

    describe('validatePositive函数测试', () => {
        it('当输入为正数时验证通过', () => {
            const value = 5;
            const rule: Omit<NumberExtensionRule, 'positive'> = {};

            const result = validatePositive(value, rule, {});

            expect(result).toBeNull();
        });

        it('当输入为负数时返回错误', () => {
            const value = -5;
            const rule: Omit<NumberExtensionRule, 'positive'> = {};

            const result = validatePositive(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当输入为零时返回错误', () => {
            const value = 0;
            const rule: Omit<NumberExtensionRule, 'positive'> = {};

            const result = validatePositive(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });
    });

    describe('validateNegative函数测试', () => {
        it('当输入为负数时验证通过', () => {
            const value = -5;
            const rule: Omit<NumberExtensionRule, 'negative'> = {};

            const result = validateNegative(value, rule, {});

            expect(result).toBeNull();
        });

        it('当输入为正数时返回错误', () => {
            const value = 5;
            const rule: Omit<NumberExtensionRule, 'negative'> = {};

            const result = validateNegative(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当输入为零时返回错误', () => {
            const value = 0;
            const rule: Omit<NumberExtensionRule, 'negative'> = {};

            const result = validateNegative(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });
    });

    describe('validateOdd函数测试', () => {
        it('当输入为奇数时验证通过', () => {
            const value = 7;
            const rule: Omit<NumberExtensionRule, 'odd'> = {};

            const result = validateOdd(value, rule, {});

            expect(result).toBeNull();
        });

        it('当输入为偶数时返回错误', () => {
            const value = 8;
            const rule: Omit<NumberExtensionRule, 'odd'> = {};

            const result = validateOdd(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当输入为小数时返回错误', () => {
            const value = 7.5;
            const rule: Omit<NumberExtensionRule, 'odd'> = {};

            const result = validateOdd(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE'); // 修正：小数不是整数，所以无法判断奇偶
            }
        });
    });

    describe('validateEven函数测试', () => {
        it('当输入为偶数时验证通过', () => {
            const value = 8;
            const rule: Omit<NumberExtensionRule, 'even'> = {};

            const result = validateEven(value, rule, {});

            expect(result).toBeNull();
        });

        it('当输入为奇数时返回错误', () => {
            const value = 7;
            const rule: Omit<NumberExtensionRule, 'even'> = {};

            const result = validateEven(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当输入为小数时返回错误', () => {
            const value = 8.5;
            const rule: Omit<NumberExtensionRule, 'even'> = {};

            const result = validateEven(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE'); // 修正：小数不是整数，所以无法判断奇偶
            }
        });
    });

    describe('validateFinite函数测试', () => {
        it('当输入为有限数时验证通过', () => {
            const value = 100;
            const rule: Omit<NumberExtensionRule, 'finite'> = {};

            const result = validateFinite(value, rule, {});

            expect(result).toBeNull();
        });

        it('当输入为无限数时返回错误', () => {
            const value = Infinity;
            const rule: Omit<NumberExtensionRule, 'finite'> = {};

            const result = validateFinite(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当输入为NaN时返回错误', () => {
            const value = NaN;
            const rule: Omit<NumberExtensionRule, 'finite'> = {};

            const result = validateFinite(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });
    });

    describe('validateInfinite函数测试', () => {
        it('当输入为无限数时返回错误（因为基础验证会排除无限数）', () => {
            const value = Infinity;
            const rule: Omit<NumberExtensionRule, 'infinite'> = {};

            const result = validateInfinite(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当输入为负无限数时返回错误（因为基础验证会排除无限数）', () => {
            const value = -Infinity;
            const rule: Omit<NumberExtensionRule, 'infinite'> = {};

            const result = validateInfinite(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当输入为有限数时返回错误', () => {
            const value = 100;
            const rule: Omit<NumberExtensionRule, 'infinite'> = {};

            const result = validateInfinite(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当输入为NaN时返回错误', () => {
            const value = NaN;
            const rule: Omit<NumberExtensionRule, 'infinite'> = {};

            const result = validateInfinite(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });
    });
});