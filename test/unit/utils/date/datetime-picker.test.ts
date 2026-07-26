import {
    getFlowChain,
    getNextField,
    getFlowFromEntry,
    clampDay,
    fixDateTime,
    createDateTimeValue,
    dateTimeValueToDate,
    generateYearDigits,
    splitToDigits,
    generateMinuteSecondDigits,
    formatPreview,
    isLeapYear,
    getDaysInMonthValue,
} from '@/utils/date/datetime-picker';

describe('datetime-picker', () => {
    describe('getFlowChain', () => {
        it('should return the field flow chain', () => {
            expect(getFlowChain()).toEqual(['year', 'month', 'day', 'hour', 'minute', 'second']);
        });
    });

    describe('getNextField', () => {
        it('should return next field', () => {
            expect(getNextField('year', true)).toBe('month');
            expect(getNextField('month', true)).toBe('day');
            expect(getNextField('day', true)).toBe('hour');
            expect(getNextField('hour', true)).toBe('minute');
            expect(getNextField('minute', true)).toBe('second');
        });

        it('should return null for last field', () => {
            expect(getNextField('second', true)).toBeNull();
        });

        it('should skip second when showSeconds is false', () => {
            expect(getNextField('minute', false)).toBeNull();
        });
    });

    describe('getFlowFromEntry', () => {
        it('should return fields from entry to end', () => {
            expect(getFlowFromEntry('month', true)).toEqual([
                'month',
                'day',
                'hour',
                'minute',
                'second',
            ]);
        });

        it('should filter out second when showSeconds is false', () => {
            expect(getFlowFromEntry('hour', false)).toEqual(['hour', 'minute']);
        });
    });

    describe('clampDay', () => {
        it('should clamp day to max days in month', () => {
            expect(clampDay(2024, 2, 30)).toBe(29);
            expect(clampDay(2023, 2, 30)).toBe(28);
            expect(clampDay(2024, 1, 15)).toBe(15);
        });
    });

    describe('fixDateTime', () => {
        it('should fix invalid day', () => {
            const result = fixDateTime({
                year: 2024,
                month: 2,
                day: 30,
                hour: 0,
                minute: 0,
                second: 0,
            });
            expect(result.day).toBe(29);
        });

        it('should keep valid day', () => {
            const result = fixDateTime({
                year: 2024,
                month: 1,
                day: 15,
                hour: 10,
                minute: 30,
                second: 0,
            });
            expect(result.day).toBe(15);
            expect(result.hour).toBe(10);
        });
    });

    describe('createDateTimeValue', () => {
        it('should create from date', () => {
            const d = new Date(2024, 5, 15, 10, 30, 45);
            const result = createDateTimeValue(d);
            expect(result).toEqual({
                year: 2024,
                month: 6,
                day: 15,
                hour: 10,
                minute: 30,
                second: 45,
            });
        });

        it('should create from current date when undefined', () => {
            const result = createDateTimeValue();
            expect(result.year).toBeGreaterThanOrEqual(2024);
            expect(result.month).toBeGreaterThanOrEqual(1);
        });
    });

    describe('dateTimeValueToDate', () => {
        it('should convert to Date', () => {
            const result = dateTimeValueToDate({
                year: 2024,
                month: 6,
                day: 15,
                hour: 10,
                minute: 30,
                second: 45,
            });
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(5);
            expect(result.getDate()).toBe(15);
        });
    });

    describe('generateYearDigits', () => {
        it('should generate digit arrays', () => {
            const result = generateYearDigits(2024);
            expect(result.thousands).toEqual([0, 1, 2]);
            expect(result.hundreds).toHaveLength(10);
            expect(result.tens).toHaveLength(10);
            expect(result.ones).toHaveLength(10);
        });
    });

    describe('splitToDigits', () => {
        it('should split 4-digit year', () => {
            expect(splitToDigits(2024)).toEqual([2, 0, 2, 4]);
        });

        it('should pad short year', () => {
            expect(splitToDigits(99)).toEqual([0, 0, 0, 99]);
        });
    });

    describe('generateMinuteSecondDigits', () => {
        it('should generate tens (0-5) and ones (0-9)', () => {
            const result = generateMinuteSecondDigits();
            expect(result.tens).toEqual([0, 1, 2, 3, 4, 5]);
            expect(result.ones).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
    });

    describe('formatPreview', () => {
        it('should format with seconds', () => {
            const result = formatPreview(
                { year: 2024, month: 6, day: 15, hour: 10, minute: 30, second: 45 },
                true
            );
            expect(result).toBe('2024年06月15日 10:30:45');
        });

        it('should format without seconds', () => {
            const result = formatPreview(
                { year: 2024, month: 1, day: 5, hour: 9, minute: 5, second: 0 },
                false
            );
            expect(result).toBe('2024年01月05日 09:05');
        });
    });

    describe('isLeapYear', () => {
        it('should detect leap years', () => {
            expect(isLeapYear(2024)).toBe(true);
            expect(isLeapYear(2000)).toBe(true);
            expect(isLeapYear(2023)).toBe(false);
            expect(isLeapYear(1900)).toBe(false);
        });
    });

    describe('getDaysInMonthValue', () => {
        it('should return days in month', () => {
            expect(getDaysInMonthValue(2024, 2)).toBe(29);
            expect(getDaysInMonthValue(2023, 2)).toBe(28);
            expect(getDaysInMonthValue(2024, 1)).toBe(31);
            expect(getDaysInMonthValue(2024, 4)).toBe(30);
        });
    });
});
