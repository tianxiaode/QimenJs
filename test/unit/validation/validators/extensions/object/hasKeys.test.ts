import { ValidationErrorContext, validateHasKeys } from '@/validation';

describe('validateHasKeys函数测试', () => {
    it('当对象包含所有必需键时验证通过', () => {
        const result = validateHasKeys(
            { name: 'John', age: 30 },
            { keys: ['name', 'age'], allErrors: false },
            {}
        );

        expect(result).toBeNull();
    });

    it('当对象包含单个必需键时验证通过', () => {
        const result = validateHasKeys({ name: 'John' }, { keys: 'name', allErrors: false }, {});

        expect(result).toBeNull();
    });

    it('当对象缺少必需键时验证失败', () => {
        const result = validateHasKeys(
            { name: 'John' },
            { keys: ['name', 'age'], allErrors: false },
            {}
        );

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_MISSING_FIELD');
            expect(result[0].params?.field).toBe('age');
        }
    });

    it('当对象缺少单个必需键时验证失败', () => {
        const result = validateHasKeys({ name: 'John' }, { keys: 'age', allErrors: false }, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_MISSING_FIELD');
            expect(result[0].params?.field).toBe('age');
        }
    });

    it('当值不是对象时验证失败', () => {
        const result = validateHasKeys('not an object', { keys: ['name'], allErrors: false }, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当值是null时验证失败', () => {
        const result = validateHasKeys(null, { keys: ['name'], allErrors: false }, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当值是undefined时验证失败', () => {
        const result = validateHasKeys(undefined, { keys: ['name'], allErrors: false }, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当值是数组时验证失败', () => {
        const result = validateHasKeys([], { keys: ['name'], allErrors: false }, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当规则中keys为无效类型时验证失败', () => {
        const result = validateHasKeys(
            { name: 'John' },
            { keys: 123 as any, allErrors: false },
            {}
        );

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].params?.value).toBe('invalid keys');
        }
    });

    it('当规则中keys为空数组时验证通过', () => {
        const result = validateHasKeys({ name: 'John' }, { keys: [], allErrors: false }, {});

        expect(result).toBeNull();
    });

    it('当规则中keys为undefined时验证失败', () => {
        const result = validateHasKeys(
            { name: 'John' },
            { keys: undefined as any, allErrors: false },
            {}
        );

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].params?.value).toBe('invalid keys');
        }
    });

    it('当对象包含所有必需键（包括字符串数字键）时验证通过', () => {
        const result = validateHasKeys(
            { '1': 'first', name: 'John' },
            { keys: ['1', 'name'], allErrors: false },
            {}
        );

        expect(result).toBeNull();
    });

    it('当对象缺少数字键时验证失败', () => {
        const result = validateHasKeys(
            { '2': 'second', name: 'John' },
            { keys: ['1', 'name'], allErrors: false },
            {}
        );

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_MISSING_FIELD');
            expect(result[0].params?.field).toBe('1');
        }
    });

    it('当对象有原型属性但没有自身属性时验证失败', () => {
        const obj = Object.create({ inherited: 'value' });
        obj.ownProp = 'ownValue';

        const result = validateHasKeys(
            obj,
            { keys: ['inherited', 'ownProp'], allErrors: false },
            {}
        );

        // inherited 是原型上的属性，不是对象自身的属性，所以会失败
        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_MISSING_FIELD');
            expect(result[0].params?.field).toBe('inherited');
        }
    });

    it('当allErrors为true且缺少多个键时返回所有错误', () => {
        const result = validateHasKeys(
            { name: 'John' },
            { keys: ['name', 'age', 'email'], allErrors: true },
            {}
        );

        expect(result).not.toBeNull();
        if (result) {
            expect(result.length).toBe(2); // 缺少 age 和 email
            expect(result[0].code).toBe('VALIDATION_MISSING_FIELD');
            expect(result[1].code).toBe('VALIDATION_MISSING_FIELD');
            expect(result.map(r => r.params?.field)).toContain('age');
            expect(result.map(r => r.params?.field)).toContain('email');
        }
    });

    it('当allErrors为false且缺少多个键时只返回第一个错误', () => {
        const result = validateHasKeys(
            { name: 'John' },
            { keys: ['name', 'age', 'email'], allErrors: false },
            {}
        );

        expect(result).not.toBeNull();
        if (result) {
            expect(result.length).toBe(1); // 只返回第一个错误
            expect(result[0].code).toBe('VALIDATION_MISSING_FIELD');
            expect(result[0].params?.field).toBe('age');
        }
    });

    it('应该正确传递上下文信息', () => {
        const context: ValidationErrorContext = { field: 'testField', value: { name: 'John' } };
        const result = validateHasKeys(
            { name: 'John' },
            { keys: 'age', allErrors: false },
            context
        );

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
        }
    });

    it('当验证失败时应该正确传递错误上下文', () => {
        const context: ValidationErrorContext = { field: 'testField', value: { name: 'John' } };
        const result = validateHasKeys(
            { name: 'John' },
            { keys: 'age', allErrors: false },
            context
        );

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
        }
    });
});