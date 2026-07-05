/**
 * Pipeline Executor 单元测试
 */

// Mock Logger
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

import { Pipeline } from '@/pipeline';
import { createBaseContext, BaseContext } from '@/context';

describe('Pipeline', () => {
    let pipeline: Pipeline;

    beforeEach(() => {
        pipeline = new Pipeline();
    });

    describe('execute', () => {
        it('should execute empty pipeline', async () => {
            const context = createBaseContext();
            const result = await pipeline.execute(context, []);

            expect(result.isSuccess).toBe(true);
            expect(result.steps).toEqual([]);
            expect(result.context).toBe(context);
        });

        it('should execute single processor', async () => {
            const context = createBaseContext();
            const processors = [
                {
                    name: 'TestProcessor',
                    execute: async (ctx: BaseContext) => {
                        ctx.metadata.test = 'executed';
                    },
                },
            ];

            const result = await pipeline.execute(context, processors);

            expect(result.isSuccess).toBe(true);
            expect(result.steps).toHaveLength(1);
            expect(result.steps[0].processor).toBe('TestProcessor');
            expect(result.steps[0].action).toBe('executed');
            expect(result.context.metadata.test).toBe('executed');
        });

        it('should execute multiple processors in order', async () => {
            const context = createBaseContext();
            const order: string[] = [];

            const processors = [
                {
                    name: 'P1',
                    weight: 100,
                    execute: async () => {
                        order.push('P1');
                    },
                },
                {
                    name: 'P2',
                    weight: 50,
                    execute: async () => {
                        order.push('P2');
                    },
                },
                {
                    name: 'P3',
                    weight: 150,
                    execute: async () => {
                        order.push('P3');
                    },
                },
            ];

            await pipeline.execute(context, processors);

            // 应该按权重排序：P2(50) -> P1(100) -> P3(150)
            expect(order).toEqual(['P2', 'P1', 'P3']);
        });

        it('should sort by weight + offset', async () => {
            const context = createBaseContext();
            const order: string[] = [];

            const processors = [
                {
                    name: 'P1',
                    weight: 100,
                    offset: 10,
                    execute: async () => {
                        order.push('P1');
                    },
                },
                {
                    name: 'P2',
                    weight: 100,
                    offset: 5,
                    execute: async () => {
                        order.push('P2');
                    },
                },
                {
                    name: 'P3',
                    weight: 90,
                    offset: 20,
                    execute: async () => {
                        order.push('P3');
                    },
                },
            ];

            await pipeline.execute(context, processors);

            // P2(100+5=105) -> P3(90+20=110) -> P1(100+10=110)
            // 实际排序：P2(105) -> P1(110) -> P3(110)
            expect(order).toEqual(['P2', 'P1', 'P3']);
        });
    });

    describe('termination', () => {
        it('should skip processors when terminated', async () => {
            const context = createBaseContext();
            const order: string[] = [];

            const processors = [
                {
                    name: 'P1',
                    execute: async (ctx: BaseContext) => {
                        order.push('P1');
                        ctx.metadata.terminate = true;
                    },
                },
                {
                    name: 'P2',
                    execute: async () => {
                        order.push('P2');
                    },
                },
            ];

            const result = await pipeline.execute(context, processors, {
                breakOnError: false,
            });

            expect(order).toEqual(['P1']);
            expect(result.steps).toHaveLength(2);
            expect(result.steps[0].action).toBe('terminated');
            expect(result.steps[1].action).toBe('skipped');
        });

        it('should check termination before each processor', async () => {
            const context = createBaseContext();
            context.metadata.terminate = true;

            const processors = [
                {
                    name: 'P1',
                    execute: async () => {
                        throw new Error('Should not execute');
                    },
                },
            ];

            const result = await pipeline.execute(context, processors);

            expect(result.isSuccess).toBe(true);
            expect(result.steps[0].action).toBe('skipped');
        });
    });

    describe('error handling', () => {
        it('should catch processor error', async () => {
            const context = createBaseContext();
            const error = new Error('Processor failed');

            const processors = [
                {
                    name: 'ErrorProcessor',
                    execute: async () => {
                        throw error;
                    },
                },
            ];

            const result = await pipeline.execute(context, processors);

            expect(result.isSuccess).toBe(false);
            expect(result.error).toBe(error);
            expect(result.steps[0].action).toBe('terminated');
            expect(result.steps[0].error).toBe(error);
        });

        it('should break on error by default', async () => {
            const context = createBaseContext();
            const order: string[] = [];

            const processors = [
                {
                    name: 'P1',
                    execute: async () => {
                        order.push('P1');
                        throw new Error('Failed');
                    },
                },
                {
                    name: 'P2',
                    execute: async () => {
                        order.push('P2');
                    },
                },
            ];

            await pipeline.execute(context, processors);

            expect(order).toEqual(['P1']);
        });

        it('should continue on error when breakOnError is false', async () => {
            const context = createBaseContext();
            const order: string[] = [];

            const processors = [
                {
                    name: 'P1',
                    execute: async () => {
                        order.push('P1');
                        throw new Error('Failed');
                    },
                },
                {
                    name: 'P2',
                    execute: async () => {
                        order.push('P2');
                    },
                },
            ];

            await pipeline.execute(context, processors, {
                breakOnError: false,
            });

            expect(order).toEqual(['P1', 'P2']);
        });

        it('should set error in context', async () => {
            const context = createBaseContext();
            const error = new Error('Test error');

            const processors = [
                {
                    name: 'ErrorProcessor',
                    execute: async (ctx: BaseContext) => {
                        ctx.error = error;
                        ctx.metadata.hasError = true;
                        throw error;
                    },
                },
            ];

            const result = await pipeline.execute(context, processors);

            expect(result.context.error).toBe(error);
            expect(result.context.metadata.hasError).toBe(true);
        });
    });

    describe('tracking', () => {
        it('should track execution steps', async () => {
            const context = createBaseContext();

            const processors = [
                { name: 'P1', execute: async () => {} },
                { name: 'P2', execute: async () => {} },
                { name: 'P3', execute: async () => {} },
            ];

            const result = await pipeline.execute(context, processors, {
                enableTracking: true,
            });

            expect(result.steps).toHaveLength(3);
            expect(result.steps.map(s => s.processor)).toEqual(['P1', 'P2', 'P3']);
        });

        it('should disable tracking', async () => {
            const context = createBaseContext();

            const processors = [{ name: 'P1', execute: async () => {} }];

            const result = await pipeline.execute(context, processors, {
                enableTracking: false,
            });

            expect(result.steps).toHaveLength(0);
        });
    });

    describe('timing', () => {
        it('should record duration when timing enabled', async () => {
            const context = createBaseContext();

            const processors = [
                {
                    name: 'SlowProcessor',
                    execute: async () => {
                        await new Promise(resolve => setTimeout(resolve, 10));
                    },
                },
            ];

            const result = await pipeline.execute(context, processors, {
                enableTiming: true,
            });

            expect(result.steps[0].duration).toBeDefined();
            expect(result.steps[0].duration).toBeGreaterThan(0);
            expect(result.totalDuration).toBeGreaterThan(0);
        });

        it('should not record duration when timing disabled', async () => {
            const context = createBaseContext();

            const processors = [
                {
                    name: 'P1',
                    execute: async () => {},
                },
            ];

            const result = await pipeline.execute(context, processors, {
                enableTiming: false,
            });

            expect(result.steps[0].duration).toBeUndefined();
            expect(result.totalDuration).toBe(0);
        });
    });

    describe('stats', () => {
        it('should track execution stats', async () => {
            const context = createBaseContext();

            const processors = [
                {
                    name: 'P1',
                    execute: async () => {},
                },
            ];

            await pipeline.execute(context, processors);
            await pipeline.execute(context, processors);
            await pipeline.execute(context, processors);

            const stats = pipeline.getStats();

            expect(stats.totalExecutions).toBe(3);
            expect(stats.successCount).toBe(3);
            expect(stats.failureCount).toBe(0);
        });

        it('should track failure stats', async () => {
            const context = createBaseContext();

            const successProcessor = {
                name: 'Success',
                execute: async () => {},
            };

            const failProcessor = {
                name: 'Fail',
                execute: async () => {
                    throw new Error('Fail');
                },
            };

            await pipeline.execute(context, [successProcessor]);
            await pipeline.execute(context, [failProcessor]);

            const stats = pipeline.getStats();

            expect(stats.totalExecutions).toBe(2);
            expect(stats.successCount).toBe(1);
            expect(stats.failureCount).toBe(1);
        });

        it('should reset stats', async () => {
            const context = createBaseContext();

            const processors = [
                {
                    name: 'P1',
                    execute: async () => {},
                },
            ];

            await pipeline.execute(context, processors);

            pipeline.resetStats();

            const stats = pipeline.getStats();
            expect(stats.totalExecutions).toBe(0);
        });

        it('should track average duration', async () => {
            const context = createBaseContext();

            const processors = [
                {
                    name: 'P1',
                    execute: async () => {
                        await new Promise(resolve => setTimeout(resolve, 10));
                    },
                },
            ];

            await pipeline.execute(context, processors, { enableTiming: true });
            await pipeline.execute(context, processors, { enableTiming: true });

            const stats = pipeline.getStats();

            expect(stats.averageDuration).toBeGreaterThan(0);
            expect(stats.minDuration).toBeGreaterThan(0);
            expect(stats.maxDuration).toBeGreaterThan(0);
        });
    });

    describe('printReport', () => {
        it('should print report without error', () => {
            const result = {
                context: createBaseContext(),
                steps: [{ processor: 'P1', action: 'executed' as const, duration: 0.5 }],
                isSuccess: true,
                totalDuration: 0.5,
            };

            expect(() => {
                pipeline.printReport(result);
            }).not.toThrow();
        });

        it('should print report with error', () => {
            const result = {
                context: createBaseContext(),
                steps: [
                    {
                        processor: 'P1',
                        action: 'terminated' as const,
                        error: new Error('Test'),
                    },
                ],
                isSuccess: false,
                totalDuration: 0,
                error: new Error('Test'),
            };

            expect(() => {
                pipeline.printReport(result);
            }).not.toThrow();
        });
    });

    describe('options', () => {
        it('should use default options', async () => {
            const context = createBaseContext();

            const result = await pipeline.execute(context, []);

            expect(result.isSuccess).toBe(true);
        });

        it('should use custom pipeline name', async () => {
            const context = createBaseContext();

            const result = await pipeline.execute(context, [], {
                pipelineName: 'CustomPipeline',
            });

            expect(result.isSuccess).toBe(true);
        });
    });

    describe('integration', () => {
        it('should support full workflow', async () => {
            const context = createBaseContext();

            const processors = [
                {
                    name: 'Validate',
                    weight: 100,
                    execute: async (ctx: BaseContext) => {
                        ctx.metadata.validated = true;
                    },
                },
                {
                    name: 'Transform',
                    weight: 200,
                    execute: async (ctx: BaseContext) => {
                        ctx.metadata.transformed = true;
                    },
                },
                {
                    name: 'Save',
                    weight: 300,
                    execute: async (ctx: BaseContext) => {
                        ctx.metadata.saved = true;
                    },
                },
            ];

            const result = await pipeline.execute(context, processors, {
                enableTracking: true,
                enableTiming: true,
                pipelineName: 'DataPipeline',
            });

            expect(result.isSuccess).toBe(true);
            expect(result.steps).toHaveLength(3);
            expect(result.context.metadata.validated).toBe(true);
            expect(result.context.metadata.transformed).toBe(true);
            expect(result.context.metadata.saved).toBe(true);

            const stats = pipeline.getStats();
            expect(stats.totalExecutions).toBe(1);
            expect(stats.successCount).toBe(1);
        });
    });
});
