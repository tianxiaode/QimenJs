import { checkStringType } from '@/utils/validation/validators/core/string/type';
import {
    ValidationErrorContext,
    ValidationErrorBuilder,
    StringRuleOptions,
    ValidationErrorCode,
} from '@/utils';

describe('checkStringType', () => {
    describe('当值为字符串时', () => {
        it('应返回 null（验证通过）', () => {
            const result = checkStringType('hello', {});
            expect(result).toBeNull();
        });

        it('应处理空字符串', () => {
            const result = checkStringType('', {});
            expect(result).toBeNull();
        });

        it('应处理包含空格的字符串', () => {
            const result = checkStringType(' hello world ', {});
            expect(result).toBeNull();
        });
    });

    describe('当值为 null 或 undefined 时', () => {
        it('应返回 null（验证通过）', () => {
            let result = checkStringType(null, {});
            expect(result).toBeNull();

            result = checkStringType(undefined, {});
            expect(result).toBeNull();
        });
    });

    describe('当值不是字符串类型时', () => {
        it('应返回类型不匹配错误', () => {
            const context: ValidationErrorContext = { field: 'testField', value: 123 };
            const result = checkStringType(123, {}, context);

            expect(result).toEqual(
                ValidationErrorBuilder.type_mismatch('string', typeof 123, context)
            );
        });

        it('应处理数字类型', () => {
            const result = checkStringType(42, {});
            expect(result?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result?.params).toEqual({ expectedType: 'string', actualType: 'number' });
        });

        it('应处理布尔类型', () => {
            const result = checkStringType(true, {});
            expect(result?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result?.params).toEqual({ expectedType: 'string', actualType: 'boolean' });
        });

        it('应处理对象类型', () => {
            const result = checkStringType({}, {});
            expect(result?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result?.params).toEqual({ expectedType: 'string', actualType: 'object' });
        });

        it('应处理数组类型', () => {
            const result = checkStringType([], {});
            expect(result?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result?.params).toEqual({ expectedType: 'string', actualType: 'object' });
        });

        it('应处理函数类型', () => {
            const result = checkStringType(() => {}, {});
            expect(result?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result?.params).toEqual({ expectedType: 'string', actualType: 'function' });
        });

        it('应处理 Symbol 类型', () => {
            const result = checkStringType(Symbol('test'), {});
            expect(result?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result?.params).toEqual({ expectedType: 'string', actualType: 'symbol' });
        });

        it('应处理 BigInt 类型', () => {
            const result = checkStringType(BigInt(123), {});
            expect(result?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result?.params).toEqual({ expectedType: 'string', actualType: 'bigint' });
        });
    });

    describe('错误上下文处理', () => {
        it('应将上下文信息传递给错误构建器', () => {
            const context: ValidationErrorContext = {
                field: 'username',
                value: 123,
                label: '用户名',
                parent: { username: 123 },
            };

            const result = checkStringType(123, {}, context);

            expect(result).toEqual(
                ValidationErrorBuilder.type_mismatch('string', typeof 123, context)
            );
            expect(result?.context).toEqual(context);
        });

        it('应处理 undefined 上下文', () => {
            const result = checkStringType(123, {});
            expect(result?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result?.params).toEqual({ expectedType: 'string', actualType: 'number' });
            expect(result?.context).toBeUndefined();
        });
    });

    describe('规则参数', () => {
        it('应接受并忽略规则参数（因为此验证器不使用规则配置）', () => {
            const ruleOptions: StringRuleOptions = {
                required: true,
                minLength: 5,
                maxLength: 10,
            };

            // 对于字符串，应该通过验证
            const result1 = checkStringType('hello', ruleOptions);
            expect(result1).toBeNull();

            // 对于非字符串，应该返回类型错误
            const result2 = checkStringType(123, ruleOptions);
            expect(result2?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
        });
    });

    describe('边界情况', () => {
        it('应处理 String 对象实例', () => {
            const stringObj = new String('hello');
            const result = checkStringType(stringObj, {});
            // typeof String() 对象实例返回 'object'，不是 'string'
            expect(result?.code).toBe(ValidationErrorCode.TYPE_MISMATCH);
        });

        it('应处理模板字符串', () => {
            const templateStr = `hello world`;
            const result = checkStringType(templateStr, {});
            expect(result).toBeNull();
        });
    });
});
