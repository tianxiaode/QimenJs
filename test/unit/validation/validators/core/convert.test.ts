import { normalizeChildRule } from '@/validation/validators/core/convert';
import { Validator } from '@/validation/core';

// Mock Validator
jest.mock('@/validation/core', () => ({
    ...jest.requireActual('@/validation/core'),
    Validator: {
        getValidator: jest.fn(),
        getRegisteredTypes: jest.fn(() => new Set(['string', 'number', 'email'])),
    },
}));

describe('normalizeChildRule', () => {
    const mockValidator = jest.fn();
    
    beforeEach(() => {
        jest.clearAllMocks();
        (Validator.getValidator as jest.Mock).mockReturnValue(mockValidator);
        mockValidator.mockReturnValue(null);
    });

    test('should return function directly if input is already a function', () => {
        const func = () => true;
        expect(normalizeChildRule(func)).toBe(func);
        expect(Validator.getValidator).not.toHaveBeenCalled();
    });

    test('should normalize object rule with valid type', () => {
        const rule = { type: 'string', required: true };
        const result = normalizeChildRule(rule);
        
        expect(Validator.getValidator).toHaveBeenCalledWith('string');
        expect(typeof result).toBe('function');
        
        // Test that the returned function calls the validator
        result('test value', rule, { field: 'test' });
        expect(mockValidator).toHaveBeenCalledWith('test value', rule, { field: 'test' });
    });

    test('should throw ValidationTypeNotDefinedError for invalid rule objects', () => {
        // Test null/undefined rule
        expect(() => normalizeChildRule(null)).toThrow('Child rule must have a type property');
        expect(() => normalizeChildRule(undefined)).toThrow('Child rule must have a type property');

        // Test non-object rule
        expect(() => normalizeChildRule('not an object')).toThrow('Child rule must have a type property');
        expect(() => normalizeChildRule(123)).toThrow('Child rule must have a type property');

        // Test object without type property
        expect(() => normalizeChildRule({})).toThrow('Child rule must have a type property');
        expect(() => normalizeChildRule({ name: 'test' })).toThrow('Child rule must have a type property');

        // Test object with non-string type property
        expect(() => normalizeChildRule({ type: 123 })).toThrow('Child rule must have a type property');
        expect(() => normalizeChildRule({ type: null })).toThrow('Child rule must have a type property');
        expect(() => normalizeChildRule({ type: {} })).toThrow('Child rule must have a type property');
    });

    test('should throw ValidatorNotFoundError when validator is not found', () => {
        (Validator.getValidator as jest.Mock).mockReturnValue(null);
        
        expect(() => normalizeChildRule({ type: 'nonexistent' })).toThrow('Validator for rule type \"nonexistent\" not found');
    });

    test('should return function that properly calls validator with all parameters', () => {
        const rule = { type: 'string', minLength: 5 };
        const testValue = 'hello world';
        const testContext = { field: 'testField', form: {} };
        
        const result = normalizeChildRule(rule);
        result(testValue, rule, testContext);
        
        expect(mockValidator).toHaveBeenCalledWith(testValue, rule, testContext);
    });
});