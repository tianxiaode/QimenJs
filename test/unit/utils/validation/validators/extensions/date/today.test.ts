import { validateDateToday, ValidationErrorContext } from '@/utils';

describe('validateDateToday函数测试', () => {
    it('当日期是今天时验证通过', () => {
        const today = new Date();

        const result = validateDateToday(today, {}, {});

        expect(result).toBeNull();
    });

    it('当日期是昨天时验证失败', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const result = validateDateToday(yesterday, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('today');
        }
    });

    it('当日期是明天时验证失败', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = validateDateToday(tomorrow, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('today');
        }
    });

    it('当输入为日期字符串时验证失败', () => {
        const todayString = new Date().toISOString().split('T')[0]; // 今天的日期字符串

        const result = validateDateToday(todayString, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入为时间戳时验证失败', () => {
        const timestamp = Date.now(); // 当前时间戳

        const result = validateDateToday(timestamp, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入无效日期字符串时验证失败', () => {
        const invalidDateString = 'not-a-date';

        const result = validateDateToday(invalidDateString, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入null时验证失败', () => {
        const result = validateDateToday(null, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入undefined时验证失败', () => {
        const result = validateDateToday(undefined, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            // 基础验证会先检查required，所以会返回VALIDATION_REQUIRED
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('应该正确传递上下文信息', () => {
        const today = new Date();
        const context: ValidationErrorContext = { field: 'testField', value: today };

        const result = validateDateToday(today, {}, context);

        expect(result).toBeNull();
    });

    it('当输入过去日期时返回正确的错误上下文', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5); // 5天前的日期
        const context: ValidationErrorContext = { field: 'testField', value: pastDate };

        const result = validateDateToday(pastDate, {}, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe(pastDate);
        }
    });
});
