import { hexToHsl } from '../../../../src/utils/color/hexToHsl';

describe('hexToHsl', () => {
    it('should convert hex to HSL correctly', () => {
        expect(hexToHsl('#FF0000')).toBe('hsl(0, 100%, 50%)');
        expect(hexToHsl('#00FF00')).toBe('hsl(120, 100%, 50%)');
        expect(hexToHsl('#0000FF')).toBe('hsl(240, 100%, 50%)');
        expect(hexToHsl('#FFFFFF')).toBe('hsl(0, 0%, 100%)');
        expect(hexToHsl('#000000')).toBe('hsl(0, 0%, 0%)');
        expect(hexToHsl('#808080')).toBe('hsl(0, 0%, 50.2%)');
    });

    it('should handle hex without # prefix', () => {
        expect(hexToHsl('FF0000')).toBe('hsl(0, 100%, 50%)');
        expect(hexToHsl('00FF00')).toBe('hsl(120, 100%, 50%)');
    });
});
