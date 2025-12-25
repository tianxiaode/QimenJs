import { formatNumber, formatCurrency } from '../../../../src/utils/number/format';

describe('number format utilities', () => {
    describe('formatNumber', () => {
        it('should format number with basic format', () => {
            const result = formatNumber(1234.567, '0.00');
            expect(result).toBe('1234.57'); // Rounds to 2 decimal places
        });

        it('should format number with zero padding', () => {
            const result = formatNumber(42, '0000');
            expect(result).toBe('0042'); // Now correctly pads with zeros
        });

        it('should format number with hash pattern', () => {
            const result = formatNumber(42, '####');
            expect(result).toBe('42');
        });

        it('should format number with thousand separators', () => {
            const result = formatNumber(1234567, '#,###');
            expect(result).toBe('1,234,567'); // Groups every 3 digits after comma
        });

        it('should format number with decimal places', () => {
            const result = formatNumber(123.4, '#.00');
            expect(result).toBe('123.40'); // Now adds trailing zeros if needed
        });

        it('should format number with decimal places requiring padding', () => {
            const result = formatNumber(123.0, '#.00');
            expect(result).toBe('123.00'); // Now adds decimal with padded zeros
        });
        
        it('should format number with decimal places when input has decimals', () => {
            const result = formatNumber(123.00, '#.00');
            expect(result).toBe('123.00'); // Now adds decimal with padded zeros
        });

        it('should format number with percentage', () => {
            const result = formatNumber(0.42, '0%');
            expect(result).toBe('42%');
        });

        it('should format number with comma as thousands separator', () => {
            const result = formatNumber(1234567, '#,###');
            expect(result).toBe('1,234,567'); // Standard thousands separator
        });

        it('should format negative numbers', () => {
            const result = formatNumber(-1234.5, '#,###.00');
            expect(result).toBe('-1,234.50');
        });

        it('should handle zero correctly', () => {
            const result = formatNumber(0, '00.00');
            expect(result).toBe('00.00'); // Now correctly formats as '00.00'
        });

        it('should handle very small numbers', () => {
            const result = formatNumber(0.00001, '0.#####');
            expect(result).toBe('0.00001');
        });
        
        it('should handle zero padding in integer part when number has fewer digits', () => {
            const result = formatNumber(12345, '000000');  // number is shorter than format
            expect(result).toBe('012345');  // Now correctly pads with zeros
        });
        
        it('should handle extra digits when number is longer than format', () => {
            const result = formatNumber(12345, '###'); // format is shorter than number
            expect(result).toBe('12345'); // Should include all digits
        });
        
        it('should return empty string for non-finite numbers', () => {
            expect(formatNumber(Infinity, '0.00')).toBe('');
            expect(formatNumber(-Infinity, '0.00')).toBe('');
            expect(formatNumber(NaN, '0.00')).toBe('');
        });
    });

    describe('formatCurrency', () => {
        it('should format number with currency symbol', () => {
            const result = formatCurrency(1234.5, '$', '#,##0.00');
            expect(result).toBe('$1,234.50');
        });

        it('should format number with different currency symbol', () => {
            const result = formatCurrency(999, '€', '0.00');
            expect(result).toBe('€999.00');
        });

        it('should format negative numbers with currency', () => {
            const result = formatCurrency(-42, '¥', '#,##0');
            expect(result).toBe('¥-42');
        });

        it('should format zero with currency', () => {
            const result = formatCurrency(0, '£', '0.00');
            expect(result).toBe('£0.00');
        });
    });
});