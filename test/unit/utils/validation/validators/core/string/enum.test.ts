import { checkStringEnum } from '@/utils/validation/validators/core/string/enum';
import { ValidationErrorContext, ValidationErrorCode } from '@/utils';

describe('checkStringEnum', () => {
    const mockContext: ValidationErrorContext = {
        field: 'testField',
        value: 'testValue',
        label: 'Test Field',
    };

    describe('当规则中没有定义 enum 属性时', () => {
        it('应该返回 null（跳过验证）', () => {
            const value = 'anyValue';
            const rule = { required: true }; // 没有 enum 属性

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).toBeNull();
        });

        it('应该返回 null（enum 为 undefined）', () => {
            const value = 'anyValue';
            const rule = { enum: undefined };

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).toBeNull();
        });
    });

    describe('当值在允许的枚举列表中时', () => {
        it('应该返回 null（验证通过）', () => {
            const value = 'validValue';
            const rule = { enum: ['validValue', 'anotherValidValue', 'thirdValue'] };

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).toBeNull();
        });

        it('应该返回 null（大小写敏感匹配）', () => {
            const value = 'ValidValue';
            const rule = { enum: ['ValidValue', 'anotherValidValue'] };

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).toBeNull();
        });

        it('应该返回 null（值为 null 且枚举中包含 null）', () => {
            const value = null;
            const rule = { enum: ['validValue', 'anotherValidValue', null as any] };

            const result = checkStringEnum(value as any, rule, mockContext);

            expect(result).toBeNull(); // 这是实际行为
        });

        it('应该返回 null（值为 undefined 且枚举中包含 undefined）', () => {
            const value = undefined;
            const rule = { enum: ['validValue', 'anotherValidValue', undefined as any] };

            const result = checkStringEnum(value as any, rule, mockContext);

            expect(result).toBeNull(); // 这是实际行为
        });
    });

    describe('当值不在允许的枚举列表中时', () => {
        it('应该返回 not_allowed 错误', () => {
            const value = 'invalidValue';
            const allowedValues = ['validValue', 'anotherValidValue'];
            const rule = { enum: allowedValues };

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).not.toBeNull();
            expect(result!.code).toBe(ValidationErrorCode.NOT_ALLOWED);
            expect(result!.params).toEqual({
                value: 'invalidValue',
                allowedValues: ['validValue', 'anotherValidValue'],
            });
            expect(result!.context).toBe(mockContext);
        });

        it('应该返回 not_allowed 错误（空字符串值）', () => {
            const value = '';
            const rule = { enum: ['validValue', 'anotherValidValue'] };

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).not.toBeNull();
            expect(result!.code).toBe(ValidationErrorCode.NOT_ALLOWED);
            expect(result!.params).toEqual({
                value: '',
                allowedValues: ['validValue', 'anotherValidValue'],
            });
        });

        it('应该返回 not_allowed 错误（值为 null 但枚举中不包含 null）', () => {
            const value = null as any;
            const rule = { enum: ['validValue', 'anotherValidValue'] }; // 不包含 null

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).not.toBeNull();
            expect(result!.code).toBe(ValidationErrorCode.NOT_ALLOWED);
            expect(result!.params).toEqual({
                value: null,
                allowedValues: ['validValue', 'anotherValidValue'],
            });
        });

        it('应该返回 not_allowed 错误（值为 undefined 但枚举中不包含 undefined）', () => {
            const value = undefined as any;
            const rule = { enum: ['validValue', 'anotherValidValue'] }; // 不包含 undefined

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).not.toBeNull();
            expect(result!.code).toBe(ValidationErrorCode.NOT_ALLOWED);
            expect(result!.params).toEqual({
                value: undefined,
                allowedValues: ['validValue', 'anotherValidValue'],
            });
        });
    });

    describe('边界情况', () => {
        it('应该正确处理空数组的 enum', () => {
            const value = 'anyValue';
            const rule = { enum: [] };

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).not.toBeNull();
            expect(result!.code).toBe(ValidationErrorCode.NOT_ALLOWED);
            expect(result!.params).toEqual({
                value: 'anyValue',
                allowedValues: [],
            });
        });

        it('应该正确处理单个值的 enum', () => {
            const value = 'singleValue';
            const rule = { enum: ['singleValue'] };

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).toBeNull();
        });

        it('应该正确处理单个值的 enum（不匹配的情况）', () => {
            const value = 'differentValue';
            const rule = { enum: ['singleValue'] };

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).not.toBeNull();
            expect(result!.code).toBe(ValidationErrorCode.NOT_ALLOWED);
            expect(result!.params).toEqual({
                value: 'differentValue',
                allowedValues: ['singleValue'],
            });
        });

        it('应该忽略上下文参数为 undefined 的情况', () => {
            const value = 'invalidValue';
            const rule = { enum: ['validValue'] };

            const result = checkStringEnum(value, rule, undefined);

            expect(result).not.toBeNull();
            expect(result!.code).toBe(ValidationErrorCode.NOT_ALLOWED);
            expect(result!.params).toEqual({
                value: 'invalidValue',
                allowedValues: ['validValue'],
            });
            expect(result!.context).toBeUndefined();
        });
    });

    describe('类型安全', () => {
        it('应该正确处理非字符串值（不匹配）', () => {
            const value = 123 as any;
            const rule = { enum: ['validValue', '123'] };

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).not.toBeNull();
            expect(result!.code).toBe(ValidationErrorCode.NOT_ALLOWED);
            expect(result!.params).toEqual({
                value: 123,
                allowedValues: ['validValue', '123'],
            });
        });

        it('应该正确处理非字符串值（匹配）', () => {
            const value = 123 as any;
            const rule = { enum: ['validValue', 123 as any] }; // 包含数字 123

            const result = checkStringEnum(value, rule, mockContext);

            expect(result).toBeNull(); // 这是实际行为
        });
    });
});
