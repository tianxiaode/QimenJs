import { EventBus } from '@/events/EventBus';
import { EventScope } from '@/events/EventScope';
import { ILogger } from '@qimenjs/logger';

/**
 * EventBus 单元测试
 * 
 * 测试覆盖范围：
 * 1. 实例创建和唯一ID生成
 * 2. 事件订阅和取消订阅
 * 3. 多监听器处理
 * 4. 一次性订阅
 * 5. 事件触发
 * 6. 事件清理
 * 7. 事件作用域创建
 * 8. 日志记录
 * 9. 错误处理
 * 10. 边界情况处理
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

    // --- 事件订阅测试 ---

    describe('事件订阅', () => {
        test('应该能够订阅事件并返回取消订阅函数', () => {
            const handler = jest.fn();
            const unsubscribe = bus.on('test-event', handler);
            bus.emit('test-event', { data: 'test' });

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    event: 'test-event'
                })
            );

            unsubscribe();
            bus.emit('test-event', { data: 'test2' });
            expect(handler).toHaveBeenCalledTimes(1); // 取消订阅后应该仍然是1
        });

        test('应该能够处理同一事件的多个监听器', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            bus.on('test-event', handler1);
            bus.on('test-event', handler2);
            bus.emit('test-event', { data: 'test' });

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler1).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    event: 'test-event'
                })
            );
            expect(handler2).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    event: 'test-event'
                })
            );
        });

        test('应该能够独立取消订阅多个监听器', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            const unsub1 = bus.on('test-event', handler1);
            const unsub2 = bus.on('test-event', handler2);

            bus.emit('test-event', {});
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            unsub1();
            bus.emit('test-event', {});
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);

            unsub2();
            bus.emit('test-event', {});
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);
        });
    });

    // --- 一次性订阅测试 ---

    describe('一次性订阅', () => {
        test('应该只触发一次', () => {
            const handler = jest.fn();
            bus.once('test-event', handler);

            bus.emit('test-event', { data: 'first' });
            bus.emit('test-event', { data: 'second' });

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'first' },
                    event: 'test-event'
                })
            );
        });

        test('多次once订阅应该各自只触发一次', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            bus.once('test-event', handler1);
            bus.once('test-event', handler2);

            bus.emit('test-event', {});
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            bus.emit('test-event', {});
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    // --- 事件触发测试 ---

    describe('事件触发', () => {
        test('应该能够触发没有监听器的事件而不报错', () => {
            expect(() => {
                bus.emit('nonexistent-event', { data: 'test' });
            }).not.toThrow();
        });

        test('应该正确传递事件上下文信息', () => {
            const handler = jest.fn();
            bus.on('context-test', handler);

            const testData = { value: 42 };
            const testSource = { name: 'TestSource' };
            bus.emit('context-test', testData, testSource);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    event: 'context-test',
                    data: testData,
                    source: testSource,
                    busId: bus.getBusId(),
                    timestamp: expect.any(Number)
                })
            );
        });

        test('应该为没有source的事件设置默认source', () => {
            const handler = jest.fn();
            bus.on('default-source', handler);

            bus.emit('default-source', {});

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: 'UNKNOWN'
                })
            );
        });

        test('应该包含时间戳', () => {
            const handler = jest.fn();
            bus.on('timestamp-test', handler);

            const beforeEmit = Date.now();
            bus.emit('timestamp-test', {});
            const afterEmit = Date.now();

            const callArgs = handler.mock.calls[0][0];
            expect(callArgs.timestamp).toBeGreaterThanOrEqual(beforeEmit);
            expect(callArgs.timestamp).toBeLessThanOrEqual(afterEmit);
        });
    });

    // --- 事件清理测试 ---

    describe('事件清理', () => {
        test('应该能够清理特定事件的监听器', () => {
            const handler = jest.fn();
            bus.on('test-event', handler);
            bus.emit('test-event', { data: 'before-clear' });

            bus.clear('test-event');
            bus.emit('test-event', { data: 'after-clear' });

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'before-clear' },
                    event: 'test-event'
                })
            );
        });

        test('应该能够清理所有事件监听器', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            bus.on('test-event-1', handler1);
            bus.on('test-event-2', handler2);

            bus.emit('test-event-1', { data: 'before-clear' });
            bus.emit('test-event-2', { data: 'before-clear' });

            bus.clear();

            bus.emit('test-event-1', { data: 'after-clear' });
            bus.emit('test-event-2', { data: 'after-clear' });

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });

        test('清理不存在的事件不应该报错', () => {
            expect(() => {
                bus.clear('nonexistent-event');
            }).not.toThrow();
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
            const handler = jest.fn();
            bus.on('test-event', handler);
            bus.emit('test-event', { data: 'test' });

            expect(mockLogger.debug).toHaveBeenCalledWith(
                '[event] emit',
                expect.objectContaining({ event: 'test-event', handlerCount: 1, busId: bus.getBusId() })
            );
        });

        test('应该在触发没有监听器的事件时记录日志', () => {
            bus.emit('no-handlers-event', { data: 'test' });

            expect(mockLogger.debug).toHaveBeenCalledWith(
                '[event.bus] emit_no_listeners',
                expect.objectContaining({ event: 'no-handlers-event', busId: bus.getBusId() })
            );
        });

        test('应该记录事件源信息', () => {
            const handler = jest.fn();
            const mockSource = { constructor: { name: 'MockSource' } };
            
            bus.on('source-test', handler);
            bus.emit('source-test', { data: 'test' }, mockSource);

            expect(handler).toHaveBeenCalled();
            expect(mockLogger.debug).toHaveBeenCalledWith(
                '[event] emit',
                expect.objectContaining({ event: 'source-test', source: 'MockSource' })
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
            const error = new Error('Handler error');
            const failingHandler = () => {
                throw error;
            };
            const workingHandler = jest.fn();

            bus.on('error-event', failingHandler);
            bus.on('error-event', workingHandler);

            expect(() => {
                bus.emit('error-event', { data: 'test' });
            }).not.toThrow();

            expect(workingHandler).toHaveBeenCalledTimes(1);
            expect(workingHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    event: 'error-event'
                })
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                '[event] handler_error',
                expect.objectContaining({ event: 'error-event', busId: bus.getBusId(), error })
            );
        });

        test('一个处理器出错不应该影响其他处理器', () => {
            const handler1 = jest.fn(() => { throw new Error('Error 1'); });
            const handler2 = jest.fn();
            const handler3 = jest.fn(() => { throw new Error('Error 3'); });
            const handler4 = jest.fn();

            bus.on('multi-error', handler1);
            bus.on('multi-error', handler2);
            bus.on('multi-error', handler3);
            bus.on('multi-error', handler4);

            expect(() => {
                bus.emit('multi-error', {});
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
            const handler = jest.fn();
            bus.on('undefined-data', handler);

            bus.emit('undefined-data', undefined);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: undefined,
                    event: 'undefined-data'
                })
            );
        });

        test('应该能够处理null数据', () => {
            const handler = jest.fn();
            bus.on('null-data', handler);

            bus.emit('null-data', null);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: null,
                    event: 'null-data'
                })
            );
        });

        test('应该能够处理复杂数据结构', () => {
            const handler = jest.fn();
            bus.on('complex-data', handler);

            const complexData = {
                nested: {
                    array: [1, 2, 3],
                    object: { a: 'b' }
                },
                func: () => 'test',
                date: new Date()
            };

            bus.emit('complex-data', complexData);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: complexData,
                    event: 'complex-data'
                })
            );
        });

        test('应该能够处理大量监听器', () => {
            const handlers = Array.from({ length: 100 }, () => jest.fn());
            
            handlers.forEach(handler => {
                bus.on('many-listeners', handler);
            });

            bus.emit('many-listeners', {});

            handlers.forEach(handler => {
                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        test('应该能够处理大量不同事件', () => {
            const handler = jest.fn();
            
            for (let i = 0; i < 100; i++) {
                bus.on(`event-${i}`, handler);
            }

            for (let i = 0; i < 100; i++) {
                bus.emit(`event-${i}`, { index: i });
            }

            expect(handler).toHaveBeenCalledTimes(100);
        });
    });

    // --- 性能测试 ---

    describe('性能', () => {
        test('订阅和取消订阅应该高效', () => {
            const handler = jest.fn();
            const iterations = 1000;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                const unsub = bus.on('perf-test', handler);
                unsub();
            }
            const end = performance.now();

            // 确保性能合理（小于100ms）
            expect(end - start).toBeLessThan(100);
        });

        test('触发事件应该高效', () => {
            const handler = jest.fn();
            bus.on('perf-emit', handler);

            const iterations = 1000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                bus.emit('perf-emit', { index: i });
            }
            const end = performance.now();

            expect(handler).toHaveBeenCalledTimes(iterations);
            // 确保性能合理（小于100ms）
            expect(end - start).toBeLessThan(100);
        });
    });
});
