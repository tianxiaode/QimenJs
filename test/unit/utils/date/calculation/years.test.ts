import { addYears, getFirstDayOfYear, getLastDayOfYear } from '../../../../../src/utils/date/calculation/years';

describe('Years Functions', () => {
  describe('addYears', () => {
    it('should add years to a date', () => {
      const date = new Date(2023, 5, 15); // June 15, 2023
      const result = addYears(date, 5);
      expect(result.getFullYear()).toBe(2028);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
    });

    it('should subtract years when negative value is provided', () => {
      const date = new Date(2023, 5, 15); // June 15, 2023
      const result = addYears(date, -3);
      expect(result.getFullYear()).toBe(2020);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
    });

    it('should handle leap year transition', () => {
      const date = new Date(2020, 1, 29); // Feb 29, 2020 (leap year)
      const result = addYears(date, 1); // Add 1 year to get to 2021
      expect(result.getFullYear()).toBe(2021);
      expect(result.getMonth()).toBe(1); // February (0-indexed)
      expect(result.getDate()).toBe(28); // Feb 28, 2021 (not a leap year, so Feb 29 doesn't exist)
    });
    
    it('should correctly handle leap year when adding 4 years', () => {
      const date = new Date(2020, 1, 29); // Feb 29, 2020 (leap year)
      const result = addYears(date, 4); // Add 4 years to get to 2024 (also leap year)
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // February (0-indexed)
      expect(result.getDate()).toBe(29); // Feb 29, 2024 (leap year)
    });
  });

  describe('getFirstDayOfYear', () => {
    it('should return the first day of the year', () => {
      const date = new Date(2023, 5, 15); // June 15, 2023
      const result = getFirstDayOfYear(date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getLastDayOfYear', () => {
    it('should return the last day of the year', () => {
      const date = new Date(2023, 5, 15); // June 15, 2023
      const result = getLastDayOfYear(date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(31);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });
});