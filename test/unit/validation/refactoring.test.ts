/**
 * 验证模块重构测试
 * 
 * 测试重构后的验证功能是否正常工作
 */

import { doValidate, validationExecutor, ValidatorRegistrar, bootstrapValidators } from '../../../src/validation';

// 启动验证器
bootstrapValidators();

describe('Validation Module Refactoring', () => {
    
    describe('doValidate', () => {
        it('should validate string type', async () => {
            const result = await doValidate('hello', { type: 'string' });
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate required field', async () => {
            const result = await doValidate('', { 
                type: 'string',
                required: true 
            });
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should validate email format', async () => {
            const result = await doValidate('test@example.com', { 
                type: 'string',
                format: 'email' 
            });
            expect(result.isValid).toBe(true);
        });

        it('should invalidate wrong email format', async () => {
            const result = await doValidate('not-an-email', { 
                type: 'string',
                format: 'email' 
            });
            expect(result.isValid).toBe(false);
        });

        it('should validate number type', async () => {
            const result = await doValidate(123, { type: 'number' });
            expect(result.isValid).toBe(true);
        });

        it('should validate min/max', async () => {
            const result = await doValidate(5, { 
                type: 'number',
                min: 1,
                max: 10 
            });
            expect(result.isValid).toBe(true);
        });

        it('should invalidate out of range', async () => {
            const result = await doValidate(15, { 
                type: 'number',
                min: 1,
                max: 10 
            });
            expect(result.isValid).toBe(false);
        });

        it('should track execution steps', async () => {
            const result = await doValidate('test', { type: 'string' });
            expect(result.context.steps).toBeDefined();
            expect(Array.isArray(result.context.steps)).toBe(true);
        });

        it('should have execution metadata', async () => {
            const result = await doValidate('test', { type: 'string' });
            expect(result.context.metadata).toBeDefined();
        });
    });

    describe('validationExecutor', () => {
        it('should have stats', () => {
            const stats = validationExecutor.getStats();
            expect(stats).toBeDefined();
            expect(stats.totalExecutions).toBeGreaterThanOrEqual(0);
            expect(stats.successCount).toBeGreaterThanOrEqual(0);
            expect(stats.failureCount).toBeGreaterThanOrEqual(0);
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
    });

    describe('Execution Tracking', () => {
        it('should record execution steps with timing', async () => {
            const result = await doValidate('test@example.com', { 
                type: 'string',
                format: 'email' 
            });
            
            expect(result.context.steps.length).toBeGreaterThan(0);
            
            const step = result.context.steps[0];
            expect(step.processor).toBeDefined();
            expect(step.action).toBeDefined();
            expect(step.duration).toBeGreaterThanOrEqual(0);
        });

        it('should handle termination', async () => {
            // 测试熔断机制
            const result = await doValidate('', { 
                type: 'string',
                required: true 
            });
            
            expect(result.isValid).toBe(false);
            expect(result.context.terminate).toBeDefined();
        });
    });
});
