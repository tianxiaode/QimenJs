import { getQuarter } from '../../../../../src/utils/date/calculation/quarters';

describe('Quarters Functions', () => {
  describe('getQuarter', () => {
    it('should return 1 for first quarter (Jan-Mar)', () => {
      expect(getQuarter(new Date(2023, 0, 15))).toBe(1); // Jan
      expect(getQuarter(new Date(2023, 1, 15))).toBe(1); // Feb
      expect(getQuarter(new Date(2023, 2, 15))).toBe(1); // Mar
    });

    it('should return 2 for second quarter (Apr-Jun)', () => {
      expect(getQuarter(new Date(2023, 3, 15))).toBe(2); // Apr
      expect(getQuarter(new Date(2023, 4, 15))).toBe(2); // May
      expect(getQuarter(new Date(2023, 5, 15))).toBe(2); // Jun
    });

    it('should return 3 for third quarter (Jul-Sep)', () => {
      expect(getQuarter(new Date(2023, 6, 15))).toBe(3); // Jul
      expect(getQuarter(new Date(2023, 7, 15))).toBe(3); // Aug
      expect(getQuarter(new Date(2023, 8, 15))).toBe(3); // Sep
    });

    it('should return 4 for fourth quarter (Oct-Dec)', () => {
      expect(getQuarter(new Date(2023, 9, 15))).toBe(4); // Oct
      expect(getQuarter(new Date(2023, 10, 15))).toBe(4); // Nov
      expect(getQuarter(new Date(2023, 11, 15))).toBe(4); // Dec
    });
  });
});