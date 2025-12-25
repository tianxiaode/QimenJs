import { addMonths, getDaysInMonth, getFirstDayOfMonth, getLastDayOfMonth } from '../../../../../src/utils/date/calculation/months';

describe('Months Functions', () => {
  describe('addMonths', () => {
    it('should add months to a date', () => {
      const date = new Date(2023, 0, 15); // Jan 15, 2023
      const result = addMonths(date, 2);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getFullYear()).toBe(2023);
      expect(result.getDate()).toBe(15);
    });

    it('should handle month overflow correctly', () => {
      const date = new Date(2023, 0, 31); // Jan 31, 2023
      const result = addMonths(date, 1);
      // Feb doesn't have 31 days, so it should be the last day of Feb
      expect(result.getMonth()).toBe(1); // February
      expect(result.getFullYear()).toBe(2023);
      expect(result.getDate()).toBe(28); // Feb 28, 2023
    });

    it('should handle year transition', () => {
      const date = new Date(2023, 11, 15); // Dec 15, 2023
      const result = addMonths(date, 2);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getFullYear()).toBe(2024);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct days for February in leap year', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29); // Feb 2024 (leap year)
    });

    it('should return correct days for February in non-leap year', () => {
      expect(getDaysInMonth(2023, 1)).toBe(28); // Feb 2023 (non-leap year)
    });

    it('should return correct days for months with 30 days', () => {
      expect(getDaysInMonth(2023, 3)).toBe(30); // April
      expect(getDaysInMonth(2023, 8)).toBe(30); // September
    });

    it('should return correct days for months with 31 days', () => {
      expect(getDaysInMonth(2023, 0)).toBe(31); // January
      expect(getDaysInMonth(2023, 6)).toBe(31); // July
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('should return the first day of the month', () => {
      const date = new Date(2023, 5, 15); // June 15, 2023
      const result = getFirstDayOfMonth(date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getLastDayOfMonth', () => {
    it('should return the last day of the month', () => {
      const date = new Date(2023, 5, 15); // June 15, 2023
      const result = getLastDayOfMonth(date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(30);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should handle February correctly', () => {
      const date = new Date(2023, 1, 15); // Feb 15, 2023
      const result = getLastDayOfMonth(date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(28);
    });
  });
});