/**
 * 验证核心功能测试
 */

// Mock Logger before importing validation
jest.mock('@qimenjs/logger', () => {
    const mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        trace: jest.fn(),
        fatal: jest.fn(),
        withFields: jest.fn().mockReturnThis(),
        withTag: jest.fn().mockReturnThis(),
    };

    return {
        Logger: {
            for: jest.fn().mockReturnValue(mockLogger),
            root: {
                emit: jest.fn(),
            },
        },
        ILogger: jest.fn(),
        LoggerChild: jest.fn().mockImplementation(() => mockLogger),
    };
});

import {
    doValidate,
    validationExecutor,
    ValidatorRegistrar,
    bootstrapValidators,
} from '@/validation';
import '@qimenjs/pattern';

// 启动验证器
bootstrapValidators();

describe('Validation Core', () => {
    describe('doValidate', () => {
        describe('String Validation', () => {
            it('should validate string type', async () => {
                const result = await doValidate('hello', { type: 'string' });
                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('should invalidate non-string type', async () => {
                const result = await doValidate(123, { type: 'string' });
                expect(result.isValid).toBe(false);
            });

            it('should validate required string', async () => {
                const result = await doValidate('', {
                    type: 'string',
                    required: true,
                    empty: false,
                });
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
            });

            it('should validate string length', async () => {
                const result = await doValidate('hello', {
                    type: 'string',
                    min: 3,
                    max: 10,
                });
                expect(result.isValid).toBe(true);
            });

            it('should invalidate string too short', async () => {
                const result = await doValidate('hi', {
                    type: 'string',
                    min: 3,
                });
                expect(result.isValid).toBe(false);
            });

            it('should invalidate string too long', async () => {
                const result = await doValidate('hello world', {
                    type: 'string',
                    max: 5,
                });
                expect(result.isValid).toBe(false);
            });

            it('should validate email format', async () => {
                const result = await doValidate('test@example.com', {
                    type: 'format',
                    format: 'email',
                });
                expect(result.isValid).toBe(true);
            });

            it('should invalidate wrong email format', async () => {
                const result = await doValidate('not-an-email', {
                    type: 'format',
                    format: 'email',
                });
                expect(result.isValid).toBe(false);
            });

            it('should validate URL format', async () => {
                const result = await doValidate('https://example.com', {
                    type: 'format',
                    format: 'url',
                });
                expect(result.isValid).toBe(true);
            });

            it('should validate pattern', async () => {
                const result = await doValidate('abc123', {
                    type: 'string',
                    pattern: /^[a-z0-9]+$/,
                });
                expect(result.isValid).toBe(true);
            });
        });

        describe('Number Validation', () => {
            it('should validate number type', async () => {
                const result = await doValidate(123, { type: 'number' });
                expect(result.isValid).toBe(true);
            });

            it('should invalidate non-number type', async () => {
                const result = await doValidate('123', { type: 'number' });
                expect(result.isValid).toBe(false);
            });

            it('should validate min/max', async () => {
                const result = await doValidate(5, {
                    type: 'number',
                    min: 1,
                    max: 10,
                });
                expect(result.isValid).toBe(true);
            });

            it('should invalidate number too small', async () => {
                const result = await doValidate(0, {
                    type: 'number',
                    min: 1,
                });
                expect(result.isValid).toBe(false);
            });

            it('should invalidate number too large', async () => {
                const result = await doValidate(15, {
                    type: 'number',
                    max: 10,
                });
                expect(result.isValid).toBe(false);
            });

            it('should validate integer', async () => {
                const result = await doValidate(5, {
                    type: 'number',
                    integer: true,
                });
                expect(result.isValid).toBe(true);
            });

            it('should invalidate non-integer', async () => {
                const result = await doValidate(5.5, {
                    type: 'number',
                    integer: true,
                });
                expect(result.isValid).toBe(false);
            });
        });

        describe('Boolean Validation', () => {
            it('should validate boolean type', async () => {
                const result = await doValidate(true, { type: 'boolean' });
                expect(result.isValid).toBe(true);
            });

            it('should invalidate non-boolean type', async () => {
                const result = await doValidate('true', { type: 'boolean' });
                expect(result.isValid).toBe(false);
            });
        });

        describe('Array Validation', () => {
            it('should validate array type', async () => {
                const result = await doValidate([1, 2, 3], { type: 'array' });
                expect(result.isValid).toBe(true);
            });

            it('should invalidate non-array type', async () => {
                const result = await doValidate('array', { type: 'array' });
                expect(result.isValid).toBe(false);
            });

            it('should validate array length', async () => {
                const result = await doValidate([1, 2, 3], {
                    type: 'array',
                    minLength: 2,
                    maxLength: 5,
                });
                expect(result.isValid).toBe(true);
            });

            it('should invalidate array too short', async () => {
                const result = await doValidate([1], {
                    type: 'array',
                    minLength: 2,
                });
                expect(result.isValid).toBe(false);
            });
        });

        describe('Object Validation', () => {
            it('should validate object type', async () => {
                const result = await doValidate({ name: 'test' }, { type: 'object' });
                expect(result.isValid).toBe(true);
            });

            it('should invalidate non-object type', async () => {
                const result = await doValidate('object', { type: 'object' });
                expect(result.isValid).toBe(false);
            });

            it('should invalidate array as object', async () => {
                const result = await doValidate([1, 2, 3], { type: 'object' });
                expect(result.isValid).toBe(false);
            });
        });

        describe('Execution Tracking', () => {
            it('should track execution steps', async () => {
                const result = await doValidate('test', { type: 'string' });
                expect(result.context.steps).toBeDefined();
                expect(Array.isArray(result.context.steps)).toBe(true);
                expect(result.context.steps.length).toBeGreaterThan(0);
            });

            it('should have execution metadata', async () => {
                const result = await doValidate('test', { type: 'string' });
                expect(result.context.metadata).toBeDefined();
            });

            it('should record step timing', async () => {
                const result = await doValidate('test@example.com', {
                    type: 'string',
                    format: 'email',
                });

                const step = result.context.steps[0];
                expect(step.duration).toBeDefined();
                expect(step.duration).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('validationExecutor', () => {
        it('should have stats', () => {
            const stats = validationExecutor.getStats();
            expect(stats).toBeDefined();
            expect(stats).toHaveProperty('totalExecutions');
            expect(stats).toHaveProperty('successCount');
            expect(stats).toHaveProperty('failureCount');
            expect(stats).toHaveProperty('averageDuration');
        });

        it('should track multiple validations', async () => {
            validationExecutor.resetStats();

            await doValidate('test1', { type: 'string' });
            await doValidate('test2', { type: 'string' });
            await doValidate('', { type: 'string', required: true });

            const stats = validationExecutor.getStats();
            expect(stats.totalExecutions).toBe(3);
        });

        it('should reset stats', () => {
            validationExecutor.resetStats();
            const stats = validationExecutor.getStats();
            expect(stats.totalExecutions).toBe(0);
            expect(stats.successCount).toBe(0);
            expect(stats.failureCount).toBe(0);
        });

        it('should print report', async () => {
            const result = await doValidate('test', { type: 'string' });

            // 构造 PipelineResult 格式的结果
            const pipelineResult = {
                context: result.context,
                steps: result.context.steps,
                isSuccess: result.isValid,
                totalDuration: 0,
                error: undefined,
            };

            // 不应该抛出错误
            expect(() => {
                validationExecutor.printReport(pipelineResult);
            }).not.toThrow();
        });
    });

    describe('ValidatorRegistrar', () => {
        it('should be singleton', () => {
            const instance1 = ValidatorRegistrar.getInstance();
            const instance2 = ValidatorRegistrar.getInstance();
            expect(instance1).toBe(instance2);
        });

        it('should have validators registered', () => {
            const validator = ValidatorRegistrar.getInstance();
            const stringProcessors = validator.get('string');
            expect(stringProcessors.length).toBeGreaterThan(0);
        });

        it('should have number validators', () => {
            const validator = ValidatorRegistrar.getInstance();
            const numberProcessors = validator.get('number');
            expect(numberProcessors.length).toBeGreaterThan(0);
        });

        it('should have boolean validators', () => {
            const validator = ValidatorRegistrar.getInstance();
            const booleanProcessors = validator.get('boolean');
            expect(booleanProcessors.length).toBeGreaterThan(0);
        });

        it('should have array validators', () => {
            const validator = ValidatorRegistrar.getInstance();
            const arrayProcessors = validator.get('array');
            expect(arrayProcessors.length).toBeGreaterThan(0);
        });

        it('should have object validators', () => {
            const validator = ValidatorRegistrar.getInstance();
            const objectProcessors = validator.get('object');
            expect(objectProcessors.length).toBeGreaterThan(0);
        });
    });
});
