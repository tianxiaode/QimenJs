import { BooleanRuleOptions, validateBoolean } from '@/utils';

describe('validateBoolean', () => {
    it('当值为true时验证通过，返回null', () => {
        const value = true;
        const rule: BooleanRuleOptions = {};

        const result = validateBoolean(value, rule);

        expect(result).toBeNull();
    });

    it('当值为false时验证通过，返回null', () => {
        const value = false;
        const rule: BooleanRuleOptions = {};

        const result = validateBoolean(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined且required为true时返回required错误', () => {
        const value = undefined;
        const rule: BooleanRuleOptions = { required: true };

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当值为null且nullable为false时返回invalid_value错误', () => {
        const value = null;
        const rule: BooleanRuleOptions = { nullable: false };

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
    });

    it('当值不是布尔类型时返回type_mismatch错误', () => {
        const value = 'true';
        const rule: BooleanRuleOptions = {};

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('当值是数字时返回type_mismatch错误', () => {
        const value = 1;
        const rule: BooleanRuleOptions = {};

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('当值是对象时返回type_mismatch错误', () => {
        const value = {};
        const rule: BooleanRuleOptions = {};

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('当值为true且在枚举列表中时验证通过', () => {
        const value = true;
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = validateBoolean(value, rule);

        expect(result).toBeNull();
    });

    it('当值为false且在枚举列表中时验证通过', () => {
        const value = false;
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = validateBoolean(value, rule);

        expect(result).toBeNull();
    });

    it('当值为true但不在枚举列表中时返回not_allowed错误', () => {
        const value = true;
        const rule: BooleanRuleOptions = { enum: [false] };

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_NOT_ALLOWED');
    });

    it('当值为false但不在枚举列表中时返回not_allowed错误', () => {
        const value = false;
        const rule: BooleanRuleOptions = { enum: [true] };

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_NOT_ALLOWED');
    });

    it('当值为null且没有设置nullable时验证通过（默认nullable为true）', () => {
        const value = null;
        const rule: BooleanRuleOptions = {};

        const result = validateBoolean(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined且没有设置required时验证通过（默认required为false）', () => {
        const value = undefined;
        const rule: BooleanRuleOptions = {};

        const result = validateBoolean(value, rule);

        expect(result).toBeNull();
    });

    it('当值为null且有其他规则时验证通过（因为默认nullable为true）', () => {
        const value = null;
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = validateBoolean(value, rule);

        expect(result).toBeNull(); // 所有检查都会跳过，因为value是null
    });

    it('当值为undefined且有其他规则时只返回required错误（如果required为true）', () => {
        const value = undefined;
        const rule: BooleanRuleOptions = {
            required: true,
            enum: [true, false],
        };

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当值为undefined但required为false时验证通过', () => {
        const value = undefined;
        const rule: BooleanRuleOptions = {
            required: false,
            enum: [true, false],
        };

        const result = validateBoolean(value, rule);

        expect(result).toBeNull();
    });

    it('当值不是布尔类型时不会执行枚举检查', () => {
        const value = 'not a boolean';
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('当值为数字时不会执行枚举检查', () => {
        const value = 123;
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = validateBoolean(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });
});
