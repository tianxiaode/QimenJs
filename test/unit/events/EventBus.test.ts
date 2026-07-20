import { EventBus } from '@/events/EventBus';
import { EventScope } from '@/events/EventScope';
import { EventContextBuilder } from '@/context';
import { ILogger } from '@qimenjs/logger';

/**
 * EventBus 单元测试
 *
 * 测试覆盖范围：
 * 1. 实例创建和唯一ID生成
 * 2. 事件订阅和取消订阅（通过 scope）
 * 3. 多监听器处理
 * 4. 一次性订阅
 * 5. 事件触发
 * 6. 事件清理
 * 7. 事件作用域创建
 * 8. scopeId 隔离
 * 9. 日志记录
 * 10. 错误处理
 * 11. 边界情况处理
 */
describe('EventBus', () => {
    let bus: EventBus;
    let mockLogger: jest.Mocked<ILogger>;

    beforeEach(() => {
        mockLogger = {
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
        } as jest.Mocked<ILogger>;
        bus = new EventBus(mockLogger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- 基础功能测试 ---

    describe('实例创建', () => {
        test('应该创建带有唯一ID的实例', () => {
            expect(bus.getBusId()).toBeDefined();
            expect(typeof bus.getBusId()).toBe('string');
            expect(bus.getBusId().length).toBeGreaterThan(0);
        });

        test('不同实例应该有不同的ID', () => {
            const bus2 = new EventBus();
            expect(bus.getBusId()).not.toBe(bus2.getBusId());
        });

        test('应该能够在没有logger的情况下创建实例', () => {
            const busWithoutLogger = new EventBus();
            expect(busWithoutLogger.getBusId()).toBeDefined();
        });
    });

    // --- 事件订阅测试（通过 scope）---

    describe('事件订阅', () => {
        test('应该能够通过scope订阅事件并返回取消订阅函数', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            const unsubscribe = scope.on('test-event', handler);
            scope.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'test' })
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    event: 'test-event',
                })
            );

            unsubscribe();
            scope.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'test2' })
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1); // 取消订阅后应该仍然是1
        });

        test('应该能够处理同一事件的多个监听器', () => {
            const scope = bus.createScope();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope.on('test-event', handler1);
            scope.on('test-event', handler2);
            scope.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'test' })
                    .build()
            );

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler1).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    event: 'test-event',
                })
            );
            expect(handler2).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    event: 'test-event',
                })
            );
        });

        test('应该能够独立取消订阅多个监听器', () => {
            const scope = bus.createScope();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            const unsub1 = scope.on('test-event', handler1);
            const unsub2 = scope.on('test-event', handler2);

            scope.emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').withData({}).build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            unsub1();
            scope.emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').withData({}).build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);

            unsub2();
            scope.emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').withData({}).build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);
        });
    });

    // --- 一次性订阅测试 ---

    describe('一次性订阅', () => {
        test('应该只触发一次', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.once('test-event', handler);

            scope.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'first' })
                    .build()
            );
            scope.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'second' })
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'first' },
                    event: 'test-event',
                })
            );
        });

        test('多次once订阅应该各自只触发一次', () => {
            const scope = bus.createScope();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope.once('test-event', handler1);
            scope.once('test-event', handler2);

            scope.emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').withData({}).build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            scope.emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').withData({}).build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    // --- 事件触发测试 ---

    describe('事件触发', () => {
        test('应该能够触发没有监听器的事件而不报错', () => {
            const scope = bus.createScope();
            expect(() => {
                scope.emit(
                    'nonexistent-event',
                    EventContextBuilder.create()
                        .withEvent('nonexistent-event')
                        .withData({ data: 'test' })
                        .build()
                );
            }).not.toThrow();
        });

        test('应该正确传递事件上下文信息', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('context-test', handler);

            const testData = { value: 42 };
            const testSource = { name: 'TestSource' };
            scope.emit(
                'context-test',
                EventContextBuilder.create()
                    .withEvent('context-test')
                    .withData(testData)
                    .withSource(testSource)
                    .build()
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    event: 'context-test',
                    data: testData,
                    source: testSource,
                    busId: bus.getBusId(),
                    timestamp: expect.any(Number),
                })
            );
        });

        test('应该为没有source的事件设置默认source', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('default-source', handler);

            scope.emit(
                'default-source',
                EventContextBuilder.create()
                    .withEvent('default-source')
                    .withData({})
                    .withSource(scope)
                    .build()
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: expect.any(EventScope),
                })
            );
        });

        test('应该包含时间戳', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('timestamp-test', handler);

            const beforeEmit = Date.now();
            scope.emit(
                'timestamp-test',
                EventContextBuilder.create().withEvent('timestamp-test').withData({}).build()
            );
            const afterEmit = Date.now();

            const callArgs = handler.mock.calls[0][0];
            expect(callArgs.timestamp).toBeGreaterThanOrEqual(beforeEmit);
            expect(callArgs.timestamp).toBeLessThanOrEqual(afterEmit);
        });
    });

    // --- scopeId 隔离测试 ---

    describe('scopeId 隔离', () => {
        test('不同scope的事件应该互相隔离', () => {
            const scope1 = bus.createScope();
            const scope2 = bus.createScope();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope1.on('test-event', handler1);
            scope2.on('test-event', handler2);

            scope1.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'from-scope1' })
                    .build()
            );

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler1).toHaveBeenCalledWith(
                expect.objectContaining({ data: { data: 'from-scope1' } })
            );
            expect(handler2).not.toHaveBeenCalled();
        });

        test('emit只触发自己scope下的handler', () => {
            const scope1 = bus.createScope();
            const scope2 = bus.createScope();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope1.on('click', handler1);
            scope2.on('click', handler2);

            scope2.emit(
                'click',
                EventContextBuilder.create().withEvent('click').withData({}).build()
            );

            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).toHaveBeenCalledTimes(1);
        });

        test('同一scope下多个handler都应该触发', () => {
            const scope = bus.createScope();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope.on('click', handler1);
            scope.on('click', handler2);

            scope.emit(
                'click',
                EventContextBuilder.create().withEvent('click').withData({}).build()
            );

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    // --- 事件清理测试 ---

    describe('事件清理', () => {
        test('应该能够清理特定scope下的事件监听器', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('test-event', handler);
            scope.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'before-clear' })
                    .build()
            );

            bus.clear(scope.getScopeId(), 'test-event');
            scope.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'after-clear' })
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'before-clear' },
                    event: 'test-event',
                })
            );
        });

        test('应该能够清理特定scope下所有事件监听器', () => {
            const scope = bus.createScope();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope.on('test-event-1', handler1);
            scope.on('test-event-2', handler2);

            scope.emit(
                'test-event-1',
                EventContextBuilder.create()
                    .withEvent('test-event-1')
                    .withData({ data: 'before-clear' })
                    .build()
            );
            scope.emit(
                'test-event-2',
                EventContextBuilder.create()
                    .withEvent('test-event-2')
                    .withData({ data: 'before-clear' })
                    .build()
            );

            bus.clear(scope.getScopeId());

            scope.emit(
                'test-event-1',
                EventContextBuilder.create()
                    .withEvent('test-event-1')
                    .withData({ data: 'after-clear' })
                    .build()
            );
            scope.emit(
                'test-event-2',
                EventContextBuilder.create()
                    .withEvent('test-event-2')
                    .withData({ data: 'after-clear' })
                    .build()
            );

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });

        test('清理不存在的scope不应该报错', () => {
            expect(() => {
                bus.clear('nonexistent-scope', 'nonexistent-event');
            }).not.toThrow();
        });

        test('scope dispose应该自动清理所有handler', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('test-event', handler);

            scope.emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').withData({}).build()
            );
            expect(handler).toHaveBeenCalledTimes(1);

            scope.dispose();
            scope.emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').withData({}).build()
            );
            expect(handler).toHaveBeenCalledTimes(1); // dispose后不再触发
        });
    });

    // --- 事件作用域测试 ---

    describe('事件作用域', () => {
        test('应该能够创建事件作用域', () => {
            const scope = bus.createScope();
            expect(scope).toBeInstanceOf(EventScope);
            expect(scope.getScopeId()).toBeDefined();
        });

        test('每次创建的作用域应该有不同的ID', () => {
            const scope1 = bus.createScope();
            const scope2 = bus.createScope();
            expect(scope1.getScopeId()).not.toBe(scope2.getScopeId());
        });
    });

    // --- 日志记录测试 ---

    describe('日志记录', () => {
        test('当提供logger时应该记录事件', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('test-event', handler);
            scope.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'test' })
                    .build()
            );

            expect(mockLogger.debug).toHaveBeenCalledWith(
                '[event] emit',
                expect.objectContaining({
                    event: 'test-event',
                    handlerCount: 1,
                    busId: bus.getBusId(),
                })
            );
        });

        test('应该在触发没有监听器的事件时记录日志', () => {
            const scope = bus.createScope();
            scope.emit(
                'no-handlers-event',
                EventContextBuilder.create()
                    .withEvent('no-handlers-event')
                    .withData({ data: 'test' })
                    .build()
            );

            // scope 没有注册任何 handler，scopedListeners 中没有该 scopeId 的条目
            expect(mockLogger.debug).toHaveBeenCalledWith(
                '[event.bus] emit_no_scope',
                expect.objectContaining({ event: 'no-handlers-event', busId: bus.getBusId() })
            );
        });

        test('当没有提供logger时不应该记录日志', () => {
            const busWithoutLogger = new EventBus();
            busWithoutLogger.logBus('debug', 'emit', { test: 'data' });
            busWithoutLogger.logEvent('debug', 'emit', 'test_event', { test: 'data' });

            // 这些不应该导致任何logger调用，因为没有提供logger
            expect(mockLogger.debug).not.toHaveBeenCalled();
        });
    });

    // --- 错误处理测试 ---

    describe('错误处理', () => {
        test('应该处理事件处理器中的错误', () => {
            const scope = bus.createScope();
            const error = new Error('Handler error');
            const failingHandler = () => {
                throw error;
            };
            const workingHandler = jest.fn();

            scope.on('error-event', failingHandler);
            scope.on('error-event', workingHandler);

            expect(() => {
                scope.emit(
                    'error-event',
                    EventContextBuilder.create()
                        .withEvent('error-event')
                        .withData({ data: 'test' })
                        .build()
                );
            }).not.toThrow();

            expect(workingHandler).toHaveBeenCalledTimes(1);
            expect(workingHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    event: 'error-event',
                })
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                '[event] handler_error',
                expect.objectContaining({ event: 'error-event', busId: bus.getBusId(), error })
            );
        });

        test('一个处理器出错不应该影响其他处理器', () => {
            const scope = bus.createScope();
            const handler1 = jest.fn(() => {
                throw new Error('Error 1');
            });
            const handler2 = jest.fn();
            const handler3 = jest.fn(() => {
                throw new Error('Error 3');
            });
            const handler4 = jest.fn();

            scope.on('multi-error', handler1);
            scope.on('multi-error', handler2);
            scope.on('multi-error', handler3);
            scope.on('multi-error', handler4);

            expect(() => {
                scope.emit(
                    'multi-error',
                    EventContextBuilder.create().withEvent('multi-error').withData({}).build()
                );
            }).not.toThrow();

            expect(handler1).toHaveBeenCalled();
            expect(handler2).toHaveBeenCalled();
            expect(handler3).toHaveBeenCalled();
            expect(handler4).toHaveBeenCalled();
        });
    });

    // --- 边界情况测试 ---

    describe('边界情况', () => {
        test('应该能够处理undefined数据', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('undefined-data', handler);

            scope.emit(
                'undefined-data',
                EventContextBuilder.create().withEvent('undefined-data').build()
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: undefined,
                    event: 'undefined-data',
                })
            );
        });

        test('应该能够处理null数据', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('null-data', handler);

            scope.emit(
                'null-data',
                EventContextBuilder.create().withEvent('null-data').withData(null).build()
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: null,
                    event: 'null-data',
                })
            );
        });

        test('应该能够处理复杂数据结构', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('complex-data', handler);

            const complexData = {
                nested: {
                    array: [1, 2, 3],
                    object: { a: 'b' },
                },
                func: () => 'test',
                date: new Date(),
            };

            scope.emit(
                'complex-data',
                EventContextBuilder.create().withEvent('complex-data').withData(complexData).build()
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: complexData,
                    event: 'complex-data',
                })
            );
        });

        test('应该能够处理大量监听器', () => {
            const scope = bus.createScope();
            const handlers = Array.from({ length: 100 }, () => jest.fn());

            handlers.forEach(handler => {
                scope.on('many-listeners', handler);
            });

            scope.emit(
                'many-listeners',
                EventContextBuilder.create().withEvent('many-listeners').withData({}).build()
            );

            handlers.forEach(handler => {
                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        test('应该能够处理大量不同事件', () => {
            const scope = bus.createScope();
            const handler = jest.fn();

            for (let i = 0; i < 100; i++) {
                scope.on(`event-${i}`, handler);
            }

            for (let i = 0; i < 100; i++) {
                scope.emit(
                    `event-${i}`,
                    EventContextBuilder.create()
                        .withEvent(`event-${i}`)
                        .withData({ index: i })
                        .build()
                );
            }

            expect(handler).toHaveBeenCalledTimes(100);
        });
    });

    // --- 性能测试 ---

    describe('性能', () => {
        test('订阅和取消订阅应该高效', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            const iterations = 1000;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                const unsub = scope.on('perf-test', handler);
                unsub();
            }
            const end = performance.now();

            // 确保性能合理（小于100ms）
            expect(end - start).toBeLessThan(100);
        });

        test('触发事件应该高效', () => {
            const scope = bus.createScope();
            const handler = jest.fn();
            scope.on('perf-emit', handler);

            const iterations = 1000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                scope.emit(
                    'perf-emit',
                    EventContextBuilder.create()
                        .withEvent('perf-emit')
                        .withData({ index: i })
                        .build()
                );
            }
            const end = performance.now();

            expect(handler).toHaveBeenCalledTimes(iterations);
            // 确保性能合理（小于100ms）
            expect(end - start).toBeLessThan(100);
        });
    });
});
