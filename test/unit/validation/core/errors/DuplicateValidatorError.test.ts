import { DuplicateValidatorError } from '@/validation';

describe('DuplicateValidatorError', () => {
    it('should create an error with basic message when no existing validator info provided', () => {
        const error = new DuplicateValidatorError('test-validator');
        
        expect(error).toBeInstanceOf(DuplicateValidatorError);
        expect(error.message).toBe('Validator with key "test-validator" is already registered.');
        expect(error.code).toBe('DUPLICATE_VALIDATOR');
        expect(error.context).toEqual({
            validatorKey: 'test-validator'
        });
    });

    it('should create an error with detailed message when existing validator info provided', () => {
        const error = new DuplicateValidatorError('test-validator', 'ExistingValidatorClass');
        
        expect(error.message).toBe('Validator with key "test-validator" is already registered. Existing validator: ExistingValidatorClass');
        expect(error.code).toBe('DUPLICATE_VALIDATOR');
        expect(error.context).toEqual({
            validatorKey: 'test-validator',
            existingValidatorInfo: 'ExistingValidatorClass'
        });
    });

    it('should include additional context information', () => {
        const context = { module: 'test-module', version: '1.0.0' };
        const error = new DuplicateValidatorError('test-validator', 'ExistingValidatorClass', context);
        
        expect(error.context).toEqual({
            validatorKey: 'test-validator',
            existingValidatorInfo: 'ExistingValidatorClass',
            module: 'test-module',
            version: '1.0.0'
        });
    });

    it('should extend BaseError', () => {
        const error = new DuplicateValidatorError('test-validator');
        expect(error).toBeInstanceOf(Error);
    });
});