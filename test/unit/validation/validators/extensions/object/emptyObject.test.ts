import { ValidationErrorContext, validateEmptyObject } from '@/validation';

describe('validateEmptyObject函数测试', () => {
    it('当值是空对象时验证失败', () => {
        const result = validateEmptyObject({}, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].params?.value).toBe('empty object');
        }
    });

    it('当值不是对象时验证失败', () => {
        const result = validateEmptyObject('not an object', {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当值是数组时验证失败', () => {
        const result = validateEmptyObject([], {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当值是函数时验证失败', () => {
        const result = validateEmptyObject(() => {}, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当值是非空对象时验证通过', () => {
        const result = validateEmptyObject({ prop: 'value' }, {});

        expect(result).toBeNull();
    });

    it('当值是非空对象且有多个属性时验证通过', () => {
        const result = validateEmptyObject({ prop1: 'value1', prop2: 'value2' }, {});

        expect(result).toBeNull();
    });

    it('当值是非空对象且有数字属性时验证通过', () => {
        const result = validateEmptyObject({ 1: 'value' }, {});

        expect(result).toBeNull();
    });

    it('当值只有Symbol属性时验证失败（因为Object.keys()不返回Symbol键）', () => {
        const sym = Symbol('test');
        const obj = { [sym]: 'value' };
        // 由于Object.keys()不包含Symbol类型的键，所以这个对象被视为"空"对象
        const result = validateEmptyObject(obj, {});

        expect(result).not.toBeNull();
        if (result) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].params?.value).toBe('empty object');
        }
    });

    it('应该正确传递上下文信息', () => {
        const context: ValidationErrorContext = { field: 'testField', value: {} };
        const result = validateEmptyObject({}, {}, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
        }
    });

    it('当验证失败时应该正确传递错误上下文', () => {
        const context: ValidationErrorContext = { field: 'testField', value: {} };
        const result = validateEmptyObject({}, {}, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
        }
    });
});
