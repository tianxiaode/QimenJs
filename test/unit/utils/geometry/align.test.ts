import {
    alignLeft,
    alignRight,
    alignTop,
    alignBottom,
    alignCenterX,
    alignCenterY,
    alignCenter,
    alignToPointCenter,
} from '@/utils/geometry';

describe('align functions', () => {
    const rect = { x: 10, y: 10, width: 20, height: 30 };
    const target = { x: 50, y: 60, width: 40, height: 50 };

    test('alignLeft should align the left edge of rect with the left edge of target', () => {
        const result = alignLeft(rect, target);
        expect(result).toEqual({
            ...rect,
            x: target.x, // Should be 50
        });
    });

    test('alignRight should align the right edge of rect with the right edge of target', () => {
        const result = alignRight(rect, target);
        expect(result).toEqual({
            ...rect,
            x: target.x + target.width - rect.width, // 50 + 40 - 20 = 70
        });
    });

    test('alignTop should align the top edge of rect with the top edge of target', () => {
        const result = alignTop(rect, target);
        expect(result).toEqual({
            ...rect,
            y: target.y, // Should be 60
        });
    });

    test('alignBottom should align the bottom edge of rect with the bottom edge of target', () => {
        const result = alignBottom(rect, target);
        expect(result).toEqual({
            ...rect,
            y: target.y + target.height - rect.height, // 60 + 50 - 30 = 80
        });
    });

    test('alignCenterX should horizontally center rect within target', () => {
        const result = alignCenterX(rect, target);
        expect(result).toEqual({
            ...rect,
            x: target.x + (target.width - rect.width) / 2, // 50 + (40 - 20) / 2 = 60
        });
    });

    test('alignCenterY should vertically center rect within target', () => {
        const result = alignCenterY(rect, target);
        expect(result).toEqual({
            ...rect,
            y: target.y + (target.height - rect.height) / 2, // 60 + (50 - 30) / 2 = 70
        });
    });

    test('alignCenter should center rect both horizontally and vertically within target', () => {
        const result = alignCenter(rect, target);
        expect(result).toEqual({
            ...rect,
            x: target.x + (target.width - rect.width) / 2, // 50 + (40 - 20) / 2 = 60
            y: target.y + (target.height - rect.height) / 2, // 60 + (50 - 30) / 2 = 70
        });
    });

    test('alignToPointCenter should center rect on a given point', () => {
        const point = { x: 100, y: 200 };
        const result = alignToPointCenter(rect, point);
        expect(result).toEqual({
            ...rect,
            x: point.x - rect.width / 2, // 100 - 20 / 2 = 90
            y: point.y - rect.height / 2, // 200 - 30 / 2 = 185
        });
    });
});
