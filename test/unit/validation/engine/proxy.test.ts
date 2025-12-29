import { validator, assert, createValidatorProxy, createAssertProxy } from '@/validation/engine/proxy';
import { Validator, ValidationErrorContext } from '@/validation/core';

// Mock Validator.executeValidator 方法，因为我们需要测试代理行为
jest.mock('@/validation/core', () => {
    const originalModule = jest.requireActual('@/validation/core');
    
    return {
        ...originalModule,
        Validator: {
            ...originalModule.Validator,
            executeValidator: jest.fn(),
        }
    };
});

describe('proxy.ts - 验证器代理测试', () => {
    beforeEach(() => {
        // 重置所有 mock
        (Validator.executeValidator as jest.Mock).mockClear();
    });

    describe('validator 代理', () => {
        it('应该能够访问任意验证器方法', () => {
            // 检查是否可以访问一个虚拟的验证器
            expect(validator.anything).toBeDefined();
            expect(typeof validator.anything).toBe('function');
        });

        it('调用验证器方法应该执行 Validator.executeValidator', () => {
            const mockValue = 'test';
            const mockRule = { required: true };
            const mockContext: ValidationErrorContext = { field: 'testField' };
            const mockResult = null; // 假设验证成功
            
            (Validator.executeValidator as jest.Mock).mockReturnValue(mockResult);

            const result = validator.string(mockValue, mockRule, mockContext);

            expect(Validator.executeValidator).toHaveBeenCalledWith(
                mockValue,
                mockRule,
                mockContext
            );
            expect(result).toBe(mockResult);
        });

        it('应该将验证结果返回给调用者', () => {
            const mockValue = 123;
            const mockRule = { min: 10 };
            const mockResult = [{ code: 'VALIDATION_TOO_SMALL', params: { min: 10 }, context: {} }];
            
            (Validator.executeValidator as jest.Mock).mockReturnValue(mockResult);

            const result = validator.number(mockValue, mockRule);

            expect(Validator.executeValidator).toHaveBeenCalledWith(
                mockValue,
                mockRule,
                {}
            );
            expect(result).toBe(mockResult);
        });

        it('应该使用默认的空上下文对象如果没有提供context', () => {
            const mockValue = 'test';
            const mockRule = { required: true };
            const mockResult = null;
            
            (Validator.executeValidator as jest.Mock).mockReturnValue(mockResult);

            const result = validator.string(mockValue, mockRule);

            expect(Validator.executeValidator).toHaveBeenCalledWith(
                mockValue,
                mockRule,
                {}
            );
            expect(result).toBe(mockResult);
        });
    });

    describe('assert 代理', () => {
        it('应该能够访问任意断言方法', () => {
            // 检查是否可以访问一个虚拟的断言
            expect(assert.anything).toBeDefined();
            expect(typeof assert.anything).toBe('function');
        });

        it('调用断言方法应该执行 Validator.executeValidator', () => {
            const mockValue = 'test';
            const mockRule = { required: true };
            const mockContext: ValidationErrorContext = { field: 'testField' };
            const mockResult = null; // 假设验证成功
            
            (Validator.executeValidator as jest.Mock).mockReturnValue(mockResult);

            const result = assert.string(mockValue, mockRule, mockContext);

            expect(Validator.executeValidator).toHaveBeenCalledWith(
                mockValue,
                mockRule,
                mockContext
            );
            expect(result).toBe(mockValue); // 断言成功时返回传入的 value
        });

        it('当验证成功时应该返回传入的值', () => {
            const mockValue = 'test';
            const mockRule = { required: true };
            const mockResult = null; // 验证成功
            
            (Validator.executeValidator as jest.Mock).mockReturnValue(mockResult);

            const result = assert.string(mockValue, mockRule);

            expect(Validator.executeValidator).toHaveBeenCalledWith(
                mockValue,
                mockRule,
                {}
            );
            expect(result).toBe(mockValue);
        });

        it('当验证失败时应该抛出异常', () => {
            const mockValue = 'test';
            const mockRule = { required: true };
            const mockResult = [{ code: 'VALIDATION_ERROR', params: {}, context: {} }]; // 验证失败
            const mockError = new Error('Validation failed');
            
            // 模拟 ValidationErrorBuilder.throwIfAny 的行为
            (Validator.executeValidator as jest.Mock).mockReturnValue(mockResult);

            // 模拟 ValidationErrorBuilder.throwIfAny 抛出异常
            jest.spyOn(require('@/validation/core').ValidationErrorBuilder, 'throwIfAny')
                .mockImplementation(() => {
                    throw mockError;
                });

            expect(() => {
                assert.string(mockValue, mockRule);
            }).toThrow(mockError);

            expect(Validator.executeValidator).toHaveBeenCalledWith(
                mockValue,
                mockRule,
                {}
            );
        });

        it('应该使用默认的空上下文对象如果没有提供context', () => {
            const mockValue = 'test';
            const mockRule = { required: true };
            const mockResult = null;
            
            (Validator.executeValidator as jest.Mock).mockReturnValue(mockResult);

            const result = assert.string(mockValue, mockRule);

            expect(Validator.executeValidator).toHaveBeenCalledWith(
                mockValue,
                mockRule,
                {}
            );
            expect(result).toBe(mockValue);
        });
    });

    describe('createValidatorProxy 函数', () => {
        it('应该能够访问目标对象上的属性', () => {
            const customTarget = {
                customMethod: () => 'custom result'
            };
            
            const customValidator = createValidatorProxy(customTarget);
            
            expect(customValidator.customMethod).toBeDefined();
            expect(customValidator.customMethod).toBe(customTarget.customMethod);
            expect(customValidator.customMethod()).toBe('custom result');
        });

        it('对于不存在于目标对象上的属性，应该返回验证器函数', () => {
            const customTarget = {
                customMethod: () => 'custom result'
            };
            
            const customValidator = createValidatorProxy(customTarget);
            
            expect(customValidator.nonExistentMethod).toBeDefined();
            expect(typeof customValidator.nonExistentMethod).toBe('function');
        });
    });

    describe('createAssertProxy 函数', () => {
        it('应该能够访问目标对象上的属性', () => {
            const customTarget = {
                customMethod: () => 'custom result'
            };
            
            const customAssert = createAssertProxy(customTarget);
            
            expect(customAssert.customMethod).toBeDefined();
            expect(customAssert.customMethod).toBe(customTarget.customMethod);
            expect(customAssert.customMethod()).toBe('custom result');
        });

        it('对于不存在于目标对象上的属性，应该返回断言函数', () => {
            const customTarget = {
                customMethod: () => 'custom result'
            };
            
            const customAssert = createAssertProxy(customTarget);
            
            expect(customAssert.nonExistentMethod).toBeDefined();
            expect(typeof customAssert.nonExistentMethod).toBe('function');
        });
    });
});