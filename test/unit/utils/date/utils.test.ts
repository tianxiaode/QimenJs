import {
    now,
    today,
    yesterday,
    tomorrow,
    thisWeek,
    thisMonth,
    thisYear,
    calculateAge,
    parseTimeSpanToSeconds,
    convertSecondsToTimeSpan,
} from '../../../../src/utils/date/utils';

describe('utils functions', () => {
    describe('now', () => {
        it('should return current date', () => {
            const before = new Date();
            const result = now();
            const after = new Date();

            expect(result).toBeInstanceOf(Date);
            expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(result.getTime()).toBeLessThanOrEqual(after.getTime());
        });
    });

    describe('today', () => {
        it("should return today's date with time set to 00:00:00.000", () => {
            const result = today();
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });
    });

    describe('yesterday', () => {
        it("should return yesterday's date with time set to 00:00:00.000", () => {
            const result = yesterday();
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });
    });

    describe('tomorrow', () => {
        it("should return tomorrow's date with time set to 00:00:00.000", () => {
            const result = tomorrow();
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });
    });

    describe('thisWeek', () => {
        it('should return the start of the current week', () => {
            const result = thisWeek();
            expect(result.getDay()).toBe(0); // Sunday
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });
    });

    describe('thisMonth', () => {
        it('should return the start of the current month', () => {
            const result = thisMonth();
            expect(result.getDate()).toBe(1);
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });
    });

    describe('thisYear', () => {
        it('should return the start of the current year', () => {
            const result = thisYear();
            expect(result.getMonth()).toBe(0); // January
            expect(result.getDate()).toBe(1);
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });
    });

    describe('calculateAge', () => {
        it('should calculate age from birth date', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 25); // 25 years ago
            const age = calculateAge(birthDate);
            expect(age).toBe(25);
        });

        it('should calculate age from birth date string', () => {
            const birthDateStr = '1990-01-01';
            const currentDate = new Date();
            const expectedAge = currentDate.getFullYear() - 1990;
            const age = calculateAge(birthDateStr);

            // The age might be expectedAge or expectedAge - 1 depending on the current date
            expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
            expect(age).toBeLessThanOrEqual(expectedAge);
        });
    });

    describe('parseTimeSpanToSeconds', () => {
        it('should parse time span in format hh:mm:ss', () => {
            const seconds = parseTimeSpanToSeconds('01:30:45');
            expect(seconds).toBe(1 * 3600 + 30 * 60 + 45); // 1 hour, 30 minutes, 45 seconds
        });

        it('should parse time span in format d.hh:mm:ss', () => {
            const seconds = parseTimeSpanToSeconds('2.01:30:45');
            expect(seconds).toBe(2 * 86400 + 1 * 3600 + 30 * 60 + 45); // 2 days, 1 hour, 30 minutes, 45 seconds
        });

        it('should throw error for invalid format', () => {
            expect(() => {
                parseTimeSpanToSeconds('invalid-format');
            }).toThrow('Invalid TimeSpan format');
        });

        it('should handle single digit values', () => {
            const seconds = parseTimeSpanToSeconds('5:05:05');
            expect(seconds).toBe(5 * 3600 + 5 * 60 + 5); // 5 hours, 5 minutes, 5 seconds
        });
    });

    describe('convertSecondsToTimeSpan', () => {
        it('should convert seconds to time span format', () => {
            const timeSpan = convertSecondsToTimeSpan(90061); // 1 day, 1 hour, 1 minute, 1 second
            expect(timeSpan).toBe('1.01:01:01');
        });

        it('should handle less than a day', () => {
            const timeSpan = convertSecondsToTimeSpan(3661); // 1 hour, 1 minute, 1 second
            expect(timeSpan).toBe('0.01:01:01');
        });

        it('should handle only minutes and seconds', () => {
            const timeSpan = convertSecondsToTimeSpan(3661); // 1h 1m 1s = 3600 + 60 + 1
            expect(timeSpan).toBe('0.01:01:01');
        });

        it('should pad numbers with zeros correctly', () => {
            const timeSpan = convertSecondsToTimeSpan(61); // 1 minute, 1 second
            expect(timeSpan).toBe('0.00:01:01');
        });
    });
});
