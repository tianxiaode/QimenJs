import { formatPx, percent, toFixed } from '@/utils/units/format';

describe('format utils', () => {
    describe('formatPx', () => {
        test('should format px value correctly', () => {
            expect(formatPx(10, 'px', {})).toBe('10px');
            expect(formatPx(0, 'px', {})).toBe('0px');
            expect(formatPx(-5, 'px', {})).toBe('-5px');
        });

        test('should format rem value correctly', () => {
            expect(formatPx(20, 'rem', { rootFontSize: 16 })).toBe('1.25rem');
            expect(formatPx(16, 'rem', { rootFontSize: 16 })).toBe('1rem');
            expect(formatPx(32, 'rem', { rootFontSize: 16 })).toBe('2rem');
        });

        test('should format em value correctly', () => {
            expect(formatPx(20, 'em', { fontSize: 16 })).toBe('1.25em');
            expect(formatPx(16, 'em', { fontSize: 16 })).toBe('1em');
            expect(formatPx(32, 'em', { fontSize: 16 })).toBe('2em');
        });

        test('should throw error when rootFontSize is required for rem but not provided', () => {
            expect(() => formatPx(20, 'rem', {})).toThrow('rootFontSize required for rem');
        });

        test('should throw error when fontSize is required for em but not provided', () => {
            expect(() => formatPx(20, 'em', {})).toThrow('fontSize required for em');
        });
    });

    describe('percent', () => {
        test('should convert number to percentage format', () => {
            expect(percent(0.5)).toBe('50%');
            expect(percent(1)).toBe('100%');
            expect(percent(0)).toBe('0%');
            expect(percent(0.25)).toBe('25%');
            expect(percent(2)).toBe('200%');
            expect(percent(-0.5)).toBe('-50%');
        });
    });

    describe('toFixed', () => {
        test('should format number with specified precision', () => {
            expect(toFixed(3.14159, 2)).toBe('3.14');
            expect(toFixed(10, 0)).toBe('10');
            expect(toFixed(5.678, 1)).toBe('5.7');
            expect(toFixed(123.456, 3)).toBe('123.456');
        });
    });
});
