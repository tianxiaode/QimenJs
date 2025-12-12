import {
  assertMinLength,
  assertMaxLength,
  assertLengthRange,
  assertMin,
  assertMax,
  assertRange,
  assertIn,
  assertNotIn,
  assertAllConstraints,
  assertAnyConstraints,
  assertNotConstraints,
  assertEqualTo,
  assertNotEqualTo,
  assertGreaterThan,
  assertGreaterThanOrEqualTo,
  assertLessThan,
  assertLessThanOrEqualTo,
  assertBetween,
  assertBetweenExclusive,
  assertEmpty,
  assertNotEmpty,
  assertTruthyConstraint,
  assertFalsyConstraint,
  createRangeAssert,
  createLengthAssert,
  createInAssert,
  composeAssertions,
  conditionalAssert,
  InvalidInputError
} from '@orbitjs/utils';

describe('Assertion Constraints', () => {
  describe('Length assertions', () => {
    it('should pass assertMinLength for valid inputs', () => {
      expect(() => assertMinLength('hello', 3)).not.toThrow();
      expect(() => assertMinLength([1, 2, 3], 2)).not.toThrow();
    });

    it('should throw for assertMinLength with invalid inputs', () => {
      expect(() => assertMinLength('hi', 5)).toThrow(InvalidInputError);
      expect(() => assertMinLength([1], 3)).toThrow(InvalidInputError);
    });

    it('should pass assertMaxLength for valid inputs', () => {
      expect(() => assertMaxLength('hello', 10)).not.toThrow();
      expect(() => assertMaxLength([1, 2, 3], 5)).not.toThrow();
    });

    it('should throw for assertMaxLength with invalid inputs', () => {
      expect(() => assertMaxLength('hello world', 5)).toThrow(InvalidInputError);
      expect(() => assertMaxLength([1, 2, 3, 4, 5, 6], 5)).toThrow(InvalidInputError);
    });

    it('should pass assertLengthRange for valid inputs', () => {
      expect(() => assertLengthRange('hello', 3, 10)).not.toThrow();
    });

    it('should throw for assertLengthRange with invalid inputs', () => {
      expect(() => assertLengthRange('hi', 3, 10)).toThrow(InvalidInputError);
      expect(() => assertLengthRange('too long string', 3, 10)).toThrow(InvalidInputError);
    });
  });

  describe('Numeric assertions', () => {
    it('should pass assertMin for valid inputs', () => {
      expect(() => assertMin(5, 3)).not.toThrow();
      expect(() => assertMin('5', 3)).not.toThrow(); // String numbers now supported
    });

    it('should throw for assertMin with invalid inputs', () => {
      expect(() => assertMin(2, 3)).toThrow(InvalidInputError);
    });

    it('should pass assertMax for valid inputs', () => {
      expect(() => assertMax(5, 10)).not.toThrow();
      expect(() => assertMax('5', 10)).not.toThrow(); // String numbers now supported
    });

    it('should throw for assertMax with invalid inputs', () => {
      expect(() => assertMax(15, 10)).toThrow(InvalidInputError);
    });

    it('should pass assertRange for valid inputs', () => {
      expect(() => assertRange(5, 3, 10)).not.toThrow();
      expect(() => assertRange('7', 3, 10)).not.toThrow(); // String numbers now supported
    });

    it('should throw for assertRange with invalid inputs', () => {
      expect(() => assertRange(2, 3, 10)).toThrow(InvalidInputError);
      expect(() => assertRange(15, 3, 10)).toThrow(InvalidInputError);
    });

    it('should pass assertGreaterThan for valid inputs', () => {
      expect(() => assertGreaterThan(5, 3)).not.toThrow();
      expect(() => assertGreaterThan('5', 3)).not.toThrow(); // String numbers now supported
    });

    it('should throw for assertGreaterThan with invalid inputs', () => {
      expect(() => assertGreaterThan(3, 5)).toThrow(InvalidInputError);
    });

    it('should pass assertGreaterThanOrEqualTo for valid inputs', () => {
      expect(() => assertGreaterThanOrEqualTo(5, 3)).not.toThrow();
      expect(() => assertGreaterThanOrEqualTo(5, 5)).not.toThrow();
      expect(() => assertGreaterThanOrEqualTo('5', 5)).not.toThrow(); // String numbers now supported
    });

    it('should throw for assertGreaterThanOrEqualTo with invalid inputs', () => {
      expect(() => assertGreaterThanOrEqualTo(3, 5)).toThrow(InvalidInputError);
    });

    it('should pass assertLessThan for valid inputs', () => {
      expect(() => assertLessThan(3, 5)).not.toThrow();
      expect(() => assertLessThan('3', 5)).not.toThrow(); // String numbers now supported
    });

    it('should throw for assertLessThan with invalid inputs', () => {
      expect(() => assertLessThan(5, 3)).toThrow(InvalidInputError);
    });

    it('should pass assertLessThanOrEqualTo for valid inputs', () => {
      expect(() => assertLessThanOrEqualTo(3, 5)).not.toThrow();
      expect(() => assertLessThanOrEqualTo(5, 5)).not.toThrow();
      expect(() => assertLessThanOrEqualTo('5', 5)).not.toThrow(); // String numbers now supported
    });

    it('should throw for assertLessThanOrEqualTo with invalid inputs', () => {
      expect(() => assertLessThanOrEqualTo(7, 5)).toThrow(InvalidInputError);
    });

    it('should pass assertBetween for valid inputs', () => {
      expect(() => assertBetween(5, 3, 10)).not.toThrow();
      expect(() => assertBetween(3, 3, 10)).not.toThrow();
      expect(() => assertBetween('7', 3, 10)).not.toThrow(); // String numbers now supported
    });

    it('should throw for assertBetween with invalid inputs', () => {
      expect(() => assertBetween(2, 3, 10)).toThrow(InvalidInputError);
    });

    it('should pass assertBetweenExclusive for valid inputs', () => {
      expect(() => assertBetweenExclusive(5, 3, 10)).not.toThrow();
      expect(() => assertBetweenExclusive('7', 3, 10)).not.toThrow(); // String numbers now supported
    });

    it('should throw for assertBetweenExclusive with invalid inputs', () => {
      expect(() => assertBetweenExclusive(3, 3, 10)).toThrow(InvalidInputError);
      expect(() => assertBetweenExclusive(10, 3, 10)).toThrow(InvalidInputError);
    });
    
  });

  describe('Collection assertions', () => {
    it('should pass assertIn for valid inputs', () => {
      expect(() => assertIn(2, [1, 2, 3])).not.toThrow();
      expect(() => assertIn(2, new Set([1, 2, 3]))).not.toThrow();
    });

    it('should throw for assertIn with invalid inputs', () => {
      expect(() => assertIn(4, [1, 2, 3])).toThrow(InvalidInputError);
    });

    it('should pass assertNotIn for valid inputs', () => {
      expect(() => assertNotIn(4, [1, 2, 3])).not.toThrow();
    });

    it('should throw for assertNotIn with invalid inputs', () => {
      expect(() => assertNotIn(2, [1, 2, 3])).toThrow(InvalidInputError);
    });
  });

  describe('Equality assertions', () => {
    it('should pass assertEqualTo with strict comparison (default)', () => {
      expect(() => assertEqualTo(5, 5,true)).not.toThrow();
      expect(() => assertEqualTo(5, '5',true)).toThrow(InvalidInputError); // Strict comparison
    });

    it('should pass assertEqualTo with loose comparison', () => {
      expect(() => assertEqualTo(5, 5)).not.toThrow();
      expect(() => assertEqualTo(5, '5')).not.toThrow(); // Loose comparison
      expect(() => assertEqualTo(true, 1)).not.toThrow();
    });

    it('should pass assertNotEqualTo with strict comparison (default)', () => {
      expect(() => assertNotEqualTo(5, 3)).not.toThrow();
      expect(() => assertNotEqualTo(5, '5')).toThrow(InvalidInputError); // Strict comparison
    });

    it('should pass assertNotEqualTo with loose comparison', () => {
      expect(() => assertNotEqualTo(5, 3, false)).not.toThrow();
      expect(() => assertNotEqualTo(5, '5', false)).toThrow(InvalidInputError); // Loose comparison
    });
  });

  describe('Logical assertions', () => {
    it('should pass assertAllConstraints when all validators pass', () => {
      const validators = [(v: number) => v > 0, (v: number) => v < 10];
      expect(() => assertAllConstraints(5, validators)).not.toThrow();
    });

    it('should throw for assertAllConstraints when any validator fails', () => {
      const validators = [(v: number) => v > 0, (v: number) => v < 10];
      expect(() => assertAllConstraints(15, validators)).toThrow(InvalidInputError);
    });

    it('should pass assertAnyConstraints when at least one validator passes', () => {
      const validators = [(v: number) => v < 0, (v: number) => v > 10];
      expect(() => assertAnyConstraints(15, validators)).not.toThrow();
    });

    it('should throw for assertAnyConstraints when all validators fail', () => {
      const validators = [(v: number) => v < 0, (v: number) => v > 10];
      expect(() => assertAnyConstraints(5, validators)).toThrow(InvalidInputError);
    });

    it('should pass assertNotConstraints when validator fails', () => {
      const validator = (v: number) => v > 0;
      expect(() => assertNotConstraints(-5, validator)).not.toThrow();
    });

    it('should throw for assertNotConstraints when validator passes', () => {
      const validator = (v: number) => v > 0;
      expect(() => assertNotConstraints(5, validator)).toThrow(InvalidInputError);
    });
  });

  describe('Emptiness assertions', () => {
    it('should pass assertEmpty for empty values', () => {
      expect(() => assertEmpty(null)).not.toThrow();
      expect(() => assertEmpty(undefined)).not.toThrow();
      expect(() => assertEmpty('')).not.toThrow();
      expect(() => assertEmpty([])).not.toThrow();
      expect(() => assertEmpty({})).not.toThrow();
    });

    it('should throw for assertEmpty with non-empty values', () => {
      expect(() => assertEmpty('hello')).toThrow(InvalidInputError);
      expect(() => assertEmpty([1, 2])).toThrow(InvalidInputError);
    });

    it('should pass assertNotEmpty for non-empty values', () => {
      expect(() => assertNotEmpty('hello')).not.toThrow();
      expect(() => assertNotEmpty([1, 2])).not.toThrow();
    });

    it('should throw for assertNotEmpty with empty values', () => {
      expect(() => assertNotEmpty('')).toThrow(InvalidInputError);
      expect(() => assertNotEmpty([])).toThrow(InvalidInputError);
    });
  });

  describe('Truthiness assertions', () => {
    it('should pass assertTruthyConstraint for truthy values', () => {
      expect(() => assertTruthyConstraint(true)).not.toThrow();
      expect(() => assertTruthyConstraint(1)).not.toThrow();
      expect(() => assertTruthyConstraint('hello')).not.toThrow();
    });

    it('should throw for assertTruthyConstraint with falsy values', () => {
      expect(() => assertTruthyConstraint(false)).toThrow(InvalidInputError);
      expect(() => assertTruthyConstraint(0)).toThrow(InvalidInputError);
      expect(() => assertTruthyConstraint('')).toThrow(InvalidInputError);
    });

    it('should pass assertFalsyConstraint for falsy values', () => {
      expect(() => assertFalsyConstraint(false)).not.toThrow();
      expect(() => assertFalsyConstraint(0)).not.toThrow();
      expect(() => assertFalsyConstraint('')).not.toThrow();
    });

    it('should throw for assertFalsyConstraint with truthy values', () => {
      expect(() => assertFalsyConstraint(true)).toThrow(InvalidInputError);
      expect(() => assertFalsyConstraint(1)).toThrow(InvalidInputError);
      expect(() => assertFalsyConstraint('hello')).toThrow(InvalidInputError);
    });
  });

  describe('Cross-type comparisons', () => {
    it('should support cross-type numeric comparisons', () => {
      expect(() => assertGreaterThan('10', 5)).not.toThrow();
      expect(() => assertLessThan('5', 10)).not.toThrow();
      expect(() => assertEqualTo('5', 5)).not.toThrow();
    });

    it('should support date comparisons', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-12-31');
      expect(() => assertGreaterThan(date2, date1)).not.toThrow();
    });
  });

  describe('Factory functions', () => {
    it('should create and use range assert function', () => {
      const assertRangeFn = createRangeAssert(3, 10);
      expect(() => assertRangeFn(5)).not.toThrow();
      expect(() => assertRangeFn(2)).toThrow(InvalidInputError);
    });

    it('should create and use length assert function', () => {
      const assertLengthFn = createLengthAssert(3, 10);
      expect(() => assertLengthFn('hello')).not.toThrow();
      expect(() => assertLengthFn('hi')).toThrow(InvalidInputError);
    });

    it('should create and use inclusion assert function', () => {
      const assertInFn = createInAssert([1, 2, 3]);
      expect(() => assertInFn(2)).not.toThrow();
      expect(() => assertInFn(4)).toThrow(InvalidInputError);
    });
  });

  describe('Utility functions', () => {
    it('should compose multiple assertions', () => {
      const composed = composeAssertions(
        (value) => assertMin(value, 1),
        (value) => assertMax(value, 10)
      );
      
      expect(() => composed(5)).not.toThrow();
      expect(() => composed(15)).toThrow(InvalidInputError);
    });

    it('should conditionally assert', () => {
      expect(() => conditionalAssert(true, (value) => assertMin(value, 5), 3)).toThrow(InvalidInputError);
      expect(() => conditionalAssert(false, (value) => assertMin(value, 5), 3)).not.toThrow();
    });
  });
});