import { rgbToHex } from '../../../../src/utils/color/rgbToHex';

describe('rgbToHex', () => {
    it('should convert RGB to hex correctly', () => {
        expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
        expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
        expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
        expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
        expect(rgbToHex(0, 0, 0)).toBe('#000000');
        expect(rgbToHex(128, 128, 128)).toBe('#808080');
    });

    it('should handle values between 0-255', () => {
        expect(rgbToHex(100, 150, 200)).toBe('#6496c8');
    });

    it('should clamp values to valid range', () => {
        expect(rgbToHex(300, 0, 0)).toBe('#ff0000');
        expect(rgbToHex(-10, 0, 0)).toBe('#000000');
    });
});