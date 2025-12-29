import { parseLength } from '@/utils/units/parse';

describe('parse utils', () => {
  describe('parseLength', () => {
    test('should parse px values correctly', () => {
      expect(parseLength('16px')).toEqual({ value: 16, unit: 'px' });
      expect(parseLength('0px')).toEqual({ value: 0, unit: 'px' });
      expect(parseLength('-5px')).toEqual({ value: -5, unit: 'px' });
      expect(parseLength('1.5px')).toEqual({ value: 1.5, unit: 'px' });
    });

    test('should parse em values correctly', () => {
      expect(parseLength('2em')).toEqual({ value: 2, unit: 'em' });
      expect(parseLength('1.5em')).toEqual({ value: 1.5, unit: 'em' });
      expect(parseLength('-1em')).toEqual({ value: -1, unit: 'em' });
    });

    test('should parse rem values correctly', () => {
      expect(parseLength('1rem')).toEqual({ value: 1, unit: 'rem' });
      expect(parseLength('1.25rem')).toEqual({ value: 1.25, unit: 'rem' });
      expect(parseLength('-0.5rem')).toEqual({ value: -0.5, unit: 'rem' });
    });

    test('should parse % values correctly', () => {
      expect(parseLength('50%')).toEqual({ value: 50, unit: '%' });
      expect(parseLength('100%')).toEqual({ value: 100, unit: '%' });
      expect(parseLength('25.5%')).toEqual({ value: 25.5, unit: '%' });
    });

    test('should parse vw values correctly', () => {
      expect(parseLength('25vw')).toEqual({ value: 25, unit: 'vw' });
      expect(parseLength('50.5vw')).toEqual({ value: 50.5, unit: 'vw' });
    });

    test('should parse vh values correctly', () => {
      expect(parseLength('30vh')).toEqual({ value: 30, unit: 'vh' });
      expect(parseLength('75.2vh')).toEqual({ value: 75.2, unit: 'vh' });
    });

    test('should return null for invalid input', () => {
      expect(parseLength('')).toBeNull();
      expect(parseLength('abc')).toBeNull();
      expect(parseLength('10')).toBeNull();
      expect(parseLength('px')).toBeNull();
      expect(parseLength('10xyz')).toBeNull();
      expect(parseLength('  ')).toBeNull();
      expect(parseLength('10  px')).toBeNull(); // space between value and unit
    });

    test('should handle leading/trailing whitespace', () => {
      expect(parseLength('  16px')).toEqual({ value: 16, unit: 'px' });
      expect(parseLength('16px  ')).toEqual({ value: 16, unit: 'px' });
      expect(parseLength('  16px  ')).toEqual({ value: 16, unit: 'px' });
    });
  });
});