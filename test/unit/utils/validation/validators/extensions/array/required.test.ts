import { validateRequiredArray } from '@/utils/validation/validators/extensions/array/required';
import { ValidationErrorContext } from '@/utils/validation/core';

describe('validateRequiredArray函数测试', () => {
    it('当值是数组时验证通过', () => {
        const result = validateRequiredArray([], {}, {});

        expect(result).toBeNull();
    });

    it('当值是非空数组时验证通过', () => {
        const result = validateRequiredArray([1, 2, 3], {}, {});

        expect(result).toBeNull();
    });

    it('当值不是数组时验证失败', () => {
        const result = validateRequiredArray('not-an-array', {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('array');
        }
    });

    it('当值为null时验证失败', () => {
        const result = validateRequiredArray(null, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            // 根据validateRequiredArray的实现，它将nullable设置为false
            // 所以当值为null时，会触发VALIDATION_INVALID_VALUE错误
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当值为undefined时验证失败', () => {
        const result = validateRequiredArray(undefined, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当值是空数组且指定了minLength规则时验证失败', () => {
        const result = validateRequiredArray(
            [],
            {
                minLength: 1, // 空数组长度为0，小于minLength: 1
            },
            {}
        );

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TOO_SMALL');
            expect(result[0].params?.min).toBe(1);
            expect(result[0].params?.value).toBe(0);
        }
    });

    it('当值是非空数组且符合其他数组规则时验证通过', () => {
        const result = validateRequiredArray(
            [1, 2],
            {
                minLength: 1,
                maxLength: 5,
            },
            {}
        );

        expect(result).toBeNull();
    });

    it('当值是非空数组但不符合其他数组规则时验证失败', () => {
        const result = validateRequiredArray(
            [1, 2, 3],
            {
                maxLength: 2, // 数组长度超过限制
            },
            {}
        );

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TOO_LARGE');
            expect(result[0].params?.max).toBe(2);
            expect(result[0].params?.value).toBe(3);
        }
    });

    it('应该正确传递上下文信息', () => {
        const context: ValidationErrorContext = { field: 'testField', value: [] };

        const result = validateRequiredArray([], {}, context);

        expect(result).toBeNull();
    });

    it('当验证失败时应该正确传递错误上下文', () => {
        const context: ValidationErrorContext = { field: 'testField', value: 'not-an-array' };

        const result = validateRequiredArray('not-an-array', {}, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe('not-an-array');
        }
    });

    it('当值是数组且包含子元素验证规则时验证通过', () => {
        const result = validateRequiredArray(
            [1, 2, 3],
            {
                childRule: {
                    type: 'number'
                }
            },
            {}
        );

        expect(result).toBeNull();
    });

    it('当值是数组但包含不符合子元素验证规则的元素时验证失败', () => {
        const result = validateRequiredArray(
            [1, 'not-a-number', 3],
            {
                childRule: {
                    type: 'number'
                }
            },
            {}
        );

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });
});