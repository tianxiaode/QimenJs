import { smartCompare, CompareResult } from '@/validation';

describe('smartCompare', () => {
    describe('strict mode (default)', () => {
        it('should compare numbers correctly', () => {
            expect(smartCompare(1, 2)).toBe(-1);
            expect(smartCompare(2, 1)).toBe(1);
            expect(smartCompare(1, 1)).toBe(0);
        });

        it('should compare strings correctly', () => {
            expect(smartCompare('a', 'b')).toBe(-1);
            expect(smartCompare('b', 'a')).toBe(1);
            expect(smartCompare('a', 'a')).toBe(0);
        });

        it('should compare booleans correctly', () => {
            expect(smartCompare(false, true)).toBe(-1);
            expect(smartCompare(true, false)).toBe(1);
            expect(smartCompare(true, true)).toBe(0);
            expect(smartCompare(false, false)).toBe(0);
        });

        it('should compare dates correctly', () => {
            const date1 = new Date('2023-01-01');
            const date2 = new Date('2023-01-02');
            expect(smartCompare(date1, date2)).toBe(-1);
            expect(smartCompare(date2, date1)).toBe(1);
            expect(smartCompare(date1, date1)).toBe(0);
        });

        it('should return NaN for different types in strict mode', () => {
            expect(smartCompare('1', 1)).toBe(NaN);
            expect(smartCompare(1, '1')).toBe(NaN);
            expect(smartCompare(true, 1)).toBe(NaN);
            expect(smartCompare(1, "not-a-number", false)).toBe(NaN);
            expect(smartCompare(new Date(), '2023-01-01')).toBe(NaN);
        });

        it('should return NaN for non-comparable values', () => {
            expect(smartCompare(null, null)).toBe(NaN);
            expect(smartCompare(undefined, undefined)).toBe(NaN);
            expect(smartCompare({}, {})).toBe(NaN);
            expect(smartCompare([], [])).toBe(NaN);
            expect(smartCompare(Symbol('test'), Symbol('test'))).toBe(NaN);
        });

        it('should handle invalid dates', () => {
            const invalidDate = new Date('invalid');
            expect(smartCompare(invalidDate, new Date())).toBe(NaN);
            expect(smartCompare(new Date(), invalidDate)).toBe(NaN);
            expect(smartCompare(invalidDate, invalidDate)).toBe(NaN);
        });
    });

    describe('non-strict mode', () => {
        it('should convert string to number for comparison', () => {
            expect(smartCompare('1', 2, false)).toBe(-1);
            expect(smartCompare('2', 1, false)).toBe(1);
            expect(smartCompare('1', 1, false)).toBe(0);

            // Invalid number string should return NaN
            expect(smartCompare('abc', 1, false)).toBe(NaN);
        });

        it('should convert number to string for comparison', () => {
            expect(smartCompare(1, '2', false)).toBe(-1);
            expect(smartCompare(2, '1', false)).toBe(1);
            expect(smartCompare(1, '1', false)).toBe(0);
        });

        it('should convert string/number to date for comparison', () => {
            const date = new Date('2023-01-01');
            expect(smartCompare(date, '2023-01-02', false)).toBe(-1);
            expect(smartCompare(date, '2022-12-31', false)).toBe(1);
            expect(smartCompare(date, '2023-01-01', false)).toBe(0);

            expect(smartCompare(date, 1672531200000, false)).toBe(0); // timestamp for 2023-01-01
            expect(smartCompare('2023-01-02', date, false)).toBe(1);
            expect(smartCompare('2022-12-31', date, false)).toBe(-1);
            expect(smartCompare('2023-01-01', date, false)).toBe(0);
        });

        it('should return NaN for invalid conversions', () => {
            const date = new Date('2023-01-01');
            expect(smartCompare(date, 'invalid-date', false)).toBe(NaN);
            expect(smartCompare('invalid-date', date, false)).toBe(NaN);
        });
    });

    describe('edge cases', () => {
        it('should handle special number values', () => {
            expect(smartCompare(Infinity, 1)).toBe(1);
            expect(smartCompare(-Infinity, 1)).toBe(-1);
            expect(smartCompare(0, -0)).toBe(0);

            // NaN should not be comparable
            expect(smartCompare(NaN, 1)).toBe(NaN);
            expect(smartCompare(1, NaN)).toBe(NaN);
        });

        it('should handle empty strings', () => {
            expect(smartCompare('', 'a')).toBe(-1);
            expect(smartCompare('a', '')).toBe(1);
            expect(smartCompare('', '')).toBe(0);
        });

        it('should handle numeric strings in non-strict mode', () => {
            expect(smartCompare('0', 0, false)).toBe(0);
            expect(smartCompare('1.5', 1.5, false)).toBe(0);
            expect(smartCompare('-1', -1, false)).toBe(0);
        });
    });
});
