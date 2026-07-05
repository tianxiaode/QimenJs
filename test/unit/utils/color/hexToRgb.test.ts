import { hexToRgb } from '../../../../src/utils/color/hexToRgb';

describe('hexToRgb', () => {
    it('should convert hex to RGB correctly', () => {
        expect(hexToRgb('#FF0000')).toEqual([255, 0, 0]);
        expect(hexToRgb('#00FF00')).toEqual([0, 255, 0]);
        expect(hexToRgb('#0000FF')).toEqual([0, 0, 255]);
        expect(hexToRgb('#FFFFFF')).toEqual([255, 255, 255]);
        expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    });

    it('should handle hex without # prefix', () => {
        expect(hexToRgb('FF0000')).toEqual([255, 0, 0]);
        expect(hexToRgb('00FF00')).toEqual([0, 255, 0]);
    });

    it('should handle shorthand hex', () => {
        expect(hexToRgb('#F00')).toEqual([255, 0, 0]); // #F00 -> #FF0000
        expect(hexToRgb('#0F0')).toEqual([0, 255, 0]); // #0F0 -> #00FF00
        expect(hexToRgb('#00F')).toEqual([0, 0, 255]); // #00F -> #0000FF
    });
});
