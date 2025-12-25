import { percent, toFixed } from '../../../../src/utils/number/utils';

describe('number utilities', () => {
    describe('percent', () => {
        it('should convert number to percentage', () => {
            const result = percent(0.42);
            expect(result).toBe('42%');
        });

        it('should convert string number to percentage', () => {
            const result = percent('0.5');
            expect(result).toBe('50%');
        });

        it('should handle zero correctly', () => {
            const result = percent(0);
            expect(result).toBe('0%');
        });

        it('should handle null input', () => {
            const result = percent(null);
            expect(result).toBe('');
        });

        it('should handle undefined input', () => {
            const result = percent(undefined);
            expect(result).toBe('');
        });

        it('should handle NaN input', () => {
            const result = percent(NaN);
            expect(result).toBe('');
        });

        it('should handle string that cannot be converted to number', () => {
            const result = percent('abc');
            expect(result).toBe('');
        });

        it('should handle negative numbers', () => {
            const result = percent(-0.25);
            expect(result).toBe('-25%');
        });

        it('should handle numbers greater than 1', () => {
            const result = percent(2);
            expect(result).toBe('200%');
        });
    });

    describe('toFixed', () => {
        it('should format number with specified decimal places', () => {
            const result = toFixed(123.456, 2);
            expect(result).toBe('123.46'); // JavaScript's toFixed rounds
        });

        it('should format integer with specified decimal places', () => {
            const result = toFixed(123, 3);
            expect(result).toBe('123.000');
        });

        it('should format negative numbers', () => {
            const result = toFixed(-45.678, 1);
            expect(result).toBe('-45.7');
        });

        it('should handle string that can be converted to number', () => {
            const result = toFixed('123.456', 1);
            expect(result).toBe('123.5');
        });

        it('should handle zero', () => {
            const result = toFixed(0, 2);
            expect(result).toBe('0.00');
        });
        
        it('should throw error for string that cannot be converted to number', () => {
            expect(() => {
                toFixed('abc', 2);
            }).toThrow('Value is not a valid number');
        });
    });
});