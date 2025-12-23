import { createCoreValidator } from '@/utils/validation/validators/core/factory';
import { ValidationErrorContext, CheckFunction } from '@/utils';

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
            const validator = createCoreValidator([mockValidator1]);
            expect(typeof validator).toBe('function');
        });

        it('当所有验证器都通过时，应该返回 null', () => {
            const validator = createCoreValidator([mockValidator1, mockValidator2]);
            const result = validator('valid', {}, {});
            expect(result).toBeNull();
        });

        it('当一个验证器失败时，应该返回错误数组', () => {
            const validator = createCoreValidator([mockValidator1, mockValidator2]);
            const result = validator('invalid1', {}, {});
            expect(result).toEqual([
                { code: 'ERROR1', params: { value: 'invalid1' }, context: {} },
            ]);
        });

        it('当多个验证器都失败时，应该返回所有错误', () => {
            const validator = createCoreValidator([mockValidator1, mockValidator2]);
            const result = validator('fail', {}, {});
            expect(result).toEqual([
                { code: 'ERROR1', params: { value: 'fail' }, context: {} },
                { code: 'ERROR2', params: { value: 'fail' }, context: {} },
            ]);
        });
    });

    describe('错误收集', () => {
        it('应该收集所有验证器的错误', () => {
            const validator = createCoreValidator([
                mockValidatorAlwaysError,
                mockValidatorAlwaysError,
            ]);
            const result = validator('test', {}, {});
            expect(result).toHaveLength(2);
            expect(result![0].code).toBe('ALWAYS_ERROR');
            expect(result![1].code).toBe('ALWAYS_ERROR');
        });

        it('不应该因为一个验证失败而中断后续验证', () => {
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

            const validator = createCoreValidator([firstValidator, secondValidator]);
            const result = validator('fail', {}, {});

            // 验证两个验证器都被调用了
            expect(callOrder).toEqual(['first', 'second']);
            expect(result).toHaveLength(2);
        });
    });

    describe('子元素处理', () => {
        it('应该调用 handleChildren 函数（如果提供）', () => {
            const mockHandleChildren = jest
                .fn()
                .mockReturnValue([
                    { code: 'CHILD_ERROR', params: { value: 'child' }, context: {} },
                ]);

            const validator = createCoreValidator([mockValidator1], mockHandleChildren);
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

            const validator = createCoreValidator([mockValidator1], mockHandleChildren);
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

            const validator = createCoreValidator([mockValidatorAlwaysError], mockHandleChildren);
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

            const validator = createCoreValidator([validatorWithContext]);
            const result = validator('anyValue', {}, context);

            expect(result).toEqual([
                { code: 'CONTEXT_ERROR', params: { value: 'anyValue' }, context },
            ]);
        });

        it('应该将上下文传递给 handleChildren 函数', () => {
            const context: ValidationErrorContext = { field: 'testField', value: 'testValue' };
            const mockHandleChildren = jest.fn().mockReturnValue(null);

            const validator = createCoreValidator([mockValidator1], mockHandleChildren);
            validator('valid', {}, context);

            expect(mockHandleChildren).toHaveBeenCalledWith('valid', {}, context);
        });
    });

    describe('边缘情况', () => {
        it('应该处理空验证器数组', () => {
            const validator = createCoreValidator([]);
            const result = validator('anyValue', {}, {});
            expect(result).toBeNull();
        });

        it('应该处理 handleChildren 返回 null 的情况', () => {
            const mockHandleChildren = jest.fn().mockReturnValue(null);

            const validator = createCoreValidator([mockValidator1], mockHandleChildren);
            const result = validator('valid', {}, {});

            expect(result).toBeNull();
        });

        it('应该处理验证器返回 null 的情况', () => {
            const nullValidator: CheckFunction = (value, rule, context) => null;

            const validator = createCoreValidator([nullValidator]);
            const result = validator('anyValue', {}, {});

            expect(result).toBeNull();
        });
    });
});
