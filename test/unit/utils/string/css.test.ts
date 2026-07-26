import {
    normalizeCssUnit,
    cssUnitTypeToNumber,
    resolvePx,
    resolveMarginPadding,
    resolveBorder,
    indentStyle,
} from '../../../../src/utils/string/css';

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

    describe('resolvePx', () => {
        it('should convert number to px string', () => {
            expect(resolvePx(10)).toBe('10px');
            expect(resolvePx(0)).toBe('0px');
        });

        it('should return string as is', () => {
            expect(resolvePx('10px')).toBe('10px');
            expect(resolvePx('auto')).toBe('auto');
        });
    });

    describe('resolveMarginPadding', () => {
        it('should convert number to px', () => {
            expect(resolveMarginPadding(10)).toBe('10px');
        });

        it('should return string as is', () => {
            expect(resolveMarginPadding('10px')).toBe('10px');
        });

        it('should resolve object with all sides', () => {
            expect(resolveMarginPadding({ top: 1, right: 2, bottom: 3, left: 4 })).toBe(
                '1px 2px 3px 4px'
            );
        });

        it('should use horizontal/vertical shorthand', () => {
            expect(resolveMarginPadding({ horizontal: 10, vertical: 5 })).toBe('5px 10px 5px 10px');
        });

        it('should mix horizontal/vertical with explicit sides', () => {
            expect(resolveMarginPadding({ top: 1, horizontal: 10, bottom: 3 })).toBe(
                '1px 10px 3px 10px'
            );
        });

        it('should default to 0 for missing sides', () => {
            expect(resolveMarginPadding({})).toBe('0px 0px 0px 0px');
        });

        it('should handle string values in object', () => {
            expect(resolveMarginPadding({ top: '1em', right: '2em' })).toBe('1em 2em 0px 0px');
        });
    });

    describe('resolveBorder', () => {
        it('should convert number to px solid', () => {
            expect(resolveBorder(1)).toBe('1px solid');
        });

        it('should return string as is', () => {
            expect(resolveBorder('1px dashed red')).toBe('1px dashed red');
        });

        it('should resolve border object with defaults', () => {
            expect(resolveBorder({})).toBe('1px solid');
        });

        it('should resolve border object with width', () => {
            expect(resolveBorder({ width: 2 })).toBe('2px solid');
        });

        it('should resolve border object with style', () => {
            expect(resolveBorder({ style: 'dashed' })).toBe('1px dashed');
        });

        it('should resolve border object with color', () => {
            expect(resolveBorder({ color: 'red' })).toBe('1px solid red');
        });

        it('should resolve full border object', () => {
            expect(resolveBorder({ width: 2, style: 'dashed', color: 'blue' })).toBe(
                '2px dashed blue'
            );
        });

        it('should handle string width', () => {
            expect(resolveBorder({ width: '2em' })).toBe('2em solid');
        });
    });

    describe('indentStyle', () => {
        it('should return empty for depth 0 without offset', () => {
            expect(indentStyle({ depth: 0 })).toBe('');
        });

        it('should generate indent with depth', () => {
            const result = indentStyle({ depth: 2 });
            expect(result).toContain('padding-left');
            expect(result).toContain('2');
            expect(result).toContain('var(--q-indent-step, 16px)');
        });

        it('should use custom property', () => {
            const result = indentStyle({ depth: 1, property: 'margin-left' });
            expect(result).toContain('margin-left');
        });

        it('should use prefix for step variable', () => {
            const result = indentStyle({ depth: 1, prefix: 'tree' });
            expect(result).toContain('var(--q-indent-step-tree, var(--q-indent-step, 16px))');
        });

        it('should handle numeric offset', () => {
            const result = indentStyle({ depth: 0, offset: 10 });
            expect(result).toContain('10px');
        });

        it('should handle string offset', () => {
            const result = indentStyle({ depth: 0, offset: '2em' });
            expect(result).toContain('2em');
        });

        it('should combine depth and offset with calc', () => {
            const result = indentStyle({ depth: 1, offset: 8 });
            expect(result).toContain('calc(');
            expect(result).toContain('8px');
        });
    });
});
