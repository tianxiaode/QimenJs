import { ValidationContext, ValidationRule } from '../../../../src/validation/types';
import { StringIncludesProcessor } from '../../../../src/validation/processors/string/includes';
import { StringExcludesProcessor } from '../../../../src/validation/processors/string/excludes';
import { NumberIncludesProcessor } from '../../../../src/validation/processors/number/includes';
import { NumberExcludesProcessor } from '../../../../src/validation/processors/number/excludes';
import { ArrayIncludesProcessor } from '../../../../src/validation/processors/array/includes';
import { ArrayExcludesProcessor } from '../../../../src/validation/processors/array/excludes';

describe('Includes and Excludes Processors', () => {
  describe('String Includes Processor', () => {
    it('should pass validation when value is in includes array', async () => {
      const context: ValidationContext = {
        value: 'valid',
        rule: { includes: ['valid', 'also-valid'] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await StringIncludesProcessor(context);

      expect(context.errors).toHaveLength(0);
    });

    it('should add error when value is not in includes array', async () => {
      const context: ValidationContext = {
        value: 'invalid',
        rule: { includes: ['valid', 'also-valid'] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await StringIncludesProcessor(context);

      expect(context.errors).toHaveLength(1);
      expect(context.errors[0].code).toBe('not_allowed');
    });

    it('should support function returning array', async () => {
      const allowedValues = ['valid', 'also-valid'];
      const context: ValidationContext = {
        value: 'valid',
        rule: { includes: (rule: ValidationRule) => allowedValues },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await StringIncludesProcessor(context);

      expect(context.errors).toHaveLength(0);
    });
  });

  describe('String Excludes Processor', () => {
    it('should add error when value is in excludes array', async () => {
      const context: ValidationContext = {
        value: 'invalid',
        rule: { excludes: ['invalid', 'also-invalid'] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await StringExcludesProcessor(context);

      expect(context.errors).toHaveLength(1);
      expect(context.errors[0].code).toBe('not_allowed');
    });

    it('should pass validation when value is not in excludes array', async () => {
      const context: ValidationContext = {
        value: 'valid',
        rule: { excludes: ['invalid', 'also-invalid'] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await StringExcludesProcessor(context);

      expect(context.errors).toHaveLength(0);
    });
  });

  describe('Number Includes Processor', () => {
    it('should pass validation when number value is in includes array', async () => {
      const context: ValidationContext = {
        value: 42,
        rule: { includes: [42, 100, 200] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await NumberIncludesProcessor(context);

      expect(context.errors).toHaveLength(0);
    });

    it('should add error when number value is not in includes array', async () => {
      const context: ValidationContext = {
        value: 999,
        rule: { includes: [42, 100, 200] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await NumberIncludesProcessor(context);

      expect(context.errors).toHaveLength(1);
      expect(context.errors[0].code).toBe('not_allowed');
    });
  });

  describe('Number Excludes Processor', () => {
    it('should add error when number value is in excludes array', async () => {
      const context: ValidationContext = {
        value: 42,
        rule: { excludes: [42, 100, 200] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await NumberExcludesProcessor(context);

      expect(context.errors).toHaveLength(1);
      expect(context.errors[0].code).toBe('not_allowed');
    });

    it('should pass validation when number value is not in excludes array', async () => {
      const context: ValidationContext = {
        value: 999,
        rule: { excludes: [42, 100, 200] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await NumberExcludesProcessor(context);

      expect(context.errors).toHaveLength(0);
    });
  });

  describe('Array Includes Processor', () => {
    it('should pass validation when array value is in includes array', async () => {
      const context: ValidationContext = {
        value: [1, 2, 3],
        rule: { includes: [[1, 2, 3], [4, 5, 6]] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await ArrayIncludesProcessor(context);

      expect(context.errors).toHaveLength(0);
    });

    it('should add error when array value is not in includes array', async () => {
      const context: ValidationContext = {
        value: [7, 8, 9],
        rule: { includes: [[1, 2, 3], [4, 5, 6]] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await ArrayIncludesProcessor(context);

      expect(context.errors).toHaveLength(1);
      expect(context.errors[0].code).toBe('not_allowed');
    });
  });

  describe('Array Excludes Processor', () => {
    it('should add error when array value is in excludes array', async () => {
      const context: ValidationContext = {
        value: [1, 2, 3],
        rule: { excludes: [[1, 2, 3], [4, 5, 6]] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await ArrayExcludesProcessor(context);

      expect(context.errors).toHaveLength(1);
      expect(context.errors[0].code).toBe('not_allowed');
    });

    it('should pass validation when array value is not in excludes array', async () => {
      const context: ValidationContext = {
        value: [7, 8, 9],
        rule: { excludes: [[1, 2, 3], [4, 5, 6]] },
        errors: [],
        field: 'testField',
        label: 'Test Field'
      };

      await ArrayExcludesProcessor(context);

      expect(context.errors).toHaveLength(0);
    });
  });
});