import { formatDate, parse } from '../../../../src/utils/date/format';

// 为了测试TOKEN_CONFIG，我们需要导入内部实现
import * as formatModule from '../../../../src/utils/date/format';

describe('format utility functions', () => {
    describe('formatDate', () => {
        it('should format date with full year', () => {
            const date = new Date(2023, 0, 15, 14, 30, 45); // Jan 15, 2023, 14:30:45
            const result = formatDate(date, 'yyyy-MM-dd');
            expect(result).toBe('2023-01-15');
        });

        it('should format date with short year', () => {
            const date = new Date(2023, 0, 15);
            const result = formatDate(date, 'yy-MM-dd');
            expect(result).toBe('23-01-15');
        });

        it('should format date with different components', () => {
            const date = new Date(2023, 11, 25, 15, 30, 45); // Dec 25, 2023, 15:30:45
            const result = formatDate(date, 'MM/dd/yyyy HH:mm:ss');
            expect(result).toBe('12/25/2023 15:30:45');
        });

        it('should format date with single digit components', () => {
            const date = new Date(2023, 0, 5, 8, 5, 3);
            const result = formatDate(date, 'M/d/yyyy H:m:s');
            expect(result).toBe('1/5/2023 8:5:3');
        });

        it('should format date with 12-hour time format', () => {
            const date = new Date(2023, 0, 15, 14, 30, 45); // 2:30 PM
            const result = formatDate(date, 'hh:mm:ss');
            expect(result).toBe('02:30:45 PM'); // AM/PM is added automatically when using 12-hour format
        });

        it('should format date with AM/PM indicator', () => {
            const date = new Date(2023, 0, 15, 14, 30, 45); // 2:30 PM
            const result = formatDate(date, 'hh:mm:ss a');
            expect(result).toContain('PM');

            const date2 = new Date(2023, 0, 15, 6, 30, 45); // 6:30 AM
            const result2 = formatDate(date2, 'hh:mm:ss a');
            expect(result2).toContain('AM');
        });

        it('should handle midnight correctly', () => {
            const date = new Date(2023, 0, 15, 0, 0, 0);
            const result = formatDate(date, 'HH:mm:ss');
            expect(result).toBe('00:00:00');
        });

        it('should handle noon correctly', () => {
            const date = new Date(2023, 0, 15, 12, 0, 0);
            const result = formatDate(date, 'hh:mm:ss');
            expect(result).toBe('12:00:00 PM'); // Noon in 12-hour format should show PM
        });
    });

    describe('parse', () => {
        it('should parse a date string with the given format', () => {
            const result = parse('2023-01-15', 'yyyy-MM-dd');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.getFullYear()).toBe(2023);
                expect(result.getMonth()).toBe(0); // January is 0-indexed
                expect(result.getDate()).toBe(15);
            }
        });

        it('should return null for invalid date format', () => {
            const result = parse('invalid-date', 'yyyy-MM-dd');
            expect(result).toBeNull();
        });

        it('should parse a date with time', () => {
            const result = parse('2023-01-15 14:30:45', 'yyyy-MM-dd HH:mm:ss');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.getFullYear()).toBe(2023);
                expect(result.getMonth()).toBe(0);
                expect(result.getDate()).toBe(15);
                expect(result.getHours()).toBe(14);
                expect(result.getMinutes()).toBe(30);
                expect(result.getSeconds()).toBe(45);
            }
        });

        it('should handle different date formats', () => {
            const result = parse('01/15/2023', 'MM/dd/yyyy');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.getFullYear()).toBe(2023);
                expect(result.getMonth()).toBe(0);
                expect(result.getDate()).toBe(15);
            }
        });

        it('should parse format with single digit components', () => {
            const result = parse('1/5/23 8:5:3', 'M/d/yy H:m:s');
            expect(result).not.toBeNull();
            if (result) {
                // Year 23 should be interpreted as 2023
                expect(result.getFullYear()).toBe(2023);
                expect(result.getMonth()).toBe(0); // Month 1 (January is 0-indexed)
                expect(result.getDate()).toBe(5);
                expect(result.getHours()).toBe(8);
                expect(result.getMinutes()).toBe(5);
                expect(result.getSeconds()).toBe(3);
            }
        });

        it('should parse 12-hour format', () => {
            const result = parse('02:30:45 PM', 'hh:mm:ss a');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.getHours()).toBe(14); // 2 PM = 14:00 in 24h format
                expect(result.getMinutes()).toBe(30);
                expect(result.getSeconds()).toBe(45);
            }
        });

        it('should parse 12 AM correctly as 0 hour', () => {
            const result = parse('12:00:00 AM', 'hh:mm:ss a');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.getHours()).toBe(0); // 12 AM should be 0 in 24h format
                expect(result.getMinutes()).toBe(0);
                expect(result.getSeconds()).toBe(0);
            }
        });

        it('should parse 12 PM correctly', () => {
            const result = parse('12:00:00 PM', 'hh:mm:ss a');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.getHours()).toBe(12); // 12 PM stays 12 in 24h format
                expect(result.getMinutes()).toBe(0);
                expect(result.getSeconds()).toBe(0);
            }
        });

        it('should parse single digit hour in 12-hour format', () => {
            const result = parse('2:30:45 PM', 'h:mm:ss a');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.getHours()).toBe(14); // 2 PM = 14:00 in 24h format
                expect(result.getMinutes()).toBe(30);
                expect(result.getSeconds()).toBe(45);
            }
        });

        it('should handle format string with mixed valid and invalid tokens', () => {
            const result = parse('2023-01-15X', 'yyyy-MM-ddX');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.getFullYear()).toBe(2023);
                expect(result.getMonth()).toBe(0); // January is 0-indexed
                expect(result.getDate()).toBe(15);
            }
        });

        it('should handle multiple unknown tokens in format string', () => {
            const result = parse('2023-01-15T10:30:45Z', 'yyyy-MM-ddThh:mm:ssZ');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.getFullYear()).toBe(2023);
                expect(result.getMonth()).toBe(0);
                expect(result.getDate()).toBe(15);
                expect(result.getHours()).toBe(10);
                expect(result.getMinutes()).toBe(30);
                expect(result.getSeconds()).toBe(45);
            }
        });
    });
});

// 测试TOKEN_CONFIG中的所有配置项
describe('TOKEN_CONFIG coverage', () => {
    it('should cover all token configurations', () => {
        // 测试所有可能的标记
        expect(parse('2023', 'yyyy')).not.toBeNull();
        expect(parse('23', 'yy')).not.toBeNull();
        expect(parse('12', 'MM')).not.toBeNull();
        expect(parse('5', 'M')).not.toBeNull();
        expect(parse('25', 'dd')).not.toBeNull();
        expect(parse('8', 'd')).not.toBeNull();
        expect(parse('15', 'HH')).not.toBeNull();
        expect(parse('7', 'H')).not.toBeNull();
        expect(parse('10', 'hh')).not.toBeNull();
        expect(parse('5', 'h')).not.toBeNull();
        expect(parse('30', 'mm')).not.toBeNull();
        expect(parse('45', 'm')).not.toBeNull();
        expect(parse('59', 'ss')).not.toBeNull();
        expect(parse('30', 's')).not.toBeNull();
        expect(parse('PM', 'a')).not.toBeNull();
    });
});
