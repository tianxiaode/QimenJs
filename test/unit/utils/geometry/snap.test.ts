import { snapToEdges } from '@/utils/geometry';

describe('snap functions', () => {
    test('snapToEdges should snap rectangle edges to target edges within threshold', () => {
        const rect = { x: 10, y: 10, width: 20, height: 20 }; // From (10,10) to (30,30)
        const target = { x: 50, y: 60, width: 40, height: 30 }; // From (50,60) to (90,90)
        const threshold = 5;

        // Test left edge snapping
        const rectNearLeft = { x: 48, y: 10, width: 20, height: 20 }; // Left edge at 48, target left at 50
        const resultLeft = snapToEdges(rectNearLeft, target, threshold);
        expect(resultLeft.x).toBe(50); // Should snap to target.x

        // Test right edge snapping
        const rectNearRight = { x: 72, y: 10, width: 20, height: 20 }; // Right edge at 92, target right at 90
        const resultRight = snapToEdges(rectNearRight, target, threshold);
        expect(resultRight.x).toBe(70); // Should snap so right edge is at 90, meaning x = 90 - 20 = 70

        // Test top edge snapping
        const rectNearTop = { x: 10, y: 58, width: 20, height: 20 }; // Top edge at 58, target top at 60
        const resultTop = snapToEdges(rectNearTop, target, threshold);
        expect(resultTop.y).toBe(60); // Should snap to target.y

        // Test bottom edge snapping
        const rectNearBottom = { x: 10, y: 72, width: 20, height: 20 }; // Bottom edge at 92, target bottom at 90
        const resultBottom = snapToEdges(rectNearBottom, target, threshold);
        expect(resultBottom.y).toBe(70); // Should snap so bottom edge is at 90, meaning y = 90 - 20 = 70

        // Test no snapping when outside threshold
        const rectFar = { x: 100, y: 100, width: 20, height: 20 };
        const resultNoSnap = snapToEdges(rectFar, target, threshold);
        expect(resultNoSnap).toEqual(rectFar); // Should remain unchanged
    });
});
