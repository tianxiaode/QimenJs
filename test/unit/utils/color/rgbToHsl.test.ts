import { rgbToHsl } from '../../../../src/utils/color/rgbToHsl';

describe('rgbToHsl', () => {
    it('should convert RGB to HSL correctly', () => {
        expect(rgbToHsl(255, 0, 0)).toEqual([0, 100, 50]);
        expect(rgbToHsl(0, 255, 0)).toEqual([120, 100, 50]);
        expect(rgbToHsl(0, 0, 255)).toEqual([240, 100, 50]);
        expect(rgbToHsl(255, 255, 255)).toEqual([0, 0, 100]);
        expect(rgbToHsl(0, 0, 0)).toEqual([0, 0, 0]);
        expect(rgbToHsl(128, 128, 128)).toEqual([0, 0, 50]);
    });

    it('should handle values between 0-255', () => {
        expect(rgbToHsl(100, 150, 200)).toEqual([210, 49.02, 58.82]);
    });
});
