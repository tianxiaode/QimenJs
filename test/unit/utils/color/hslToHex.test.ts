import { hslToHex } from '../../../../src/utils/color/hslToHex';

describe('hslToHex', () => {
    it('should convert HSL to hex correctly', () => {
        expect(hslToHex(0, 100, 50)).toBe('#ff0000');
        expect(hslToHex(120, 100, 50)).toBe('#00ff00');
        expect(hslToHex(240, 100, 50)).toBe('#0000ff');
        expect(hslToHex(0, 0, 100)).toBe('#ffffff');
        expect(hslToHex(0, 0, 0)).toBe('#000000');
    });

    it('should handle values in valid ranges', () => {
        expect(hslToHex(60, 50, 70)).toBe('#cfc89a');
        expect(hslToHex(200, 30, 40)).toBe('#4c6b7a');
    });
});