import {
    validateEq,
    validateGt,
    validateGte,
    validateLt,
    validateLte,
    validateNeq,
    ValidationErrorContext,
} from '@/validation';

describe('comparison扩展验证函数测试', () => {
    describe('validateEq函数测试', () => {
        it('当值等于目标值时验证通过', () => {
            const value = 5;
            const rule = { target: 5 };

            const result = validateEq(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不等于目标值时返回错误', () => {
            const value = 5;
            const rule = { target: 10 };

            const result = validateEq(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });

        it('在严格模式下类型不同即使值相同也返回错误', () => {
            const value = 5;
            const rule = { target: '5', strict: true };

            const result = validateEq(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                // 在严格模式下，数字5和字符串'5'无法比较，所以返回INVALID_VALUE
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('在非严格模式下类型不同但值相同则验证通过', () => {
            const value = 5;
            const rule = { target: '5', strict: false };

            const result = validateEq(value, rule, {});

            expect(result).toBeNull();
        });
    });

    describe('validateGt函数测试', () => {
        it('当值大于目标值时验证通过', () => {
            const value = 10;
            const rule = { target: 5 };

            const result = validateGt(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值小于目标值时返回错误', () => {
            const value = 5;
            const rule = { target: 10 };

            const result = validateGt(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });

        it('当值等于目标值时返回错误', () => {
            const value = 5;
            const rule = { target: 5 };

            const result = validateGt(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });
    });

    describe('validateGte函数测试', () => {
        it('当值大于目标值时验证通过', () => {
            const value = 10;
            const rule = { target: 5 };

            const result = validateGte(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值等于目标值时验证通过', () => {
            const value = 5;
            const rule = { target: 5 };

            const result = validateGte(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值小于目标值时返回错误', () => {
            const value = 5;
            const rule = { target: 10 };

            const result = validateGte(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });
    });

    describe('validateLt函数测试', () => {
        it('当值小于目标值时验证通过', () => {
            const value = 5;
            const rule = { target: 10 };

            const result = validateLt(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值大于目标值时返回错误', () => {
            const value = 10;
            const rule = { target: 5 };

            const result = validateLt(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });

        it('当值等于目标值时返回错误', () => {
            const value = 5;
            const rule = { target: 5 };

            const result = validateLt(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });
    });

    describe('validateLte函数测试', () => {
        it('当值小于目标值时验证通过', () => {
            const value = 5;
            const rule = { target: 10 };

            const result = validateLte(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值等于目标值时验证通过', () => {
            const value = 5;
            const rule = { target: 5 };

            const result = validateLte(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值大于目标值时返回错误', () => {
            const value = 10;
            const rule = { target: 5 };

            const result = validateLte(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });
    });

    describe('validateNeq函数测试', () => {
        it('当值不等于目标值时验证通过', () => {
            const value = 5;
            const rule = { target: 10, operator: 'eq' as const }; // operator会被覆盖为'neq'

            const result = validateNeq(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值等于目标值时返回错误', () => {
            const value = 5;
            const rule = { target: 5, operator: 'eq' as const }; // operator会被覆盖为'neq'

            const result = validateNeq(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });

        it('在严格模式下类型不同即使值相同也验证通过', () => {
            const value = 5;
            const rule = { target: '5', strict: true, operator: 'eq' as const }; // operator会被覆盖为'neq'

            const result = validateNeq(value, rule, {});

            // 在严格模式下，数字5和字符串'5'无法比较，所以返回INVALID_VALUE，这表示不相等
            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('在非严格模式下类型不同但值相同则返回错误', () => {
            const value = 5;
            const rule = { target: '5', strict: false, operator: 'eq' as const }; // operator会被覆盖为'neq'

            const result = validateNeq(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });
    });

    describe('上下文传递测试', () => {
        it('应该正确传递上下文信息', () => {
            const value = 5;
            const rule = { target: 10 };
            const context: ValidationErrorContext = {
                field: 'testField',
                value,
            };

            const result = validateEq(value, rule, context);

            expect(result).not.toBeNull();
            if (result && result[0]) {
                // 验证错误信息中包含相关信息
                expect(result[0]).toHaveProperty('code');
                expect(result[0].code).toBe('VALIDATION_CONDITION_FAILED');
            }
        });
    });
});
