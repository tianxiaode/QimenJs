import { validateDateTomorrow, ValidationErrorContext } from '@/validation';

describe('validateDateTomorrow函数测试', () => {
    it('当日期是明天时验证通过', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = validateDateTomorrow(tomorrow, {}, {});

        expect(result).toBeNull();
    });

    it('当日期是今天时验证失败', () => {
        const today = new Date();

        const result = validateDateTomorrow(today, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('tomorrow');
        }
    });

    it('当日期是后天时验证失败', () => {
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

        const result = validateDateTomorrow(dayAfterTomorrow, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('tomorrow');
        }
    });

    it('当输入为日期字符串时验证失败', () => {
        const tomorrowString = new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]; // 明天的日期字符串

        const result = validateDateTomorrow(tomorrowString, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入为时间戳时验证失败', () => {
        const timestamp = Date.now() + 24 * 60 * 60 * 1000; // 明天的时间戳

        const result = validateDateTomorrow(timestamp, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入无效日期字符串时验证失败', () => {
        const invalidDateString = 'not-a-date';

        const result = validateDateTomorrow(invalidDateString, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入null时验证失败', () => {
        const result = validateDateTomorrow(null, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入undefined时验证失败', () => {
        const result = validateDateTomorrow(undefined, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('应该正确传递上下文信息', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const context: ValidationErrorContext = { field: 'testField', value: tomorrow };

        const result = validateDateTomorrow(tomorrow, {}, context);

        expect(result).toBeNull();
    });

    it('当输入今天日期时返回正确的错误上下文', () => {
        const today = new Date();
        const context: ValidationErrorContext = { field: 'testField', value: today };

        const result = validateDateTomorrow(today, {}, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe(today);
        }
    });
});
