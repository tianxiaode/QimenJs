import { validateDateYesterday, ValidationErrorContext } from '@/validation';

describe('validateDateYesterday函数测试', () => {
    it('当日期是昨天时验证通过', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const result = validateDateYesterday(yesterday, {}, {});

        expect(result).toBeNull();
    });

    it('当日期是今天时验证失败', () => {
        const today = new Date();

        const result = validateDateYesterday(today, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('yesterday');
        }
    });

    it('当日期是前天时验证失败', () => {
        const dayBeforeYesterday = new Date();
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

        const result = validateDateYesterday(dayBeforeYesterday, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('yesterday');
        }
    });

    it('当输入为日期字符串时验证失败', () => {
        const yesterdayString = new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]; // 昨天的日期字符串

        const result = validateDateYesterday(yesterdayString, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入为时间戳时验证失败', () => {
        const timestamp = Date.now() - 24 * 60 * 60 * 1000; // 昨天的时间戳

        const result = validateDateYesterday(timestamp, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入无效日期字符串时验证失败', () => {
        const invalidDateString = 'not-a-date';

        const result = validateDateYesterday(invalidDateString, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入null时验证失败', () => {
        const result = validateDateYesterday(null, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入undefined时验证失败', () => {
        const result = validateDateYesterday(undefined, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('应该正确传递上下文信息', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const context: ValidationErrorContext = { field: 'testField', value: yesterday };

        const result = validateDateYesterday(yesterday, {}, context);

        expect(result).toBeNull();
    });

    it('当输入今天日期时返回正确的错误上下文', () => {
        const today = new Date();
        const context: ValidationErrorContext = { field: 'testField', value: today };

        const result = validateDateYesterday(today, {}, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe(today);
        }
    });
});
