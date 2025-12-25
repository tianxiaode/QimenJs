import { validateDateWeekend, ValidationErrorContext } from '@/validation';

describe('validateDateWeekend函数测试', () => {
    it('当日期是周六时验证通过', () => {
        // 2023年12月9日是周六
        const saturday = new Date('2023-12-09');

        const result = validateDateWeekend(saturday, { weekend: [0, 6] }, {}); // 默认周末：周日和周六

        expect(result).toBeNull();
    });

    it('当日期是周日时验证通过', () => {
        // 2023年12月10日是周日
        const sunday = new Date('2023-12-10');

        const result = validateDateWeekend(sunday, { weekend: [0, 6] }, {}); // 默认周末：周日和周六

        expect(result).toBeNull();
    });

    it('当日期是工作日时验证失败', () => {
        // 2023年12月8日是周五
        const friday = new Date('2023-12-08');

        const result = validateDateWeekend(friday, { weekend: [0, 6] }, {}); // 默认周末：周日和周六

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('weekend');
        }
    });

    it('当指定自定义周末日期时验证自定义周末', () => {
        // 2023年12月8日是周五
        const friday = new Date('2023-12-08');

        const result = validateDateWeekend(friday, { weekend: [5] }, {}); // 指定周五为周末

        expect(result).toBeNull();
    });

    it('当指定单个周末日期时验证通过', () => {
        // 2023年12月10日是周日
        const sunday = new Date('2023-12-10');

        const result = validateDateWeekend(sunday, { weekend: 0 }, {}); // 指定周日为周末

        expect(result).toBeNull();
    });

    it('当指定单个周末日期但日期不匹配时验证失败', () => {
        // 2023年12月8日是周五
        const friday = new Date('2023-12-08');

        const result = validateDateWeekend(friday, { weekend: 0 }, {}); // 指定周日为周末

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('weekend');
        }
    });

    it('当指定多个自定义周末日期时验证通过', () => {
        // 2023年12月8日是周五
        const friday = new Date('2023-12-08');

        const result = validateDateWeekend(friday, { weekend: [5, 6] }, {}); // 指定周五和周六为周末

        expect(result).toBeNull();
    });

    it('当输入为日期字符串时验证失败', () => {
        const dateString = '2023-12-09'; // 周六

        const result = validateDateWeekend(dateString, { weekend: [0, 6] }, {}); // 默认周末：周日和周六

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入为时间戳时验证失败', () => {
        const timestamp = new Date('2023-12-10').getTime(); // 周日的时间戳

        const result = validateDateWeekend(timestamp, { weekend: [0, 6] }, {}); // 默认周末：周日和周六

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('Date');
        }
    });

    it('当输入null时验证失败', () => {
        const result = validateDateWeekend(null, { weekend: [0, 6] }, {}); // 默认周末：周日和周六

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入undefined时验证失败', () => {
        const result = validateDateWeekend(undefined, { weekend: [0, 6] }, {}); // 默认周末：周日和周六

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('应该正确传递上下文信息', () => {
        const saturday = new Date('2023-12-09');
        const context: ValidationErrorContext = { field: 'testField', value: saturday };

        const result = validateDateWeekend(saturday, { weekend: [0, 6] }, context); // 默认周末：周日和周六

        expect(result).toBeNull();
    });

    it('当输入工作日时返回正确的错误上下文', () => {
        const friday = new Date('2023-12-08');
        const context: ValidationErrorContext = { field: 'testField', value: friday };

        const result = validateDateWeekend(friday, { weekend: [0, 6] }, context); // 默认周末：周日和周六

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe(friday);
        }
    });
});