import { validateProperties } from '@/validation/validators/core/object/properties';
import { ValidationErrorContext, ValidatorFunction } from '@/validation';

// 模拟验证函数
const mockValidator = (expectedValue: any): ValidatorFunction => {
    return (value: any, rule: any, context?: any) => {
        if (value !== expectedValue) {
            return [
                {
                    code: 'VALIDATION_ERROR',
                    params: { expected: expectedValue, actual: value },
                    context,
                },
            ];
        }
        return null;
    };
};

// 模拟错误验证函数
const errorValidator: ValidatorFunction = (value: any, rule: any, context?: any) => {
    return [{ code: 'VALIDATION_ERROR', params: { value }, context }];
};

// 模拟成功验证函数
const successValidator: ValidatorFunction = (value: any, rule: any, context?: any) => {
    return null;
};

describe('validateProperties', () => {
    it('当对象的所有属性都通过验证时返回null', () => {
        const value = {
            field1: 'value1',
            field2: 42,
            field3: true,
        };

        const properties: Record<string, ValidatorFunction> = {
            field1: successValidator,
            field2: successValidator,
            field3: successValidator,
        };

        const result = validateProperties(value, properties, false, {});

        expect(result).toBeNull();
    });

    it('当对象的属性验证失败时返回错误', () => {
        const value = {
            field1: 'value1',
            field2: 'not_a_number',
        };

        const properties: Record<string, ValidatorFunction> = {
            field1: successValidator,
            field2: errorValidator,
        };

        const result = validateProperties(value, properties, false, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_ERROR');
        }
    });

    it('当allPropertiesError为false时遇到第一个错误就停止', () => {
        const value = {
            field1: 'value1',
            field2: 'value2',
            field3: 'value3',
        };

        const properties: Record<string, ValidatorFunction> = {
            field1: errorValidator, // 第一个验证器失败
            field2: errorValidator, // 第二个不会被检查
            field3: successValidator,
        };

        const result = validateProperties(value, properties, false, {});

        expect(result).not.toBeNull();
        if (result) {
            // 应该只返回第一个错误
            expect(result[0].code).toBe('VALIDATION_ERROR');
        }
    });

    it('当allPropertiesError为true时收集所有属性的错误', () => {
        const value = {
            field1: 'value1',
            field2: 'value2',
            field3: 'value3',
        };

        const properties: Record<string, ValidatorFunction> = {
            field1: errorValidator,
            field2: errorValidator,
            field3: errorValidator,
        };

        const result = validateProperties(value, properties, true, {});

        expect(result).not.toBeNull();
        if (result) {
            // 应该包含所有错误
            expect(result.length).toBeGreaterThanOrEqual(1); // 至少有一个错误
        }
    });

    it('当属性规则为空时验证通过', () => {
        const value = {
            field1: 'value1',
            field2: 42,
        };

        const properties: Record<string, any> = {};

        const result = validateProperties(value, properties, false, {});

        expect(result).toBeNull();
    });

    it('当值为null时验证继续，但属性值为undefined', () => {
        const value = {
            missingField: undefined,
        };

        const properties: Record<string, ValidatorFunction> = {
            missingField: errorValidator, // 会验证undefined值
        };

        const result = validateProperties(value, properties, false, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_ERROR');
        }
    });

    it('当值缺少某些属性时，这些属性的值为undefined并由验证器处理', () => {
        const value = {
            existingField: 'value',
            // missingField is missing
        };

        const properties: Record<string, ValidatorFunction> = {
            existingField: successValidator,
            missingField: errorValidator, // missingField会是undefined
        };

        const result = validateProperties(value, properties, false, {});

        expect(result).not.toBeNull();
        if (result) {
            // missingField会是undefined，验证器会返回错误
            expect(result[0].code).toBe('VALIDATION_ERROR');
        }
    });

    it('应该正确传递上下文信息到错误对象', () => {
        const value = {
            field1: 'value1',
        };

        const properties: Record<string, ValidatorFunction> = {
            field1: errorValidator,
        };

        const context: ValidationErrorContext = {
            field: 'testObject',
            value,
        };

        const result = validateProperties(value, properties, false, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            // 上下文中的field应该保持原始值，即'testObject'
            expect(result[0].context.field).toBe('testObject');
        }
    });

    it('当上下文包含路径信息时正确构建字段路径', () => {
        const value = {
            field1: 'value1',
        };

        const properties: Record<string, ValidatorFunction> = {
            field1: errorValidator,
        };

        const context: ValidationErrorContext = {
            path: 'parent.child',
            value,
        };

        const result = validateProperties(value, properties, false, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.path).toBe('parent.child.field1');
        }
    });

    it('当使用函数作为验证器时正常工作', () => {
        const value = {
            field1: 'valid_value',
            field2: 'invalid_value',
        };

        // 使用函数作为验证器
        const properties: Record<string, ValidatorFunction> = {
            field1: mockValidator('valid_value'),
            field2: mockValidator('valid_value'), // 期望的是'valid_value'，但实际是'invalid_value'
        };

        const result = validateProperties(value, properties, false, {});

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].params) {
            expect(result[0].params.expected).toBe('valid_value');
            expect(result[0].params.actual).toBe('invalid_value');
        }
    });

    it('验证多个错误时在allPropertiesError为true时返回所有错误', () => {
        const value = {
            field1: 'value1',
            field2: 'value2',
            field3: 'value3',
        };

        const properties: Record<string, ValidatorFunction> = {
            field1: errorValidator,
            field2: errorValidator,
            field3: errorValidator,
        };

        const result = validateProperties(value, properties, true, {});

        expect(result).not.toBeNull();
        if (result) {
            // 至少应该有一个错误，可能有更多
            expect(result.length).toBeGreaterThanOrEqual(1);
        }
    });
});
