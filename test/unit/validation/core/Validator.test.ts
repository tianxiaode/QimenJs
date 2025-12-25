import {
    Validator,
    DuplicateValidatorError,
    ValidationTypeNotDefinedError,
    ValidatorNotFoundError,
    ValidationErrorContext,
    ValidatorFunction,
    ValidationErrorBuilder,
    ValidationErrorCode,
} from '@/validation';

// Mock validator functions for testing - 修正返回类型
const mockValidator: ValidatorFunction = (value: any, rule: any, context: any) => {
    if (value === null || value === undefined) {
        return [ValidationErrorBuilder.required(context)];
    }
    return null;
};

const mockStringValidator: ValidatorFunction = (value: any, rule: any, context: any) => {
    if (typeof value !== 'string') {
        return [{ code: 'typeError', params: { expected: 'string' }, context }];
    }
    return null;
};

describe('Validator', () => {
    beforeEach(() => {
        // 清空所有已注册的验证器
        const validators: any = Validator['validators'];
        Object.keys(validators).forEach(key => delete validators[key]);
    });

    describe('registerValidator', () => {
        it('should register a new validator', () => {
            Validator.registerValidator('test', mockValidator);
            expect(Validator.getValidator('test')).toBe(mockValidator);
        });

        it('should throw DuplicateValidatorError when registering duplicate validator', () => {
            Validator.registerValidator('test', mockValidator);

            expect(() => {
                Validator.registerValidator('test', mockValidator);
            }).toThrow(DuplicateValidatorError);
        });

        it('should provide detailed error info when duplicate validator is registered', () => {
            Validator.registerValidator('test', mockValidator);

            try {
                Validator.registerValidator('test', mockValidator);
                fail('Expected DuplicateValidatorError to be thrown');
            } catch (error: any) {
                expect(error).toBeInstanceOf(DuplicateValidatorError);
                expect(error.context.validatorKey).toBe('test');
                expect(error.context.existingValidatorInfo).toContain('mockValidator');
            }
        });
    });

    describe('getValidator', () => {
        it('should return the registered validator', () => {
            Validator.registerValidator('string', mockStringValidator);
            const retrievedValidator = Validator.getValidator('string');
            expect(retrievedValidator).toBe(mockStringValidator);
        });

        it('should return undefined for non-existent validator', () => {
            const retrievedValidator = Validator.getValidator('nonexistent');
            expect(retrievedValidator).toBeUndefined();
        });
    });

    describe('executeValidator', () => {
        it('should execute the validator and return result', () => {
            Validator.registerValidator('required', mockValidator);
            const result = Validator.executeValidator('test', { type: 'required' });
            expect(result).toBeNull(); // 有效值时返回null
        });

        it('should return validation errors when validation fails', () => {
            Validator.registerValidator('required', mockValidator);
            const result = Validator.executeValidator(undefined, { type: 'required' });
            expect(result).not.toBeNull();
            expect(Array.isArray(result)).toBe(true);
            expect(result![0]).toHaveProperty('code', ValidationErrorCode.REQUIRED);
        });

        it('should throw ValidationTypeNotDefinedError when type is not defined', () => {
            expect(() => {
                Validator.executeValidator('test', {});
            }).toThrow(ValidationTypeNotDefinedError);
        });

        it('should throw ValidatorNotFoundError when validator is not found', () => {
            expect(() => {
                Validator.executeValidator('test', { type: 'nonexistent' });
            }).toThrow(ValidatorNotFoundError);
        });

        it('should pass value and context to validator', () => {
            const mockValidatorWithArgs: ValidatorFunction = jest.fn((value, rule, context) => {
                return null;
            });

            Validator.registerValidator('test', mockValidatorWithArgs);
            const testValue = 'test value';
            const testRule = { type: 'test', minLength: 5 };
            const testContext: ValidationErrorContext = { field: 'username' };

            Validator.executeValidator(testValue, testRule, testContext);

            expect(mockValidatorWithArgs).toHaveBeenCalledWith(testValue, testRule, testContext);
        });
    });

    describe('getRegisteredTypes', () => {
        it('should return an empty array when no validators are registered', () => {
            const types = Validator.getRegisteredTypes();
            expect(types).toEqual([]);
        });

        it('should return an array of registered validator types', () => {
            Validator.registerValidator('required', mockValidator);
            Validator.registerValidator('string', mockStringValidator);

            const types = Validator.getRegisteredTypes();
            expect(types).toEqual(['required', 'string']);
        });
    });

    describe('getValidatorInfo', () => {
        it('should return function name and source preview for named function', () => {
            const validatorFn = function testValidator() {
                return null;
            };
            const info = (Validator as any).getValidatorInfo(validatorFn);
            expect(info).toContain('testValidator');
            expect(info).toContain('(');
        });

        it('should handle anonymous functions', () => {
            // 使用真正的匿名函数，而不是赋值给有名称的变量
            const info = (Validator as any).getValidatorInfo(() => {
                return null;
            });
            expect(info).toContain('anonymous');
        });

        it('should truncate long function source', () => {
            const longValidator = () => {
                // 模拟一个长函数体
                const code = 'function veryLongFunction() { ' + 'x'.repeat(150) + ' }';
                return null;
            };
            const info = (Validator as any).getValidatorInfo(longValidator);
            expect(info).toContain('...');
        });
    });

    describe('listValidators', () => {
        it('should log registered validators to console', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            Validator.registerValidator('required', mockValidator);
            Validator.listValidators();

            expect(consoleSpy).toHaveBeenCalledWith('[Registered Validators]');
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('- required:'));

            consoleSpy.mockRestore();
        });
    });

    describe('showValidator', () => {
        it('should log validator details when validator exists', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            Validator.registerValidator('test', mockValidator);
            Validator.showValidator('test');

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Validator Details]'));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Key: test'));

            consoleSpy.mockRestore();
        });

        it('should log warning when validator does not exist', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            Validator.showValidator('nonexistent');

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Validator] No validator found with key: nonexistent'
            );

            consoleSpy.mockRestore();
        });
    });

    describe('integration tests', () => {
        it('should register, retrieve, and execute validator in sequence', () => {
            // 注册验证器
            Validator.registerValidator('email', (value: any) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return [{ code: 'emailFormat', message: 'Invalid email format' }];
                }
                return null;
            });

            // 验证正确邮箱
            const validResult = Validator.executeValidator('test@example.com', { type: 'email' });
            expect(validResult).toBeNull(); // 有效值时返回null

            // 验证错误邮箱
            const invalidResult = Validator.executeValidator('invalid-email', { type: 'email' });
            expect(invalidResult).not.toBeNull();
            expect(Array.isArray(invalidResult)).toBe(true);
            expect(invalidResult![0]).toEqual({ code: 'emailFormat', message: 'Invalid email format' });
        });
    });
});