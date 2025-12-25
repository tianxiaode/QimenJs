import { validateDateFuture, ValidationErrorContext } from '@/validation';

describe('validateDateFuture函数测试', () => {
    it('当日期是未来日期时验证通过', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1); // 明天的日期

        const result = validateDateFuture(futureDate, {}, {});

        expect(result).toBeNull();
    });

    it('当日期是今天时验证失败', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 设置时间为0时0分0秒

        const result = validateDateFuture(today, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('future');
        }
    });

    it('当日期是过去日期时验证失败', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // 昨天的日期

        const result = validateDateFuture(pastDate, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('future');
        }
    });

    it('当输入为日期字符串时验证失败', () => {
        const dateString = '2025-12-31'; // 未来日期字符串

        const result = validateDateFuture(dateString, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入为时间戳时验证失败', () => {
        const timestamp = Date.now() + 2 * 24 * 60 * 60 * 1000; // 两天后的毫秒时间戳

        const result = validateDateFuture(timestamp, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入无效日期字符串时验证失败', () => {
        const invalidDateString = 'not-a-date';

        const result = validateDateFuture(invalidDateString, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入null时验证失败', () => {
        const result = validateDateFuture(null, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            // 根据实际行为，null会触发类型不匹配或无效值错误
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入undefined时验证失败', () => {
        const result = validateDateFuture(undefined, {}, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            // 基础验证会先检查required，所以会返回VALIDATION_REQUIRED
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('应该正确传递上下文信息', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5); // 5天后的日期
        const context: ValidationErrorContext = { field: 'testField', value: futureDate };

        const result = validateDateFuture(futureDate, {}, context);

        expect(result).toBeNull();
    });

    it('当输入过去日期时返回正确的错误上下文', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5); // 5天前的日期
        const context: ValidationErrorContext = { field: 'testField', value: pastDate };

        const result = validateDateFuture(pastDate, {}, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe(pastDate);
        }
    });
});