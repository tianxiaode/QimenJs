import { hslToRgb } from '../../../../src/utils/color/hslToRgb';

describe('hslToRgb', () => {
    it('should convert HSL to RGB correctly', () => {
        expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]);
        expect(hslToRgb(120, 100, 50)).toEqual([0, 255, 0]);
        expect(hslToRgb(240, 100, 50)).toEqual([0, 0, 255]);
        expect(hslToRgb(0, 0, 100)).toEqual([255, 255, 255]);
        expect(hslToRgb(0, 0, 0)).toEqual([0, 0, 0]);
    });

    it('should handle values in valid ranges', () => {
        expect(hslToRgb(60, 50, 70)).toEqual([217, 217, 140]);
        expect(hslToRgb(200, 30, 40)).toEqual([76, 107, 122]);
    });
});