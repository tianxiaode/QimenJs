import { clampPoint, keepInside } from '@/utils/geometry';

describe('clamp functions', () => {
    test('clampPoint should constrain a point within the given bounds', () => {
        const point = { x: 10, y: 10 };
        const bounds = { x: 5, y: 5, width: 20, height: 20 }; // From (5,5) to (25,25)

        // Point is inside bounds, should remain unchanged
        expect(clampPoint(point, bounds)).toEqual({ x: 10, y: 10 });

        // Point is outside bounds on both axes
        const pointOutside = { x: 30, y: 40 };
        expect(clampPoint(pointOutside, bounds)).toEqual({ x: 25, y: 25 }); // Clamped to max bounds

        // Point is below bounds
        const pointBelow = { x: 0, y: 0 };
        expect(clampPoint(pointBelow, bounds)).toEqual({ x: 5, y: 5 }); // Clamped to min bounds
    });

    test('keepInside should keep a rectangle within the container', () => {
        const rect = { x: 10, y: 10, width: 20, height: 20 };
        const container = { x: 5, y: 5, width: 50, height: 50 }; // From (5,5) to (55,55)

        // Rectangle is already inside container, should remain unchanged
        expect(keepInside(rect, container)).toEqual(rect);

        // Rectangle is partially outside container on the right and bottom
        const rectOutside = { x: 60, y: 70, width: 20, height: 20 };
        expect(keepInside(rectOutside, container)).toEqual({
            ...rectOutside,
            x: container.x + container.width - rectOutside.width, // 5 + 50 - 20 = 35
            y: container.y + container.height - rectOutside.height, // 5 + 50 - 20 = 35
        });

        // Rectangle is partially outside container on the left and top
        const rectLeftTop = { x: 0, y: 0, width: 20, height: 20 };
        expect(keepInside(rectLeftTop, container)).toEqual({
            ...rectLeftTop,
            x: container.x, // 5
            y: container.y, // 5
        });
    });
});
