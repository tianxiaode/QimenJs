import { createCoreValidator, preprocessRequiredRule } from '@/validation/validators/core/factory';
import { ValidationErrorContext, CheckFunction } from '@/validation';
import { ValidationErrorCode } from '@/validation/errors/codes';

// 模拟验证函数
const mockValidator1: CheckFunction = (value, rule, context) => {
    if (value === 'invalid1' || value === 'fail') {
        return { code: 'ERROR1', params: { value }, context };
    }
    return null;
};

const mockValidator2: CheckFunction = (value, rule, context) => {
    if (value === 'invalid2' || value === 'fail') {
        return { code: 'ERROR2', params: { value }, context };
    }
    return null;
};

const mockValidatorAlwaysError: CheckFunction = (value, rule, context) => {
    return { code: 'ALWAYS_ERROR', params: { value }, context };
};

describe('createCoreValidator', () => {
    describe('基本验证功能', () => {
        it('应该返回一个验证函数', () => {
            const validator = createCoreValidator(() => {}, [mockValidator1], []);
            expect(typeof validator).toBe('function');
        });

        it('当所有验证器都通过时，应该返回 null', () => {
            const validator = createCoreValidator((_rule: any) => _rule, [], [mockValidator2]);
            const result = validator('valid', {}, {});
            expect(result).toBeNull();
        });

        it('当一个验证器失败时，应该返回错误数组', () => {
            const validator = createCoreValidator((_rule: any) => _rule, [], [mockValidator2]);
            const result = validator('invalid2', {}, {});
            expect(result).toEqual([
                { code: 'ERROR2', params: { value: 'invalid2' }, context: {} },
            ]);
        });

        it('当多个验证器都失败时，应该返回所有错误', () => {
            const validator = createCoreValidator((_rule: any) => _rule, [], [mockValidator1, mockValidator2]);
            const result = validator('fail', {}, {}); // 'fail' 会触发两个验证器都失败
            expect(result).toEqual([
                { code: 'ERROR1', params: { value: 'fail' }, context: {} },
                { code: 'ERROR2', params: { value: 'fail' }, context: {} },
            ]);
        });
    });

    describe('错误收集', () => {
        it('应该收集同一类别的验证器的错误', () => {
            const validator = createCoreValidator((_rule: any) => _rule, [], [mockValidatorAlwaysError, mockValidatorAlwaysError]);
            const result = validator('test', {}, {});
            expect(result).toHaveLength(2);
            expect(result![0].code).toBe('ALWAYS_ERROR');
            expect(result![1].code).toBe('ALWAYS_ERROR');
        });

        it('不应该因为同一类别内一个验证失败而中断后续验证', () => {
            const callOrder: string[] = [];

            const firstValidator: CheckFunction = (value, rule, context) => {
                callOrder.push('first');
                if (value === 'fail') {
                    return { code: 'FIRST_ERROR', params: { value }, context };
                }
                return null;
            };

            const secondValidator: CheckFunction = (value, rule, context) => {
                callOrder.push('second');
                if (value === 'fail') {
                    return { code: 'SECOND_ERROR', params: { value }, context };
                }
                return null;
            };

            const validator = createCoreValidator((_rule: any) => _rule, [], [firstValidator, secondValidator]);
            const result = validator('fail', {}, {});

            // 验证两个验证器都被调用了
            expect(callOrder).toEqual(['first', 'second']);
            expect(result).toHaveLength(2);
        });
    });

    describe('短路行为', () => {
        it('当 gates 验证器返回错误时，应该短路后续验证', () => {
            const callOrder: string[] = [];

            const gateValidator: CheckFunction = (value, rule, context) => {
                callOrder.push('gate');
                // 返回一个会导致短路的错误
                if (value === 'short_circuit') {
                    return { code: ValidationErrorCode.TYPE_MISMATCH, params: { value }, context };
                }
                return null;
            };

            const regularValidator: CheckFunction = (value, rule, context) => {
                callOrder.push('regular');
                return null; // 不会执行到这里
            };

            const validator = createCoreValidator(
                (_rule: any) => _rule, 
                [gateValidator],  // gates 验证器
                [regularValidator]  // 普通验证器
            );
            
            const result = validator('short_circuit', {}, {});

            // 验证只有 gates 验证器被调用了
            expect(callOrder).toEqual(['gate']);
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.TYPE_MISMATCH);
        });

        it('当 gates 验证器返回任何错误时，都应该短路后续验证', () => {
            const callOrder: string[] = [];

            const gateValidator: CheckFunction = (value, rule, context) => {
                callOrder.push('gate');
                if (value === 'any_error') {
                    return { code: ValidationErrorCode.INVALID_VALUE, params: { value }, context };
                }
                return null;
            };

            const regularValidator: CheckFunction = (value, rule, context) => {
                callOrder.push('regular');
                return { code: ValidationErrorCode.TOO_LARGE, params: { value }, context };
            };

            const validator = createCoreValidator(
                (_rule: any) => _rule, 
                [gateValidator],  // gates 验证器
                [regularValidator]  // 普通验证器
            );
            
            const result = validator('any_error', {}, {});

            // 验证只有 gates 验证器被调用了，因为gates验证器的任何错误都会短路
            expect(callOrder).toEqual(['gate']);
            expect(result).toHaveLength(1);
            expect(result![0].code).toBe(ValidationErrorCode.INVALID_VALUE);
        });
    });

    describe('子元素处理', () => {
        it('应该调用 handleChildren 函数（如果提供）', () => {
            const mockHandleChildren = jest
                .fn()
                .mockReturnValue([
                    { code: 'CHILD_ERROR', params: { value: 'child' }, context: {} },
                ]);

            const validator = createCoreValidator((_rule: any) => _rule, [mockValidator1], [mockValidator2], mockHandleChildren);
            const result = validator('valid', {}, { field: 'parent' });

            expect(mockHandleChildren).toHaveBeenCalledWith('valid', {}, { field: 'parent' });
            expect(result).toEqual([
                { code: 'CHILD_ERROR', params: { value: 'child' }, context: {} },
            ]);
        });

        it('应该合并验证器错误和子元素错误', () => {
            const mockHandleChildren = jest
                .fn()
                .mockReturnValue([
                    { code: 'CHILD_ERROR', params: { value: 'child' }, context: {} },
                ]);

            const validator = createCoreValidator((_rule: any) => _rule, [], [mockValidator1, mockValidator2], mockHandleChildren);
            const result = validator('invalid1', {}, { field: 'parent' });

            expect(result).toEqual([
                { code: 'ERROR1', params: { value: 'invalid1' }, context: { "field": "parent"} },
                { code: 'CHILD_ERROR', params: { value: 'child' }, context: {} },
            ]);
        });

        it('当验证器和子元素都有错误时，应该合并所有错误', () => {
            const mockHandleChildren = jest
                .fn()
                .mockReturnValue([
                    { code: 'CHILD_ERROR', params: { value: 'child' }, context: {} },
                ]);

            const validator = createCoreValidator((_rule: any) => _rule, [], [mockValidatorAlwaysError], mockHandleChildren);
            const result = validator('test', {}, { field: 'parent' });
            const allwaysError = result?.find((error) => error.code === 'ALWAYS_ERROR');

            expect(result).toEqual([
                { code: 'ALWAYS_ERROR', params: { value: 'test' }, context: { field: 'parent'} },
                { code: 'CHILD_ERROR', params: { value: 'child' }, context: {} },
            ]);
        });
    });

    describe('上下文传递', () => {
        it('应该将上下文传递给验证器', () => {
            const context: ValidationErrorContext = { field: 'testField', value: 'testValue' };

            const validatorWithContext: CheckFunction = (value, rule, ctx) => {
                if (ctx?.field === 'testField') {
                    return { code: 'CONTEXT_ERROR', params: { value }, context: ctx };
                }
                return null;
            };

            const validator = createCoreValidator((_rule: any) => _rule, [validatorWithContext], []);
            const result = validator('anyValue', {}, context);

            expect(result).toEqual([
                { code: 'CONTEXT_ERROR', params: { value: 'anyValue' }, context },
            ]);
        });

        it('应该将上下文传递给 handleChildren 函数', () => {
            const context: ValidationErrorContext = { field: 'testField', value: 'testValue' };
            const mockHandleChildren = jest.fn().mockReturnValue(null);

            const validator = createCoreValidator((_rule: any) => _rule, [mockValidator1], [], mockHandleChildren);
            validator('valid', {}, context);

            expect(mockHandleChildren).toHaveBeenCalledWith('valid', {}, context);
        });
    });

    describe('边缘情况', () => {
        it('应该处理空验证器数组', () => {
            const validator = createCoreValidator((_rule: any) => _rule, [], []);
            const result = validator('anyValue', {}, {});
            expect(result).toBeNull();
        });

        it('应该处理 handleChildren 返回 null 的情况', () => {
            const mockHandleChildren = jest.fn().mockReturnValue(null);

            const validator = createCoreValidator((_rule: any) => _rule, [mockValidator1], [], mockHandleChildren);
            const result = validator('valid', {}, {});

            expect(result).toBeNull();
        });

        it('应该处理验证器返回 null 的情况', () => {
            const nullValidator: CheckFunction = (value, rule, context) => null;

            const validator = createCoreValidator((_rule: any) => _rule, [nullValidator], []);
            const result = validator('anyValue', {}, {});

            expect(result).toBeNull();
        });
    });
});

describe('preprocessRequiredRule', () => {
    it('当 requiresValueCheck 返回 true 时，应该设置 required: true 和 nullable: false', () => {
        const rule = { minLength: 5 };
        const requiresValueCheck = (r: any) => r.minLength !== undefined;
        const result = preprocessRequiredRule(rule, requiresValueCheck);

        expect(result).toEqual({ ...rule, required: true, nullable: false });
    });

    it('当 requiresValueCheck 返回 false 时，应该返回原始规则', () => {
        const rule = { someOtherOption: 'value' };
        const requiresValueCheck = (r: any) => r.minLength !== undefined;
        const result = preprocessRequiredRule(rule, requiresValueCheck);

        expect(result).toBe(rule); // 引用相同，表示没有修改
    });

    it('应该保留原始规则的其他属性', () => {
        const rule = { minLength: 5, customMessage: 'Custom error' };
        const requiresValueCheck = (r: any) => r.minLength !== undefined;
        const result = preprocessRequiredRule(rule, requiresValueCheck);

        expect(result).toEqual({
            minLength: 5,
            customMessage: 'Custom error',
            required: true,
            nullable: false,
        });
    });
});