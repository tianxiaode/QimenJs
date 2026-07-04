import { EventBus } from '@/events/EventBus';
import { EventScope } from '@/events/EventScope';
import { ILogger } from '@orbit-js/logger';

/**
 * EventScope 单元测试
 * 
 * 测试覆盖范围：
 * 1. 实例创建和唯一ID生成
 * 2. 事件订阅和自动清理
 * 3. 一次性订阅
 * 4. 事件触发
 * 5. 作用域销毁
 * 6. 自定义清理函数
 * 7. 日志记录
 * 8. 错误处理
 * 9. 边界情况处理
 * 10. 生命周期管理
 */
describe('EventScope', () => {
    let bus: EventBus;
    let scope: EventScope;
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
        scope = new EventScope(bus, mockLogger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- 基础功能测试 ---

    describe('实例创建', () => {
        test('应该创建带有唯一ID的实例', () => {
            expect(scope.getScopeId()).toBeDefined();
            expect(typeof scope.getScopeId()).toBe('string');
            expect(scope.getScopeId().length).toBeGreaterThan(0);
        });

        test('不同作用域应该有不同的ID', () => {
            const scope2 = new EventScope(bus, mockLogger);
            expect(scope.getScopeId()).not.toBe(scope2.getScopeId());
        });

        test('应该记录作用域创建日志', () => {
            const newScope = new EventScope(bus, mockLogger);
            
            expect(mockLogger.debug).toHaveBeenCalledWith(
                '[event.scope] created',
                expect.objectContaining({
                    busId: bus.getBusId(),
                    scopeId: newScope.getScopeId()
                })
            );
        });
    });

    // --- 事件订阅测试 ---

    describe('事件订阅', () => {
        test('应该能够通过作用域订阅事件', () => {
            const handler = jest.fn();
            const unsubscribe = scope.on('test-event', handler);
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

        test('应该在作用域销毁时自动取消事件订阅', () => {
            const handler = jest.fn();
            scope.on('test-event', handler);
            
            bus.emit('test-event', { data: 'before-dispose' });
            expect(handler).toHaveBeenCalledTimes(1);
            
            scope.dispose();
            bus.emit('test-event', { data: 'after-dispose' });
            expect(handler).toHaveBeenCalledTimes(1); // 销毁后应该仍然是1
        });

        test('应该能够处理多个事件订阅', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope.on('event-1', handler1);
            scope.on('event-2', handler2);

            bus.emit('event-1', { data: 'test1' });
            bus.emit('event-2', { data: 'test2' });

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            scope.dispose();

            bus.emit('event-1', { data: 'test3' });
            bus.emit('event-2', { data: 'test4' });

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    // --- 一次性订阅测试 ---

    describe('一次性订阅', () => {
        test('应该只触发一次', () => {
            const handler = jest.fn();
            scope.once('test-event', handler);

            scope.emit('test-event', { data: 'first' });
            scope.emit('test-event', { data: 'second' });

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'first' },
                    event: 'test-event'
                })
            );
        });

        test('一次性订阅应该在作用域销毁时被清理', () => {
            const handler = jest.fn();
            scope.once('once-event', handler);

            scope.dispose();
            scope.emit('once-event', {});

            expect(handler).not.toHaveBeenCalled();
        });
    });

    // --- 事件触发测试 ---

    describe('事件触发', () => {
        test('应该能够通过作用域触发事件', () => {
            const handler = jest.fn();
            bus.on('through-scope', handler);

            scope.emit('through-scope', { data: 'test' });

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    event: 'through-scope'
                })
            );
        });

        test('应该在事件上下文中包含scopeId和busId', () => {
            const handler = jest.fn();
            bus.on('context-test', handler);
            
            scope.emit('context-test', { data: 'test' });
            
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { data: 'test' },
                    scopeId: scope.getScopeId(),
                    busId: bus.getBusId(),
                    event: 'context-test'
                })
            );
        });

        test('应该能够指定事件源', () => {
            const handler = jest.fn();
            bus.on('source-test', handler);

            const customSource = { name: 'CustomSource' };
            scope.emit('source-test', { data: 'test' }, customSource);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: customSource
                })
            );
        });

        test('应该使用作用域作为默认事件源', () => {
            const handler = jest.fn();
            bus.on('default-source', handler);

            scope.emit('default-source', {});

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: scope
                })
            );
        });
    });

    // --- 作用域销毁测试 ---

    describe('作用域销毁', () => {
        test('应该正确销毁作用域', () => {
            const handler = jest.fn();
            scope.on('dispose-test', handler);

            scope.dispose();
            bus.emit('dispose-test', {});

            expect(handler).not.toHaveBeenCalled();
        });

        test('应该记录成功销毁日志', () => {
            scope.dispose();
            
            expect(mockLogger.info).toHaveBeenCalledWith(
                '[event.scope] disposed',
                expect.objectContaining({
                    busId: bus.getBusId(),
                    scopeId: scope.getScopeId()
                })
            );
        });

        test('重复销毁应该被忽略', () => {
            scope.dispose();
            scope.dispose(); // 再次销毁

            expect(mockLogger.debug).toHaveBeenCalledWith(
                '[event.scope] dispose_twice',
                expect.objectContaining({ 
                    busId: bus.getBusId(),
                    scopeId: scope.getScopeId()
                })
            );
        });

        test('销毁后不应该能够触发事件', () => {
            const handler = jest.fn();
            scope.on('post-dispose-event', handler);

            scope.dispose();
            scope.emit('post-dispose-event', { data: 'test' });

            expect(handler).toHaveBeenCalledTimes(0);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                '[event.scope] emit_after_dispose',
                expect.objectContaining({ event: 'post-dispose-event' })
            );
        });

        test('销毁后不应该能够订阅事件', () => {
            scope.dispose();
            const handler = jest.fn();
            const unsubscribe = scope.on('post-dispose-event', handler);

            scope.emit('post-dispose-event', { data: 'test' });

            expect(handler).toHaveBeenCalledTimes(0);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                '[event.scope] subscribe_after_dispose',
                expect.objectContaining({ event: 'post-dispose-event' })
            );
        });
    });

    // --- 自定义清理函数测试 ---

    describe('自定义清理函数', () => {
        test('应该能够添加自定义清理函数', () => {
            const cleanupFn = jest.fn();
            scope.addCleanup(cleanupFn);

            scope.dispose();

            expect(cleanupFn).toHaveBeenCalledTimes(1);
        });

        test('应该能够添加多个清理函数', () => {
            const cleanup1 = jest.fn();
            const cleanup2 = jest.fn();
            const cleanup3 = jest.fn();

            scope.addCleanup(cleanup1);
            scope.addCleanup(cleanup2);
            scope.addCleanup(cleanup3);

            scope.dispose();

            expect(cleanup1).toHaveBeenCalledTimes(1);
            expect(cleanup2).toHaveBeenCalledTimes(1);
            expect(cleanup3).toHaveBeenCalledTimes(1);
        });

        test('销毁后不应该能够添加清理函数', () => {
            const cleanupFn = jest.fn();
            scope.dispose();
            scope.addCleanup(cleanupFn);

            // 清理函数不应该被存储或执行
            expect(cleanupFn).toHaveBeenCalledTimes(0);
        });

        test('应该处理清理函数中的错误', () => {
            const error = new Error('Cleanup error');
            const failingCleanup = () => {
                throw error;
            };
            
            scope.addCleanup(failingCleanup);
            scope.dispose();

            expect(mockLogger.error).toHaveBeenCalledWith(
                '[event.scope] cleanup_error',
                expect.objectContaining({ error })
            );
        });

        test('一个清理函数出错不应该影响其他清理函数', () => {
            const cleanup1 = jest.fn();
            const cleanup2 = jest.fn(() => { throw new Error('Error'); });
            const cleanup3 = jest.fn();

            scope.addCleanup(cleanup1);
            scope.addCleanup(cleanup2);
            scope.addCleanup(cleanup3);

            expect(() => scope.dispose()).not.toThrow();

            expect(cleanup1).toHaveBeenCalled();
            expect(cleanup2).toHaveBeenCalled();
            expect(cleanup3).toHaveBeenCalled();
        });
    });

    // --- 日志记录测试 ---

    describe('日志记录', () => {
        test('应该记录作用域创建', () => {
            const newScope = new EventScope(bus, mockLogger);
            
            expect(mockLogger.debug).toHaveBeenCalledWith(
                '[event.scope] created',
                expect.objectContaining({
                    busId: bus.getBusId(),
                    scopeId: newScope.getScopeId()
                })
            );
        });

        test('应该记录成功销毁', () => {
            scope.dispose();
            
            expect(mockLogger.info).toHaveBeenCalledWith(
                '[event.scope] disposed',
                expect.objectContaining({
                    busId: bus.getBusId(),
                    scopeId: scope.getScopeId()
                })
            );
        });

        test('当没有logger时不应该记录日志', () => {
            const scopeWithoutLogger = new EventScope(bus);
            scopeWithoutLogger.logScope('debug', 'created', {});

            // 不应该抛出错误
            expect(true).toBe(true);
        });
    });

    // --- 错误处理测试 ---

    describe('错误处理', () => {
        test('应该处理事件处理器中的错误', () => {
            const error = new Error('Handler error');
            const failingHandler = () => { throw error; };
            const workingHandler = jest.fn();

            scope.on('error-event', failingHandler);
            scope.on('error-event', workingHandler);

            expect(() => {
                scope.emit('error-event', {});
            }).not.toThrow();

            expect(workingHandler).toHaveBeenCalled();
        });
    });

    // --- 边界情况测试 ---

    describe('边界情况', () => {
        test('应该能够处理undefined数据', () => {
            const handler = jest.fn();
            scope.on('undefined-data', handler);

            scope.emit('undefined-data', undefined);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: undefined
                })
            );
        });

        test('应该能够处理null数据', () => {
            const handler = jest.fn();
            scope.on('null-data', handler);

            scope.emit('null-data', null);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: null
                })
            );
        });

        test('应该能够处理大量订阅', () => {
            const handlers = Array.from({ length: 100 }, () => jest.fn());
            
            handlers.forEach(handler => {
                scope.on('many-subscriptions', handler);
            });

            scope.emit('many-subscriptions', {});

            handlers.forEach(handler => {
                expect(handler).toHaveBeenCalledTimes(1);
            });

            scope.dispose();
            scope.emit('many-subscriptions', {});

            handlers.forEach(handler => {
                expect(handler).toHaveBeenCalledTimes(1); // 销毁后不应该再触发
            });
        });

        test('应该能够处理大量清理函数', () => {
            const cleanups = Array.from({ length: 100 }, () => jest.fn());
            
            cleanups.forEach(cleanup => {
                scope.addCleanup(cleanup);
            });

            scope.dispose();

            cleanups.forEach(cleanup => {
                expect(cleanup).toHaveBeenCalledTimes(1);
            });
        });
    });

    // --- 生命周期管理测试 ---

    describe('生命周期管理', () => {
        test('应该正确管理多个作用域的生命周期', () => {
            const scope1 = bus.createScope();
            const scope2 = bus.createScope();

            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope1.on('event1', handler1);
            scope2.on('event2', handler2);

            bus.emit('event1', {});
            bus.emit('event2', {});

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            scope1.dispose();

            bus.emit('event1', {});
            bus.emit('event2', {});

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);

            scope2.dispose();

            bus.emit('event1', {});
            bus.emit('event2', {});

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);
        });

        test('作用域之间应该相互独立', () => {
            const scope1 = bus.createScope();
            const scope2 = bus.createScope();

            const handler1 = jest.fn();
            const handler2 = jest.fn();

            scope1.on('shared-event', handler1);
            scope2.on('shared-event', handler2);

            bus.emit('shared-event', {});

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);

            scope1.dispose();

            bus.emit('shared-event', {});

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);

            scope2.dispose();

            bus.emit('shared-event', {});

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(2);
        });
    });

    // --- 性能测试 ---

    describe('性能', () => {
        test('订阅和销毁应该高效', () => {
            const handler = jest.fn();
            const iterations = 1000;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                const testScope = bus.createScope();
                testScope.on('perf-test', handler);
                testScope.dispose();
            }
            const end = performance.now();

            // 确保性能合理（小于500ms）
            expect(end - start).toBeLessThan(500);
        });

        test('触发事件应该高效', () => {
            const handler = jest.fn();
            scope.on('perf-emit', handler);

            const iterations = 1000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                scope.emit('perf-emit', { index: i });
            }
            const end = performance.now();

            expect(handler).toHaveBeenCalledTimes(iterations);
            // 确保性能合理（小于100ms）
            expect(end - start).toBeLessThan(100);
        });
    });
});
