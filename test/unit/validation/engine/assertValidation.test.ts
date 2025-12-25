import { assertValidation } from '@/validation/engine/assert';
import { Validator, ValidationErrorContext, ValidationErrorBuilder } from '@/validation/core';

// Mock Validator.executeValidator 方法
jest.mock('@/validation/core', () => {
    const originalModule = jest.requireActual('@/validation/core');
    
    return {
        ...originalModule,
        Validator: {
            ...originalModule.Validator,
            executeValidator: jest.fn(),
        },
        ValidationErrorBuilder: {
            ...originalModule.ValidationErrorBuilder,
            throwIfAny: jest.fn(),
        }
    };
});

describe('assertValidation 函数测试', () => {
    beforeEach(() => {
        // 重置所有 mock
        (Validator.executeValidator as jest.Mock).mockClear();
        (ValidationErrorBuilder.throwIfAny as jest.Mock).mockClear();
    });

    it('当验证通过时应该返回 null', () => {
        // 模拟验证通过的情况
        (Validator.executeValidator as jest.Mock).mockReturnValue(null);

        const result = assertValidation('test value', { required: true });

        expect(Validator.executeValidator).toHaveBeenCalledWith(
            'test value',
            { required: true },
            {}
        );
        expect(ValidationErrorBuilder.throwIfAny).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    it('当验证通过时应该返回 null (空数组情况)', () => {
        // 模拟验证通过的情况，返回空数组
        (Validator.executeValidator as jest.Mock).mockReturnValue([]);

        const result = assertValidation('test value', { required: true });

        expect(Validator.executeValidator).toHaveBeenCalledWith(
            'test value',
            { required: true },
            {}
        );
        expect(ValidationErrorBuilder.throwIfAny).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    it('当验证失败时应该调用 ValidationErrorBuilder.throwIfAny', () => {
        const mockErrors = [
            { code: 'VALIDATION_ERROR', params: { message: 'Test error' }, context: {} }
        ];
        
        // 模拟验证失败的情况
        (Validator.executeValidator as jest.Mock).mockReturnValue(mockErrors);

        assertValidation('test value', { required: true });

        expect(Validator.executeValidator).toHaveBeenCalledWith(
            'test value',
            { required: true },
            {}
        );
        expect(ValidationErrorBuilder.throwIfAny).toHaveBeenCalledWith(
            'test value',
            { required: true },
            mockErrors,
            {}
        );
    });

    it('应该正确传递上下文信息', () => {
        const mockContext: ValidationErrorContext = { field: 'testField', label: 'Test Label' };
        const mockErrors = [
            { code: 'VALIDATION_ERROR', params: { message: 'Test error' }, context: mockContext }
        ];
        
        // 模拟验证失败的情况
        (Validator.executeValidator as jest.Mock).mockReturnValue(mockErrors);

        assertValidation('test value', { required: true }, mockContext);

        expect(Validator.executeValidator).toHaveBeenCalledWith(
            'test value',
            { required: true },
            mockContext
        );
        expect(ValidationErrorBuilder.throwIfAny).toHaveBeenCalledWith(
            'test value',
            { required: true },
            mockErrors,
            mockContext
        );
    });

    it('应该正确处理 falsy 验证结果', () => {
        // 测试 undefined 结果
        (Validator.executeValidator as jest.Mock).mockReturnValue(undefined);

        const result = assertValidation('test value', { required: true });
        expect(result).toBeNull();
        expect(ValidationErrorBuilder.throwIfAny).not.toHaveBeenCalled();

        // 重置并测试 null 结果
        (Validator.executeValidator as jest.Mock).mockReturnValue(null);

        const result2 = assertValidation('test value', { required: true });
        expect(result2).toBeNull();
        expect(ValidationErrorBuilder.throwIfAny).not.toHaveBeenCalled();
    });

    it('当验证失败时应该抛出异常（通过 ValidationErrorBuilder.throwIfAny）', () => {
        const mockError = new Error('Validation failed');
        const mockErrors = [
            { code: 'VALIDATION_ERROR', params: { message: 'Test error' }, context: {} }
        ];
        
        // 模拟验证失败的情况
        (Validator.executeValidator as jest.Mock).mockReturnValue(mockErrors);
        (ValidationErrorBuilder.throwIfAny as jest.Mock).mockImplementation(() => {
            throw mockError;
        });

        expect(() => {
            assertValidation('invalid value', { required: true });
        }).toThrow(mockError);

        expect(Validator.executeValidator).toHaveBeenCalledWith(
            'invalid value',
            { required: true },
            {}
        );
        expect(ValidationErrorBuilder.throwIfAny).toHaveBeenCalledWith(
            'invalid value',
            { required: true },
            mockErrors,
            {}
        );
    });
});