import { normalizeCssUnit, cssUnitTypeToNumber } from '../../../../src/utils/string/css';

describe('String CSS Utility Functions', () => {
    describe('normalizeCssUnit', () => {
        it('should convert number to string with px unit', () => {
            expect(normalizeCssUnit(10)).toBe('10px');
            expect(normalizeCssUnit(0)).toBe('0');
            expect(normalizeCssUnit(-5)).toBe('-5px');
        });

        it('should return string as is', () => {
            expect(normalizeCssUnit('10px')).toBe('10px');
            expect(normalizeCssUnit('auto')).toBe('auto');
        });

        it('should handle null and undefined', () => {
            expect(normalizeCssUnit(null)).toBe('null');
            expect(normalizeCssUnit(undefined)).toBe('undefined');
        });
    });

    describe('cssUnitTypeToNumber', () => {
        it('should return number as is', () => {
            expect(cssUnitTypeToNumber(10)).toBe(10);
            expect(cssUnitTypeToNumber(0)).toBe(0);
            expect(cssUnitTypeToNumber(-5)).toBe(-5);
        });

        it('should extract number from CSS unit strings', () => {
            expect(cssUnitTypeToNumber('10px')).toBe(10);
            expect(cssUnitTypeToNumber('5em')).toBe(5);
            expect(cssUnitTypeToNumber('2.5rem')).toBe(2.5);
            expect(cssUnitTypeToNumber('100%')).toBe(100);
        });

        it('should handle integer and decimal values', () => {
            expect(cssUnitTypeToNumber('10.5px')).toBe(10.5);
            expect(cssUnitTypeToNumber('0.25rem')).toBe(0.25);
        });

        it('should return 0 for invalid CSS unit strings', () => {
            expect(cssUnitTypeToNumber('invalid')).toBe(0);
            expect(cssUnitTypeToNumber('')).toBe(0);
            expect(cssUnitTypeToNumber('abc123')).toBe(0);
        });

        it('should handle different CSS units', () => {
            expect(cssUnitTypeToNumber('10pt')).toBe(10);
            expect(cssUnitTypeToNumber('5pc')).toBe(5);
            expect(cssUnitTypeToNumber('2ex')).toBe(2);
            expect(cssUnitTypeToNumber('1ch')).toBe(1);
            expect(cssUnitTypeToNumber('100vw')).toBe(100);
            expect(cssUnitTypeToNumber('50vh')).toBe(50);
            expect(cssUnitTypeToNumber('25vmin')).toBe(25);
            expect(cssUnitTypeToNumber('75vmax')).toBe(75);
        });
    });
});
