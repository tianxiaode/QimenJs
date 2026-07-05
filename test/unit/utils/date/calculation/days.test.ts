import {
    addDays,
    getFirstDayOfWeek,
    getWeekNumber,
    getISOWeek,
    getISOWeeksInYear,
} from '../../../../../src/utils/date/calculation/days';

describe('Days Functions', () => {
    describe('addDays', () => {
        it('should add days to a date', () => {
            const date = new Date(2023, 5, 15); // June 15, 2023
            const result = addDays(date, 10);
            expect(result.getDate()).toBe(25);
            expect(result.getMonth()).toBe(5);
            expect(result.getFullYear()).toBe(2023);
        });

        it('should subtract days when negative value is provided', () => {
            const date = new Date(2023, 5, 15); // June 15, 2023
            const result = addDays(date, -5);
            expect(result.getDate()).toBe(10);
            expect(result.getMonth()).toBe(5);
            expect(result.getFullYear()).toBe(2023);
        });
    });

    describe('getFirstDayOfWeek', () => {
        it('should return the first day of the week (Monday)', () => {
            // June 15, 2023 is a Thursday
            const date = new Date(2023, 5, 15);
            const result = getFirstDayOfWeek(date);
            expect(result.getDay()).toBe(1); // Monday
            expect(result.getDate()).toBe(12); // June 12, 2023
        });

        it('should handle Sunday correctly', () => {
            // A Sunday
            const date = new Date(2023, 5, 11);
            const result = getFirstDayOfWeek(date);
            expect(result.getDay()).toBe(1); // Monday
            expect(result.getDate()).toBe(5); // Previous Monday, June 5
        });
    });

    describe('getWeekNumber', () => {
        it('should return the week number of the year', () => {
            // First week of year
            const date = new Date(2023, 0, 1); // Jan 1, 2023
            const weekNumber = getWeekNumber(date);
            expect(typeof weekNumber).toBe('number');
            expect(weekNumber).toBeGreaterThanOrEqual(0);
            expect(weekNumber).toBeLessThanOrEqual(53);
        });
    });

    describe('getISOWeek', () => {
        it('should return the ISO week number', () => {
            // Example: January 1, 2023 was a Sunday
            const date = new Date(2023, 0, 1);
            const isoWeek = getISOWeek(date);
            expect(typeof isoWeek).toBe('number');
            expect(isoWeek).toBeGreaterThanOrEqual(0);
            expect(isoWeek).toBeLessThanOrEqual(53);
        });
    });

    describe('getISOWeeksInYear', () => {
        it('should return the total number of ISO weeks in a year', () => {
            const date = new Date(2023, 0, 1);
            const totalWeeks = getISOWeeksInYear(date);
            expect(typeof totalWeeks).toBe('number');
            expect(totalWeeks).toBeGreaterThanOrEqual(52);
            expect(totalWeeks).toBeLessThanOrEqual(53);
        });
    });
});
