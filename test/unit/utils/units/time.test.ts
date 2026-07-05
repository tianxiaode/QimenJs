import { msToSec, secToMs } from '@/utils/units/time';

describe('time utils', () => {
    describe('msToSec', () => {
        test('should convert milliseconds to seconds', () => {
            expect(msToSec(1000)).toBe(1);
            expect(msToSec(2000)).toBe(2);
            expect(msToSec(500)).toBe(0.5);
            expect(msToSec(0)).toBe(0);
            expect(msToSec(1500)).toBe(1.5);
            expect(msToSec(-1000)).toBe(-1);
        });
    });

    describe('secToMs', () => {
        test('should convert seconds to milliseconds', () => {
            expect(secToMs(1)).toBe(1000);
            expect(secToMs(2)).toBe(2000);
            expect(secToMs(0.5)).toBe(500);
            expect(secToMs(0)).toBe(0);
            expect(secToMs(1.5)).toBe(1500);
            expect(secToMs(-1)).toBe(-1000);
        });
    });

    describe('msToSec and secToMs inverse relationship', () => {
        test('should be inverse functions', () => {
            const seconds = 42;
            const milliseconds = secToMs(seconds);
            const convertedBack = msToSec(milliseconds);
            expect(convertedBack).toBeCloseTo(seconds);
        });
    });
});
