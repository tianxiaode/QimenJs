/**
 * data-processor 包单元测试
 */

// Mock Logger to avoid initialization issues
jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                child: jest.fn().mockReturnValue({
                    debug: jest.fn(),
                    info: jest.fn(),
                    warn: jest.fn(),
                    error: jest.fn(),
                    child: jest.fn(),
                }),
            }))
        }
    };
});

import { DataProcessor, DataProcessorRegistrar, DataProcessorExecutor, dataProcessorExecutor } from '@/data-processor';
import type { DataProcessorHandler } from '@/data-processor';

describe('data-processor', () => {
    describe('DataProcessorRegistrar', () => {
        describe('register', () => {
            it('should register a processor', () => {
                const handler: DataProcessorHandler = {
                    name: 'test-processor',
                    handle: async (ctx) => {
                        ctx.metadata = ctx.metadata || {};
                        ctx.metadata.processed = true;
                    },
                    weight: 100
                };

                DataProcessor.register(handler);

                // 验证注册成功
                expect(DataProcessor.has('test-processor')).toBe(true);
            });

            it('should register processor with tags', () => {
                const handler: DataProcessorHandler = {
                    name: 'tagged-processor',
                    handle: async (ctx) => {},
                    weight: 100,
                    tags: ['abp', 'post']
                };

                DataProcessor.register(handler);

                expect(DataProcessor.has('tagged-processor')).toBe(true);
            });

            it('should register processor with shouldExecute', () => {
                const handler: DataProcessorHandler = {
                    name: 'conditional-processor',
                    handle: async (ctx) => {},
                    weight: 100,
                    shouldExecute: (ctx) => ctx.metadata?.shouldRun === true
                };

                DataProcessor.register(handler);

                expect(DataProcessor.has('conditional-processor')).toBe(true);
            });

            it('should register processor with offset', () => {
                const handler: DataProcessorHandler = {
                    name: 'offset-processor',
                    handle: async (ctx) => {},
                    weight: 100,
                    offset: 10
                };

                DataProcessor.register(handler);

                expect(DataProcessor.has('offset-processor')).toBe(true);
            });

            it('should throw error if handler has no name', () => {
                const handler: any = {
                    handle: async (ctx: any) => {}
                };

                expect(() => DataProcessor.register(handler)).toThrow('Handler must have a valid name');
            });

            it('should throw error if handler has no handle function', () => {
                const handler: any = {
                    name: 'invalid-handler'
                };

                expect(() => DataProcessor.register(handler)).toThrow('Handler must have a valid handle function');
            });
        });

        describe('registerAll', () => {
            it('should register multiple handlers', () => {
                const handlers: DataProcessorHandler[] = [
                    {
                        name: 'batch-handler-1',
                        handle: async (ctx) => {},
                        weight: 100
                    },
                    {
                        name: 'batch-handler-2',
                        handle: async (ctx) => {},
                        weight: 200
                    }
                ];

                DataProcessor.registerAll(handlers);

                expect(DataProcessor.has('batch-handler-1')).toBe(true);
                expect(DataProcessor.has('batch-handler-2')).toBe(true);
            });
        });

        describe('getPipeline', () => {
            it('should return empty array if no handlers match', () => {
                const registrar = new DataProcessorRegistrar();
                const pipeline = registrar.getPipeline('nonexistent-preset');
                expect(pipeline).toEqual([]);
            });

            it('should return handlers matching preset', () => {
                const handler: DataProcessorHandler = {
                    name: 'preset-handler',
                    handle: async (ctx) => {},
                    weight: 100,
                    tags: ['test-preset']
                };

                DataProcessor.register(handler);

                const pipeline = DataProcessor.getPipeline('test-preset');
                expect(pipeline.length).toBeGreaterThan(0);
                expect(pipeline.some(h => h.name === 'preset-handler')).toBe(true);
            });

            it('should return handlers matching phase', () => {
                const handler: DataProcessorHandler = {
                    name: 'phase-handler',
                    handle: async (ctx) => {},
                    weight: 100,
                    tags: ['test-preset-2', 'pre']
                };

                DataProcessor.register(handler);

                const pipeline = DataProcessor.getPipeline('test-preset-2', 'pre');
                expect(pipeline.some(h => h.name === 'phase-handler')).toBe(true);
            });

            it('should return handlers with any tag', () => {
                const handler: DataProcessorHandler = {
                    name: 'any-handler',
                    handle: async (ctx) => {},
                    weight: 100,
                    tags: ['any']
                };

                DataProcessor.register(handler);

                const pipeline = DataProcessor.getPipeline('any-preset');
                expect(pipeline.some(h => h.name === 'any-handler')).toBe(true);
            });

            it('should return sorted handlers by weight', () => {
                const registrar = new DataProcessorRegistrar();

                registrar.register({
                    name: 'weight-200',
                    handle: async (ctx) => {},
                    weight: 200,
                    tags: ['sort-test']
                });

                registrar.register({
                    name: 'weight-100',
                    handle: async (ctx) => {},
                    weight: 100,
                    tags: ['sort-test']
                });

                const pipeline = registrar.getPipeline('sort-test');
                expect(pipeline[0].name).toBe('weight-100');
                expect(pipeline[1].name).toBe('weight-200');
            });
        });

        describe('unregister', () => {
            it('should remove a handler', () => {
                const handler: DataProcessorHandler = {
                    name: 'removable-handler',
                    handle: async (ctx) => {},
                    weight: 100
                };

                DataProcessor.register(handler);
                expect(DataProcessor.has('removable-handler')).toBe(true);

                DataProcessor.unregister('removable-handler');
                expect(DataProcessor.has('removable-handler')).toBe(false);
            });
        });

        describe('get', () => {
            it('should return handler by name', () => {
                const handler: DataProcessorHandler = {
                    name: 'gettable-handler',
                    handle: async (ctx) => {},
                    weight: 100
                };

                DataProcessor.register(handler);

                const result = DataProcessor.get('gettable-handler');
                expect(result).toBeDefined();
                expect(result!.length).toBeGreaterThan(0);
            });

            it('should return undefined for non-existent handler', () => {
                const result = DataProcessor.get('non-existent');
                expect(result).toBeUndefined();
            });
        });

        describe('has', () => {
            it('should return true for existing handler', () => {
                const handler: DataProcessorHandler = {
                    name: 'existing-handler',
                    handle: async (ctx) => {},
                    weight: 100
                };

                DataProcessor.register(handler);
                expect(DataProcessor.has('existing-handler')).toBe(true);
            });

            it('should return false for non-existent handler', () => {
                expect(DataProcessor.has('non-existent-handler')).toBe(false);
            });
        });

        describe('clear', () => {
            it('should clear all handlers', () => {
                const registrar = new DataProcessorRegistrar();

                registrar.register({
                    name: 'clear-test-1',
                    handle: async (ctx) => {},
                    weight: 100
                });

                registrar.register({
                    name: 'clear-test-2',
                    handle: async (ctx) => {},
                    weight: 200
                });

                expect(registrar.has('clear-test-1')).toBe(true);
                expect(registrar.has('clear-test-2')).toBe(true);

                registrar.clear();

                expect(registrar.has('clear-test-1')).toBe(false);
                expect(registrar.has('clear-test-2')).toBe(false);
            });
        });
    });

    describe('DataProcessorExecutor', () => {
        describe('execute', () => {
            it('should execute a simple pipeline', async () => {
                const executor = new DataProcessorExecutor();

                const handler: DataProcessorHandler = {
                    name: 'simple-processor',
                    handle: async (ctx) => {
                        ctx.metadata = ctx.metadata || {};
                        ctx.metadata.executed = true;
                    },
                    weight: 100
                };

                const context = {
                    identity: { domain: 'test', clientId: 'test' },
                    metadata: {}
                } as any;

                await executor.execute(context, [handler]);

                expect(context.metadata.executed).toBe(true);
            });

            it('should execute processors in weight order', async () => {
                const executor = new DataProcessorExecutor();
                const executionOrder: string[] = [];

                const handlers: DataProcessorHandler[] = [
                    {
                        name: 'weight-200',
                        handle: async (ctx) => { executionOrder.push('weight-200'); },
                        weight: 200
                    },
                    {
                        name: 'weight-100',
                        handle: async (ctx) => { executionOrder.push('weight-100'); },
                        weight: 100
                    },
                    {
                        name: 'weight-150',
                        handle: async (ctx) => { executionOrder.push('weight-150'); },
                        weight: 150
                    }
                ];

                const context = {
                    identity: { domain: 'test', clientId: 'test' },
                    metadata: {}
                } as any;

                await executor.execute(context, handlers);

                expect(executionOrder).toEqual(['weight-100', 'weight-150', 'weight-200']);
            });

            it('should skip processor when shouldExecute returns false', async () => {
                const executor = new DataProcessorExecutor();

                const handler: DataProcessorHandler = {
                    name: 'skip-processor',
                    handle: async (ctx) => {
                        ctx.metadata = ctx.metadata || {};
                        ctx.metadata.shouldNotExecute = true;
                    },
                    weight: 100,
                    shouldExecute: (ctx) => false
                };

                const context = {
                    identity: { domain: 'test', clientId: 'test' },
                    metadata: {}
                } as any;

                await executor.execute(context, [handler]);

                expect(context.metadata.shouldNotExecute).toBeUndefined();
            });

            it('should execute processor when shouldExecute returns true', async () => {
                const executor = new DataProcessorExecutor();

                const handler: DataProcessorHandler = {
                    name: 'conditional-exec-processor',
                    handle: async (ctx) => {
                        ctx.metadata = ctx.metadata || {};
                        ctx.metadata.conditionalExecuted = true;
                    },
                    weight: 100,
                    shouldExecute: (ctx) => ctx.metadata?.shouldRun === true
                };

                const context = {
                    identity: { domain: 'test', clientId: 'test' },
                    metadata: { shouldRun: true }
                } as any;

                await executor.execute(context, [handler]);

                expect(context.metadata.conditionalExecuted).toBe(true);
            });

            it('should execute processors with same weight in offset order', async () => {
                const executor = new DataProcessorExecutor();
                const executionOrder: string[] = [];

                const handlers: DataProcessorHandler[] = [
                    {
                        name: 'offset-10',
                        handle: async (ctx) => { executionOrder.push('offset-10'); },
                        weight: 100,
                        offset: 10
                    },
                    {
                        name: 'offset-0',
                        handle: async (ctx) => { executionOrder.push('offset-0'); },
                        weight: 100,
                        offset: 0
                    },
                    {
                        name: 'offset-5',
                        handle: async (ctx) => { executionOrder.push('offset-5'); },
                        weight: 100,
                        offset: 5
                    }
                ];

                const context = {
                    identity: { domain: 'test', clientId: 'test' },
                    metadata: {}
                } as any;

                await executor.execute(context, handlers);

                expect(executionOrder).toEqual(['offset-0', 'offset-5', 'offset-10']);
            });
        });

        describe('error handling', () => {
            it('should return error result when processor throws', async () => {
                const executor = new DataProcessorExecutor();

                const handler: DataProcessorHandler = {
                    name: 'error-processor',
                    handle: async (ctx) => {
                        throw new Error('Processor error');
                    },
                    weight: 100
                };

                const context = {
                    identity: { domain: 'test', clientId: 'test' },
                    metadata: {}
                } as any;

                const result = await executor.execute(context, [handler]);

                expect(result.isSuccess).toBe(false);
                expect(result.error).toBeInstanceOf(Error);
                expect(result.error.message).toBe('Processor error');
            });
        });
    });

    describe('DataProcessor convenience object', () => {
        it('should be an instance of DataProcessorRegistrar', () => {
            expect(DataProcessor).toBeInstanceOf(DataProcessorRegistrar);
        });

        it('should have register method', () => {
            expect(typeof DataProcessor.register).toBe('function');
        });
    });

    describe('dataProcessorExecutor singleton', () => {
        it('should be an instance of DataProcessorExecutor', () => {
            expect(dataProcessorExecutor).toBeInstanceOf(DataProcessorExecutor);
        });
    });
});
