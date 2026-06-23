/**
 * BaseContext 单元测试
 */

import {
    createBaseContext,
    addStep,
    setError,
    clearError,
    setTerminate,
    isTerminated,
    ExecutionStep,
    BaseContext,
} from '@/context';

describe('BaseContext', () => {
    describe('createBaseContext', () => {
        it('should create empty context by default', () => {
            const context = createBaseContext();
            
            expect(context.steps).toEqual([]);
            expect(context.error).toBeUndefined();
            expect(context.metadata).toEqual({});
        });

        it('should create context with partial data', () => {
            const step: ExecutionStep = {
                processor: 'TestProcessor',
                action: 'executed',
            };
            
            const context = createBaseContext({
                steps: [step],
                error: new Error('test'),
                metadata: { custom: 'value' },
            });
            
            expect(context.steps).toHaveLength(1);
            expect(context.steps[0]).toEqual(step);
            expect(context.error).toBeInstanceOf(Error);
            expect(context.metadata.custom).toBe('value');
        });

        it('should preserve existing steps', () => {
            const step1: ExecutionStep = {
                processor: 'Processor1',
                action: 'executed',
            };
            
            const context = createBaseContext({
                steps: [step1],
            });
            
            expect(context.steps).toHaveLength(1);
            expect(context.steps[0].processor).toBe('Processor1');
        });
    });

    describe('addStep', () => {
        it('should add step to context', () => {
            const context = createBaseContext();
            const step: ExecutionStep = {
                processor: 'TestProcessor',
                action: 'executed',
                duration: 0.5,
            };
            
            addStep(context, step);
            
            expect(context.steps).toHaveLength(1);
            expect(context.steps[0]).toEqual(step);
        });

        it('should add multiple steps', () => {
            const context = createBaseContext();
            
            addStep(context, { processor: 'P1', action: 'executed' });
            addStep(context, { processor: 'P2', action: 'skipped' });
            addStep(context, { processor: 'P3', action: 'terminated' });
            
            expect(context.steps).toHaveLength(3);
            expect(context.steps[0].processor).toBe('P1');
            expect(context.steps[1].processor).toBe('P2');
            expect(context.steps[2].processor).toBe('P3');
        });

        it('should preserve step order', () => {
            const context = createBaseContext();
            
            for (let i = 0; i < 10; i++) {
                addStep(context, {
                    processor: `Processor${i}`,
                    action: 'executed',
                    weight: i,
                });
            }
            
            expect(context.steps).toHaveLength(10);
            for (let i = 0; i < 10; i++) {
                expect(context.steps[i].weight).toBe(i);
            }
        });
    });

    describe('setError', () => {
        it('should set error', () => {
            const context = createBaseContext();
            const error = new Error('Test error');
            
            setError(context, error);
            
            expect(context.error).toBe(error);
            expect(context.metadata.hasError).toBe(true);
        });

        it('should set error with string', () => {
            const context = createBaseContext();
            
            setError(context, 'String error');
            
            expect(context.error).toBe('String error');
            expect(context.metadata.hasError).toBe(true);
        });

        it('should set error with object', () => {
            const context = createBaseContext();
            const errorObj = { code: 'ERR001', message: 'Test' };
            
            setError(context, errorObj);
            
            expect(context.error).toEqual(errorObj);
            expect(context.metadata.hasError).toBe(true);
        });

        it('should override previous error', () => {
            const context = createBaseContext();
            
            setError(context, new Error('First'));
            expect(context.error.message).toBe('First');
            
            setError(context, new Error('Second'));
            expect(context.error.message).toBe('Second');
        });
    });

    describe('clearError', () => {
        it('should clear error', () => {
            const context = createBaseContext();
            setError(context, new Error('Test'));
            
            clearError(context);
            
            expect(context.error).toBeUndefined();
            expect(context.metadata.hasError).toBe(false);
        });

        it('should work when no error exists', () => {
            const context = createBaseContext();
            
            clearError(context);
            
            expect(context.error).toBeUndefined();
            expect(context.metadata.hasError).toBe(false);
        });
    });

    describe('setTerminate', () => {
        it('should set terminate flag', () => {
            const context = createBaseContext();
            
            setTerminate(context);
            
            expect(context.metadata.terminate).toBe(true);
        });

        it('should set terminate with reason', () => {
            const context = createBaseContext();
            
            setTerminate(context, 'Validation failed');
            
            expect(context.metadata.terminate).toBe(true);
            expect(context.metadata.terminateReason).toBe('Validation failed');
        });

        it('should not set reason if not provided', () => {
            const context = createBaseContext();
            
            setTerminate(context);
            
            expect(context.metadata.terminate).toBe(true);
            expect(context.metadata.terminateReason).toBeUndefined();
        });
    });

    describe('isTerminated', () => {
        it('should return false by default', () => {
            const context = createBaseContext();
            
            expect(isTerminated(context)).toBe(false);
        });

        it('should return true after setTerminate', () => {
            const context = createBaseContext();
            setTerminate(context);
            
            expect(isTerminated(context)).toBe(true);
        });

        it('should return false if terminate is false', () => {
            const context = createBaseContext();
            context.metadata.terminate = false;
            
            expect(isTerminated(context)).toBe(false);
        });
    });

    describe('Integration', () => {
        it('should support full workflow', () => {
            const context = createBaseContext();
            
            // 添加步骤
            addStep(context, {
                processor: 'Step1',
                action: 'executed',
                duration: 0.5,
            });
            
            // 设置错误
            setError(context, new Error('Failed'));
            
            // 设置终止
            setTerminate(context, 'Error occurred');
            
            // 验证状态
            expect(context.steps).toHaveLength(1);
            expect(context.error).toBeInstanceOf(Error);
            expect(context.metadata.hasError).toBe(true);
            expect(context.metadata.terminate).toBe(true);
            expect(isTerminated(context)).toBe(true);
        });

        it('should support error recovery', () => {
            const context = createBaseContext();
            
            // 设置错误
            setError(context, new Error('Failed'));
            expect(context.metadata.hasError).toBe(true);
            
            // 清除错误
            clearError(context);
            expect(context.metadata.hasError).toBe(false);
            
            // 继续执行
            addStep(context, {
                processor: 'Recovery',
                action: 'executed',
            });
            
            expect(context.steps).toHaveLength(1);
        });
    });
});

