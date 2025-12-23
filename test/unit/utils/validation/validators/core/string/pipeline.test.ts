import { validateString, ValidationErrorCode } from '@/utils'; // 假设函数在此路径

describe('validateString', () => {
    describe('基本功能测试', () => {
        test('应该接受有效的字符串', () => {
            const result = validateString('hello', {});
            expect(result).toBeNull();
        });

        test('应该拒绝非字符串值', () => {
            const result = validateString(123, {});
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.TYPE_MISMATCH);
        });
    });

    describe('必填性验证', () => {
        test('当 required: true 时应该拒绝 undefined', () => {
            const result = validateString(undefined, { required: true });
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.REQUIRED); // 或者使用 ValidationErrorCode.REQUIRED
        });

        test('当 required: true 时应该接受 null（因为 required 只检查 undefined）', () => {
            const result = validateString(null, { required: true });
            expect(result).toBeNull(); // null 不会被 required 规则拒绝
        });

        test('当 nullable: false 时应该拒绝 null', () => {
            const result = validateString(null, { nullable: false });
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.INVALID_VALUE); // 或者使用 ValidationErrorCode.INVALID_VALUE
        });

        test('当 required: true 且 nullable: false 时应该拒绝 null', () => {
            const result = validateString(null, { required: true, nullable: false });
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.INVALID_VALUE); // null 被 nullable 规则拒绝
        });
    });

    describe('长度验证', () => {
        test('当 minLength 被违反时应该返回错误', () => {
            const result = validateString('hi', { minLength: 5 });
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.TOO_SMALL);
        });

        test('当 maxLength 被违反时应该返回错误', () => {
            const result = validateString('hello world', { maxLength: 5 });
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.TOO_LARGE);
        });

        test('当 exactLength 被违反时应该返回错误', () => {
            const result = validateString('hi', { exactLength: 8 });
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.OUT_OF_RANGE);
        });

        test('当 exactLength 符合时应该接受', () => {
            const result = validateString('testing', { exactLength: 7 });
            expect(result).toBeNull();
        });

        test('exactLength 应该覆盖 minLength 和 maxLength', () => {
            const result = validateString('test', {
                exactLength: 4,
                minLength: 10,
                maxLength: 2,
            });
            expect(result).toBeNull();
        });
    });

    describe('模式验证', () => {
        test('当模式不匹配时应该返回错误', () => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const result = validateString('not-an-email', { pattern: emailPattern });
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
        });

        test('当模式匹配时应该接受', () => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const result = validateString('test@example.com', { pattern: emailPattern });
            expect(result).toBeNull();
        });
    });

    describe('组合验证', () => {
        test('应该同时验证多个规则', () => {
            const result = validateString('', {
                required: true,
                minLength: 5,
                pattern: /^[\w\s]+$/,
            });

            // 验证结果不为 null（即存在错误）
            expect(result).not.toBeNull();

            if (result) {
                // 确保结果是数组且不为空
                expect(Array.isArray(result)).toBe(true);
                expect(result.length).toBeGreaterThan(0);

                // 检查是否包含 TOO_SMALL 错误（因为长度 0 < 5）
                const lengthError = result.find(err => err.code === ValidationErrorCode.TOO_SMALL);
                expect(lengthError).toBeDefined();
            }
        });

        test('应该验证符合所有条件的字符串', () => {
            const result = validateString('Hello World', {
                required: true,
                minLength: 5,
                maxLength: 20,
                pattern: /^[\w\s]+$/,
            });
            expect(result).toBeNull();
        });
    });

    describe('错误上下文', () => {
        test('错误应该包含适当的上下文信息', () => {
            const context = { field: 'username', label: '用户名' };
            const result = validateString(undefined, { required: true }, context);
            expect(result).not.toBeNull();
            expect(result![0].context).toBeDefined();
            expect(result![0].context!.field).toBe('username');
        });
    });
});
