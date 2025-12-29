import { pxToRem, remToPx, pxToVw, toPx } from '@/utils/units/length';
import { LengthContext } from '@/utils/units/types';

describe('length utils', () => {
  describe('pxToRem', () => {
    test('should convert px to rem', () => {
      expect(pxToRem(16, 16)).toBe(1);
      expect(pxToRem(32, 16)).toBe(2);
      expect(pxToRem(8, 16)).toBe(0.5);
      expect(pxToRem(0, 16)).toBe(0);
    });
  });

  describe('remToPx', () => {
    test('should convert rem to px', () => {
      expect(remToPx(1, 16)).toBe(16);
      expect(remToPx(2, 16)).toBe(32);
      expect(remToPx(0.5, 16)).toBe(8);
      expect(remToPx(0, 16)).toBe(0);
    });
  });

  describe('pxToVw', () => {
    test('should convert px to vw', () => {
      expect(pxToVw(50, 100)).toBe(50);
      expect(pxToVw(100, 200)).toBe(50);
      expect(pxToVw(300, 150)).toBe(200);
      expect(pxToVw(0, 100)).toBe(0);
    });
  });

  describe('toPx', () => {
    const ctx: LengthContext = {
      rootFontSize: 16,
      fontSize: 14,
      viewportWidth: 1000,
      viewportHeight: 800,
      percentBase: 200
    };

    test('should convert px to px (no conversion)', () => {
      expect(toPx({ value: 16, unit: 'px' }, ctx)).toBe(16);
      expect(toPx({ value: 32, unit: 'px' }, ctx)).toBe(32);
      expect(toPx({ value: 0, unit: 'px' }, ctx)).toBe(0);
    });

    test('should convert rem to px', () => {
      expect(toPx({ value: 1, unit: 'rem' }, ctx)).toBe(16);
      expect(toPx({ value: 2, unit: 'rem' }, ctx)).toBe(32);
      expect(toPx({ value: 0.5, unit: 'rem' }, ctx)).toBe(8);
    });

    test('should convert em to px', () => {
      expect(toPx({ value: 1, unit: 'em' }, ctx)).toBe(14);
      expect(toPx({ value: 2, unit: 'em' }, ctx)).toBe(28);
      expect(toPx({ value: 0.5, unit: 'em' }, ctx)).toBe(7);
    });

    test('should convert vw to px', () => {
      expect(toPx({ value: 10, unit: 'vw' }, ctx)).toBe(100); // (10/100) * 1000
      expect(toPx({ value: 50, unit: 'vw' }, ctx)).toBe(500); // (50/100) * 1000
    });

    test('should convert vh to px', () => {
      expect(toPx({ value: 10, unit: 'vh' }, ctx)).toBe(80); // (10/100) * 800
      expect(toPx({ value: 25, unit: 'vh' }, ctx)).toBe(200); // (25/100) * 800
    });

    test('should convert % to px', () => {
      expect(toPx({ value: 10, unit: '%' }, ctx)).toBe(20); // (10/100) * 200
      expect(toPx({ value: 50, unit: '%' }, ctx)).toBe(100); // (50/100) * 200
    });

    test('should throw error when percentBase is required but not provided', () => {
      const invalidCtx = { ...ctx };
      delete invalidCtx.percentBase;
      
      expect(() => toPx({ value: 10, unit: '%' }, invalidCtx as LengthContext))
        .toThrow('percentBase is required for % unit');
    });
  });
});