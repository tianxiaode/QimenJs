import { GlobalEventBus, globalEventBus } from '@/events/GlobalEventBus';
import { EventScope } from '@/events/EventScope';
import { EventContextBuilder } from '@/context';
import { Logger } from '@qimenjs/logger';

/**
 * GlobalEventBus 单元测试
 *
 * 测试覆盖范围：
 * 1. 实例创建和单例模式
 * 2. 事件订阅和取消订阅
 * 3. 一次性订阅
 * 4. 事件触发
 * 5. 事件清理
 * 6. 事件作用域创建
 * 7. 全局事件源标识
 * 8. 多实例隔离
 * 9. scopeId 隔离
 * 10. 边界情况处理
 * 11. 性能测试
 */

// Mock Logger to avoid issues in test environment
jest.mock('@qimenjs/logger', () => {
    const actualLogger = jest.requireActual('@qimenjs/logger');
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
            })),
        },
    };
});

describe('GlobalEventBus', () => {
    // 创建一个独立的bus实例用于测试，避免影响全局实例
    let testBus: GlobalEventBus;

    beforeEach(() => {
        testBus = new GlobalEventBus();
    });

    // --- 基础功能测试 ---

    describe('实例创建', () => {
        test('应该能够实例化', () => {
            expect(testBus).toBeInstanceOf(GlobalEventBus);
        });

        test('应该有唯一的bus ID', () => {
            expect(testBus.getBusId()).toBeDefined();
            expect(typeof testBus.getBusId()).toBe('string');
            expect(testBus.getBusId().length).toBeGreaterThan(0);
        });

        test('不同实例应该有不同的ID', () => {
            const anotherBus = new GlobalEventBus();
            expect(testBus.getBusId()).not.toBe(anotherBus.getBusId());
        });
    });

    // --- 单例模式测试 ---

    describe('单例模式', () => {
        test('globalEventBus单例应该可用', () => {
            expect(globalEventBus).toBeDefined();
            expect(globalEventBus).toBeInstanceOf(GlobalEventBus);
        });

        test('globalEventBus应该保持状态', () => {
            const handler = jest.fn();
            globalEventBus.on('singleton-test', handler);
            globalEventBus.emit(
                'singleton-test',
                EventContextBuilder.create()
                    .withEvent('singleton-test')
                    .withData({ data: 'test' })
                    .withSource('GLOBAL')
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    // --- 事件订阅测试 ---

    describe('事件订阅', () => {
        test('应该能够订阅事件', () => {
            const handler = jest.fn();
            const unsubscribe = testBus.on('test-event', handler);

            testBus.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'test' })
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    source: 'GLOBAL',
                    event: 'test-event',
                })
            );

            unsubscribe();
            testBus.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'test2' })
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1); // 取消订阅后应该仍然是1
        });

        test('应该能够处理同一事件的多个监听器', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            testBus.on('multi-listeners', handler1);
            testBus.on('multi-listeners', handler2);

            testBus.emit(
                'multi-listeners',
                EventContextBuilder.create()
                    .withEvent('multi-listeners')
                    .withData({})
                    .withSource('GLOBAL')
                    .build()
            );

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });

        test('应该能够独立取消订阅多个监听器', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            const unsub1 = testBus.on('independent-unsub', handler1);
            const unsub2 = testBus.on('independent-unsub', handler2);

            testBus.emit(
                'independent-unsub',
                EventContextBuilder.create()
                    .withEvent('independent-unsub')
                    .withData({})
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            unsub1();
            testBus.emit(
                'independent-unsub',
                EventContextBuilder.create()
                    .withEvent('independent-unsub')
                    .withData({})
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);

            unsub2();
            testBus.emit(
                'independent-unsub',
                EventContextBuilder.create()
                    .withEvent('independent-unsub')
                    .withData({})
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);
        });
    });

    // --- 一次性订阅测试 ---

    describe('一次性订阅', () => {
        test('应该只触发一次', () => {
            const handler = jest.fn();
            testBus.once('test-event', handler);

            testBus.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'first' })
                    .withSource('GLOBAL')
                    .build()
            );
            testBus.emit(
                'test-event',
                EventContextBuilder.create()
                    .withEvent('test-event')
                    .withData({ data: 'second' })
                    .withSource('GLOBAL')
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'first' },
                    source: 'GLOBAL',
                    event: 'test-event',
                })
            );
        });

        test('多个once订阅应该各自只触发一次', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            testBus.once('multi-once', handler1);
            testBus.once('multi-once', handler2);

            testBus.emit(
                'multi-once',
                EventContextBuilder.create()
                    .withEvent('multi-once')
                    .withData({})
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            testBus.emit(
                'multi-once',
                EventContextBuilder.create()
                    .withEvent('multi-once')
                    .withData({})
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    // --- 事件触发测试 ---

    describe('事件触发', () => {
        test('应该能够触发事件', () => {
            const handler = jest.fn();
            testBus.on('emit-test', handler);

            testBus.emit(
                'emit-test',
                EventContextBuilder.create()
                    .withEvent('emit-test')
                    .withData({ data: 'test' })
                    .withSource('GLOBAL')
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    source: 'GLOBAL',
                    event: 'emit-test',
                })
            );
        });

        test('应该使用GLOBAL作为事件源标识', () => {
            const handler = jest.fn();
            testBus.on('global-source-test', handler);

            testBus.emit(
                'global-source-test',
                EventContextBuilder.create()
                    .withEvent('global-source-test')
                    .withData({ data: 'test' })
                    .withSource('GLOBAL')
                    .build()
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    source: 'GLOBAL',
                    event: 'global-source-test',
                })
            );
        });

        test('应该能够处理多种事件类型', () => {
            const userLoginHandler = jest.fn();
            const userLogoutHandler = jest.fn();

            testBus.on('user:login', userLoginHandler);
            testBus.on('user:logout', userLogoutHandler);

            testBus.emit(
                'user:login',
                EventContextBuilder.create()
                    .withEvent('user:login')
                    .withData({ userId: '123' })
                    .withSource('GLOBAL')
                    .build()
            );
            testBus.emit(
                'user:logout',
                EventContextBuilder.create().withEvent('user:logout').withSource('GLOBAL').build()
            );

            expect(userLoginHandler).toHaveBeenCalledTimes(1);
            expect(userLoginHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { userId: '123' },
                    source: 'GLOBAL',
                    event: 'user:login',
                })
            );
            expect(userLogoutHandler).toHaveBeenCalledTimes(1);
            expect(userLogoutHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: undefined,
                    source: 'GLOBAL',
                    event: 'user:logout',
                })
            );
        });

        test('应该能够触发没有监听器的事件而不报错', () => {
            expect(() => {
                testBus.emit(
                    'nonexistent-event',
                    EventContextBuilder.create()
                        .withEvent('nonexistent-event')
                        .withData({})
                        .withSource('GLOBAL')
                        .build()
                );
            }).not.toThrow();
        });
    });

    // --- 事件清理测试 ---

    describe('事件清理', () => {
        test('应该能够清理特定事件的监听器', () => {
            const handler = jest.fn();
            testBus.on('clear-test', handler);

            testBus.emit(
                'clear-test',
                EventContextBuilder.create()
                    .withEvent('clear-test')
                    .withData({ data: 'before-clear' })
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1);

            testBus.clear('clear-test');
            testBus.emit(
                'clear-test',
                EventContextBuilder.create()
                    .withEvent('clear-test')
                    .withData({ data: 'after-clear' })
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1); // 清理后应该仍然是1
        });

        test('应该能够清理所有事件监听器', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            testBus.on('clear-all-1', handler1);
            testBus.on('clear-all-2', handler2);

            testBus.emit(
                'clear-all-1',
                EventContextBuilder.create()
                    .withEvent('clear-all-1')
                    .withData({ data: 'before' })
                    .withSource('GLOBAL')
                    .build()
            );
            testBus.emit(
                'clear-all-2',
                EventContextBuilder.create()
                    .withEvent('clear-all-2')
                    .withData({ data: 'before' })
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            testBus.clear();

            testBus.emit(
                'clear-all-1',
                EventContextBuilder.create()
                    .withEvent('clear-all-1')
                    .withData({ data: 'after' })
                    .withSource('GLOBAL')
                    .build()
            );
            testBus.emit(
                'clear-all-2',
                EventContextBuilder.create()
                    .withEvent('clear-all-2')
                    .withData({ data: 'after' })
                    .withSource('GLOBAL')
                    .build()
            );
            expect(handler1).toHaveBeenCalledTimes(1); // 应该仍然是1
            expect(handler2).toHaveBeenCalledTimes(1); // 应该仍然是1
        });

        test('清理不存在的事件不应该报错', () => {
            expect(() => {
                testBus.clear('nonexistent-event');
            }).not.toThrow();
        });
    });

    // --- 事件作用域测试 ---

    describe('事件作用域', () => {
        test('应该能够创建事件作用域', () => {
            const scope = testBus.createEventScope();
            expect(scope).toBeInstanceOf(EventScope);
            expect(scope.getScopeId()).toBeDefined();
        });

        test('每次创建的作用域应该有不同的ID', () => {
            const scope1 = testBus.createEventScope();
            const scope2 = testBus.createEventScope();
            expect(scope1.getScopeId()).not.toBe(scope2.getScopeId());
        });

        test('作用域销毁应该清理相关订阅', () => {
            const scope = testBus.createEventScope();
            const handler = jest.fn();

            scope.on('scope-dispose-test', handler);
            scope.emit(
                'scope-dispose-test',
                EventContextBuilder.create().withEvent('scope-dispose-test').withData({}).build()
            );

            expect(handler).toHaveBeenCalledTimes(1);

            scope.dispose();
            scope.emit(
                'scope-dispose-test',
                EventContextBuilder.create().withEvent('scope-dispose-test').withData({}).build()
            );

            expect(handler).toHaveBeenCalledTimes(1); // 销毁后应该仍然是1
        });
    });

    // --- scopeId 隔离测试 ---

    describe('scopeId 隔离', () => {
        test('rootScope 和子 scope 的事件应该互相隔离', () => {
            const scope = testBus.createEventScope();
            const rootHandler = jest.fn();
            const scopeHandler = jest.fn();

            testBus.on('isolate-test', rootHandler);
            scope.on('isolate-test', scopeHandler);

            // rootScope emit 只触发 rootScope 的 handler
            testBus.emit(
                'isolate-test',
                EventContextBuilder.create()
                    .withEvent('isolate-test')
                    .withData({ from: 'root' })
                    .withSource('GLOBAL')
                    .build()
            );
            expect(rootHandler).toHaveBeenCalledTimes(1);
            expect(scopeHandler).not.toHaveBeenCalled();

            // scope emit 只触发 scope 的 handler
            scope.emit(
                'isolate-test',
                EventContextBuilder.create()
                    .withEvent('isolate-test')
                    .withData({ from: 'scope' })
                    .build()
            );
            expect(rootHandler).toHaveBeenCalledTimes(1); // 仍然是1
            expect(scopeHandler).toHaveBeenCalledTimes(1);
        });

        test('不同子 scope 之间应该互相隔离', () => {
            const scope1 = testBus.createEventScope();
            const scope2 = testBus.createEventScope();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope1.on('cross-scope', handler1);
            scope2.on('cross-scope', handler2);

            scope1.emit(
                'cross-scope',
                EventContextBuilder.create().withEvent('cross-scope').withData({}).build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).not.toHaveBeenCalled();

            scope2.emit(
                'cross-scope',
                EventContextBuilder.create().withEvent('cross-scope').withData({}).build()
            );
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    // --- 多实例隔离测试 ---

    describe('多实例隔离', () => {
        test('不同实例应该保持独立的事件订阅', () => {
            const anotherBus = new GlobalEventBus();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            testBus.on('separate-test', handler1);
            anotherBus.on('separate-test', handler2);

            testBus.emit(
                'separate-test',
                EventContextBuilder.create()
                    .withEvent('separate-test')
                    .withData({ data: 'test' })
                    .withSource('GLOBAL')
                    .build()
            );

            // 每个bus应该只触发自己的处理器
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).not.toHaveBeenCalled();
        });

        test('不同实例的清理操作应该相互独立', () => {
            const anotherBus = new GlobalEventBus();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            testBus.on('independent-clear', handler1);
            anotherBus.on('independent-clear', handler2);

            testBus.clear();

            testBus.emit(
                'independent-clear',
                EventContextBuilder.create()
                    .withEvent('independent-clear')
                    .withData({})
                    .withSource('GLOBAL')
                    .build()
            );
            anotherBus.emit(
                'independent-clear',
                EventContextBuilder.create()
                    .withEvent('independent-clear')
                    .withData({})
                    .withSource('GLOBAL')
                    .build()
            );

            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    // --- 边界情况测试 ---

    describe('边界情况', () => {
        test('应该能够处理undefined数据', () => {
            const handler = jest.fn();
            testBus.on('undefined-data', handler);

            testBus.emit(
                'undefined-data',
                EventContextBuilder.create()
                    .withEvent('undefined-data')
                    .withSource('GLOBAL')
                    .build()
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: undefined,
                })
            );
        });

        test('应该能够处理null数据', () => {
            const handler = jest.fn();
            testBus.on('null-data', handler);

            testBus.emit(
                'null-data',
                EventContextBuilder.create()
                    .withEvent('null-data')
                    .withData(null)
                    .withSource('GLOBAL')
                    .build()
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: null,
                })
            );
        });

        test('应该能够处理复杂数据结构', () => {
            const handler = jest.fn();
            testBus.on('complex-data', handler);

            const complexData = {
                nested: {
                    array: [1, 2, 3],
                    object: { a: 'b' },
                },
                func: () => 'test',
                date: new Date(),
            };

            testBus.emit(
                'complex-data',
                EventContextBuilder.create()
                    .withEvent('complex-data')
                    .withData(complexData)
                    .withSource('GLOBAL')
                    .build()
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: complexData,
                })
            );
        });

        test('应该能够处理大量监听器', () => {
            const handlers = Array.from({ length: 100 }, () => jest.fn());

            handlers.forEach(handler => {
                testBus.on('many-listeners', handler);
            });

            testBus.emit(
                'many-listeners',
                EventContextBuilder.create()
                    .withEvent('many-listeners')
                    .withData({})
                    .withSource('GLOBAL')
                    .build()
            );

            handlers.forEach(handler => {
                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        test('应该能够处理大量不同事件', () => {
            const handler = jest.fn();

            for (let i = 0; i < 100; i++) {
                testBus.on(`event-${i}`, handler);
            }

            for (let i = 0; i < 100; i++) {
                testBus.emit(
                    `event-${i}`,
                    EventContextBuilder.create()
                        .withEvent(`event-${i}`)
                        .withData({ index: i })
                        .withSource('GLOBAL')
                        .build()
                );
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
                const unsub = testBus.on('perf-test', handler);
                unsub();
            }
            const end = performance.now();

            // 确保性能合理（小于100ms）
            expect(end - start).toBeLessThan(100);
        });

        test('触发事件应该高效', () => {
            const handler = jest.fn();
            testBus.on('perf-emit', handler);

            const iterations = 1000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                testBus.emit(
                    'perf-emit',
                    EventContextBuilder.create()
                        .withEvent('perf-emit')
                        .withData({ index: i })
                        .withSource('GLOBAL')
                        .build()
                );
            }
            const end = performance.now();

            expect(handler).toHaveBeenCalledTimes(iterations);
            // 确保性能合理（小于100ms）
            expect(end - start).toBeLessThan(100);
        });

        test('作用域创建和销毁应该高效', () => {
            const iterations = 100;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                const scope = testBus.createEventScope();
                scope.dispose();
            }
            const end = performance.now();

            // 确保性能合理（小于100ms）
            expect(end - start).toBeLessThan(100);
        });
    });
});
