import { unitsPercent, unitsRatio } from '@/utils/units/percent';

describe('percent utils', () => {
    describe('unitsPercent', () => {
        test('should calculate percent value correctly', () => {
            expect(unitsPercent(0.5, 100)).toBe(50);
            expect(unitsPercent(1, 200)).toBe(200);
            expect(unitsPercent(0, 50)).toBe(0);
            expect(unitsPercent(0.25, 80)).toBe(20);
            expect(unitsPercent(2, 10)).toBe(20);
            expect(unitsPercent(-0.5, 100)).toBe(-50);
        });
    });

    describe('unitsRatio', () => {
        test('should calculate ratio correctly', () => {
            expect(unitsRatio(50, 100)).toBe(0.5);
            expect(unitsRatio(25, 100)).toBe(0.25);
            expect(unitsRatio(0, 100)).toBe(0);
            expect(unitsRatio(200, 100)).toBe(2);
            expect(unitsRatio(75, 25)).toBe(3);
            expect(unitsRatio(-50, 100)).toBe(-0.5);
        });
    });
});
