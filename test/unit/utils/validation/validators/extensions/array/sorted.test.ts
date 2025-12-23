import { validateSorted, ValidationErrorContext } from '@/utils';

describe('validateSorted函数测试', () => {
    it('当数组按升序排列时验证通过', () => {
        const result = validateSorted([1, 2, 3, 4], { sorted: 'asc' }, {});

        expect(result).toBeNull();
    });

    it('当数组按降序排列时验证通过', () => {
        const result = validateSorted([4, 3, 2, 1], { sorted: 'desc' }, {});

        expect(result).toBeNull();
    });

    it('当数组未按升序排列时验证失败', () => {
        const result = validateSorted([3, 1, 2], { sorted: 'asc' }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('sorted array');
        }
    });

    it('当数组未按降序排列时验证失败', () => {
        const result = validateSorted([1, 3, 2], { sorted: 'desc' }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('sorted array');
        }
    });

    it('当数组为空时验证通过', () => {
        const result = validateSorted([], { sorted: 'asc' }, {});

        expect(result).toBeNull();
    });

    it('当数组只有一个元素时验证通过', () => {
        const result = validateSorted([5], { sorted: 'asc' }, {});

        expect(result).toBeNull();
    });

    it('当数组按升序排列包含相同元素时验证通过', () => {
        const result = validateSorted([1, 2, 2, 3], { sorted: 'asc' }, {});

        expect(result).toBeNull();
    });

    it('当数组按降序排列包含相同元素时验证通过', () => {
        const result = validateSorted([3, 2, 2, 1], { sorted: 'desc' }, {});

        expect(result).toBeNull();
    });

    it('当使用自定义比较函数且数组排序正确时验证通过', () => {
        const compareFn = (a: number, b: number) => a - b; // 升序
        const result = validateSorted([1, 2, 3, 4], { sorted: compareFn }, {});

        expect(result).toBeNull();
    });

    it('当使用自定义比较函数且数组排序错误时验证失败', () => {
        const compareFn = (a: number, b: number) => a - b; // 升序
        const result = validateSorted([4, 3, 2, 1], { sorted: compareFn }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('sorted array');
        }
    });

    it('当值不是数组时验证失败', () => {
        const result = validateSorted('not-an-array', { sorted: 'asc' }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('array');
        }
    });

    it('当值为null时验证失败', () => {
        const result = validateSorted(null, { sorted: 'asc' }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当值为undefined时验证失败', () => {
        const result = validateSorted(undefined, { sorted: 'asc' }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('应该正确传递上下文信息', () => {
        const context: ValidationErrorContext = { field: 'testField', value: [1, 2, 3] };

        const result = validateSorted([1, 2, 3], { sorted: 'asc' }, context);

        expect(result).toBeNull();
    });

    it('当验证失败时应该正确传递错误上下文', () => {
        const context: ValidationErrorContext = { field: 'testField', value: [3, 1, 2] };

        const result = validateSorted([3, 1, 2], { sorted: 'asc' }, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toEqual([3, 1, 2]);
        }
    });
});
