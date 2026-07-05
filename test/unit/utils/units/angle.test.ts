import { degToRad, radToDeg } from '@/utils/units/angle';

describe('angle utils', () => {
    describe('degToRad', () => {
        test('should convert degrees to radians', () => {
            expect(degToRad(0)).toBe(0);
            expect(degToRad(180)).toBe(Math.PI);
            expect(degToRad(90)).toBe(Math.PI / 2);
            expect(degToRad(360)).toBe(Math.PI * 2);
            expect(degToRad(-180)).toBe(-Math.PI);
        });

        test('should handle decimal values', () => {
            expect(degToRad(45)).toBeCloseTo(Math.PI / 4);
            expect(degToRad(30)).toBeCloseTo(Math.PI / 6);
        });
    });

    describe('radToDeg', () => {
        test('should convert radians to degrees', () => {
            expect(radToDeg(0)).toBe(0);
            expect(radToDeg(Math.PI)).toBe(180);
            expect(radToDeg(Math.PI / 2)).toBe(90);
            expect(radToDeg(Math.PI * 2)).toBe(360);
            expect(radToDeg(-Math.PI)).toBe(-180);
        });

        test('should handle decimal values', () => {
            expect(radToDeg(Math.PI / 4)).toBeCloseTo(45);
            expect(radToDeg(Math.PI / 6)).toBeCloseTo(30);
        });
    });

    describe('degToRad and radToDeg inverse relationship', () => {
        test('should be inverse functions', () => {
            const degrees = 60;
            const radians = degToRad(degrees);
            const convertedBack = radToDeg(radians);
            expect(convertedBack).toBeCloseTo(degrees);
        });
    });
});
