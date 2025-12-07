import { InvalidInputError, BaseError } from '@/utils';

describe('InvalidInputError', () => {
  describe('constructor', () => {
    it('should create an instance with default values', () => {
      const error = new InvalidInputError('Test message');
      
      expect(error).toBeInstanceOf(InvalidInputError);
      expect(error).toBeInstanceOf(BaseError);
      expect(error.name).toBe('InvalidInputError');
      expect(error.message).toBe('Test message');
      expect((error as any).code).toBe('INVALID_INPUT');
      expect((error as any).context).toEqual({});
    });

    it('should create an instance with all options', () => {
      const error = new InvalidInputError('Test message', {
        field: 'username',
        value: 'user@123',
        expected: 'string without special characters',
        code: 'INVALID_USERNAME'
      });
      
      expect(error.name).toBe('InvalidInputError');
      expect(error.message).toBe('Test message');
      expect((error as any).code).toBe('INVALID_USERNAME');
      expect((error as any).context).toEqual({
        field: 'username',
        value: 'user@123',
        expected: 'string without special characters'
      });
    });

    it('should handle undefined values in context', () => {
      const error = new InvalidInputError('Test message', {
        field: 'username'
        // value and expected are omitted
      });
      
      expect((error as any).context).toEqual({
        field: 'username'
      });
      expect((error as any).context.value).toBeUndefined();
      expect((error as any).context.expected).toBeUndefined();
    });
  });

  describe('static methods', () => {
    describe('forField', () => {
      it('should create error for a field with value', () => {
        const error = InvalidInputError.forField(
          'email',
          'must be a valid email address',
          'invalid-email'
        );
        
        expect(error).toBeInstanceOf(InvalidInputError);
        expect(error.message).toBe('email: must be a valid email address');
        expect((error as any).code).toBe('INVALID_INPUT');
        expect((error as any).context).toEqual({
          field: 'email',
          value: 'invalid-email'
        });
      });

      it('should create error for a field without value', () => {
        const error = InvalidInputError.forField(
          'password',
          'must be at least 8 characters'
        );
        
        expect(error.message).toBe('password: must be at least 8 characters');
        expect((error as any).context).toEqual({
          field: 'password'
        });
        expect((error as any).context.value).toBeUndefined();
      });
    });

    describe('forType', () => {
      it('should create type error for a field', () => {
        const actualValue = 123;
        const error = InvalidInputError.forType(
          'age',
          'string',
          actualValue
        );
        
        expect(error.message).toBe('age must be string, got number');
        expect((error as any).context).toEqual({
          field: 'age',
          expected: 'string',
          value: 123
        });
      });

      it('should handle various types', () => {
        const testCases = [
          { value: 'hello', type: 'string' },
          { value: 123, type: 'number' },
          { value: true, type: 'boolean' },
          { value: {}, type: 'object' },
          { value: [], type: 'object' }, // array is typeof object
          { value: null, type: 'object' }, // null is typeof object
          { value: undefined, type: 'undefined' }
        ];
        
        testCases.forEach(({ value, type }) => {
          const error = InvalidInputError.forType('field', 'expectedType', value);
          expect(error.message).toBe(`field must be expectedType, got ${type}`);
        });
      });
    });

    describe('forRange', () => {
      it('should create range error with both min and max', () => {
        const error = InvalidInputError.forRange(
          'age',
          18,
          65,
          70
        );
        
        expect(error.message).toBe('age is out of range (expected between 18 and 65)');
        expect((error as any).context).toEqual({
          field: 'age',
          value: 70,
          expected: 'between 18 and 65'
        });
      });

      it('should create range error with only min', () => {
        const error = InvalidInputError.forRange(
          'temperature',
          0,
          undefined,
          -5
        );
        
        expect(error.message).toBe('temperature is out of range (expected at least 0)');
        expect((error as any).context).toEqual({
          field: 'temperature',
          value: -5,
          expected: 'at least 0'
        });
      });

      it('should create range error with only max', () => {
        const error = InvalidInputError.forRange(
          'discount',
          undefined,
          50,
          75
        );
        
        expect(error.message).toBe('discount is out of range (expected at most 50)');
        expect((error as any).context).toEqual({
          field: 'discount',
          value: 75,
          expected: 'at most 50'
        });
      });

      it('should create range error without min and max', () => {
        const error = InvalidInputError.forRange('value');
        
        expect(error.message).toBe('value is out of range');
        expect((error as any).context).toEqual({
          field: 'value',
          expected: ''
        });
        expect((error as any).context.value).toBeUndefined();
        expect((error as any).context.expected).toBe('');
      });

      it('should create range error without actual value', () => {
        const error = InvalidInputError.forRange(
          'score',
          0,
          100
        );
        
        expect(error.message).toBe('score is out of range (expected between 0 and 100)');
        expect((error as any).context).toEqual({
          field: 'score',
          expected: 'between 0 and 100'
        });
        expect((error as any).context.value).toBeUndefined();
      });
    });
  });

  describe('inheritance and error properties', () => {
    it('should have correct prototype chain', () => {
      const error = new InvalidInputError('Test');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(InvalidInputError);
    });

    it('should have stack trace', () => {
      const error = new InvalidInputError('Test');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new InvalidInputError('Test error');
      }).toThrow(InvalidInputError);
      
      expect(() => {
        throw new InvalidInputError('Test error');
      }).toThrow('Test error');
    });
  });
});