describe('ExecutionStep', () => {
    it('should create step with all fields', () => {
        const step: ExecutionStep = {
            processor: 'TestProcessor',
            weight: 100,
            offset: 10,
            action: 'executed',
            duration: 0.5,
            reason: 'Test reason',
            error: new Error('Test error'),
        };
        
        expect(step.processor).toBe('TestProcessor');
        expect(step.weight).toBe(100);
        expect(step.offset).toBe(10);
        expect(step.action).toBe('executed');
        expect(step.duration).toBe(0.5);
        expect(step.reason).toBe('Test reason');
        expect(step.error).toBeInstanceOf(Error);
    });

    it('should support all action types', () => {
        const actions: Array<'executed' | 'skipped' | 'terminated'> = [
            'executed',
            'skipped',
            'terminated',
        ];
        
        actions.forEach(action => {
            const step: ExecutionStep = {
                processor: 'Test',
                action,
            };
            expect(step.action).toBe(action);
        });
    });

    it('should create minimal step', () => {
        const step: ExecutionStep = {
            processor: 'Minimal',
            action: 'executed',
        };
        
        expect(step.processor).toBe('Minimal');
        expect(step.action).toBe('executed');
        expect(step.weight).toBeUndefined();
        expect(step.offset).toBeUndefined();
        expect(step.duration).toBeUndefined();
        expect(step.reason).toBeUndefined();
        expect(step.error).toBeUndefined();
    });
});
