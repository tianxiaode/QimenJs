import { GlobalEventBus, globalEventBus } from '@/kernel/events/core/GlobalEventBus';
import { EventScope } from '@/kernel/events/core/EventScope';
import { Logger } from '@/logger';

// Mock Logger to avoid issues in test environment
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

describe('GlobalEventBus', () => {
    // 创建一个独立的bus实例用于测试，避免影响全局实例
    let testBus: GlobalEventBus;

    beforeEach(() => {
        testBus = new GlobalEventBus();
    });

    test('should be a class that can be instantiated', () => {
        expect(testBus).toBeInstanceOf(GlobalEventBus);
    });

    test('should have a unique bus ID', () => {
        expect(testBus.getBusId()).toBeDefined();
        expect(typeof testBus.getBusId()).toBe('string');
        expect(testBus.getBusId().length).toBeGreaterThan(0);
    });

    test('should allow subscribing to events', () => {
        const handler = jest.fn();
        const unsubscribe = testBus.on('test-event', handler);
        
        testBus.emit('test-event', { data: 'test' });
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { data: 'test' },
                source: 'GLOBAL',
                event: 'test-event'
            })
        );

        unsubscribe();
        testBus.emit('test-event', { data: 'test2' });
        expect(handler).toHaveBeenCalledTimes(1); // Should still be 1 after unsubscribe
    });

    test('should handle once subscription', () => {
        const handler = jest.fn();
        testBus.once('test-event', handler);

        testBus.emit('test-event', { data: 'first' });
        testBus.emit('test-event', { data: 'second' });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { data: 'first' },
                source: 'GLOBAL',
                event: 'test-event'
            })
        );
    });

    test('should emit events', () => {
        const handler = jest.fn();
        testBus.on('emit-test', handler);

        testBus.emit('emit-test', { data: 'test' });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { data: 'test' },
                source: 'GLOBAL',
                event: 'emit-test'
            })
        );
    });

    test('should clear specific event listeners', () => {
        const handler = jest.fn();
        testBus.on('clear-test', handler);
        
        testBus.emit('clear-test', { data: 'before-clear' });
        expect(handler).toHaveBeenCalledTimes(1);

        testBus.clear('clear-test');
        testBus.emit('clear-test', { data: 'after-clear' });
        expect(handler).toHaveBeenCalledTimes(1); // Should still be 1 after clear
    });

    test('should clear all event listeners', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        
        testBus.on('clear-all-1', handler1);
        testBus.on('clear-all-2', handler2);

        testBus.emit('clear-all-1', { data: 'before' });
        testBus.emit('clear-all-2', { data: 'before' });
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);

        testBus.clear();
        
        testBus.emit('clear-all-1', { data: 'after' });
        testBus.emit('clear-all-2', { data: 'after' });
        expect(handler1).toHaveBeenCalledTimes(1); // Should still be 1
        expect(handler2).toHaveBeenCalledTimes(1); // Should still be 1
    });

    test('should create event scopes', () => {
        const scope = testBus.createEventScope();
        expect(scope).toBeInstanceOf(EventScope);
        expect(scope.getScopeId()).toBeDefined();
    });

    test('should work with multiple event types', () => {
        const userLoginHandler = jest.fn();
        const userLogoutHandler = jest.fn();

        testBus.on('user:login', userLoginHandler);
        testBus.on('user:logout', userLogoutHandler);

        testBus.emit('user:login', { userId: '123' });
        testBus.emit('user:logout');

        expect(userLoginHandler).toHaveBeenCalledTimes(1);
        expect(userLoginHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { userId: '123' },
                source: 'GLOBAL',
                event: 'user:login'
            })
        );
        expect(userLogoutHandler).toHaveBeenCalledTimes(1);
        expect(userLogoutHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                data: undefined,
                source: 'GLOBAL',
                event: 'user:logout'
            })
        );
    });
    
    test('globalEventBus singleton should be available', () => {
        expect(globalEventBus).toBeDefined();
        expect(globalEventBus).toBeInstanceOf(GlobalEventBus);
    });

    test('should maintain separate event subscriptions between instances', () => {
        const anotherBus = new GlobalEventBus();
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        
        testBus.on('separate-test', handler1);
        anotherBus.on('separate-test', handler2);
        
        testBus.emit('separate-test', { data: 'test' });
        
        // Each bus should trigger only its own handlers
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).not.toHaveBeenCalled();
    });

    test('should create event scopes with associated bus', () => {
        const scope = testBus.createEventScope();
        
        // Emit an event through the scope and verify it works
        const handler = jest.fn();
        testBus.on('scope-test', handler);
        scope.emit('scope-test', { data: 'from-scope' }, 'TestSource');
        
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { data: 'from-scope' },
                source: 'TestSource',
                event: 'scope-test',
                busId: testBus.getBusId()
            })
        );
    });

    test('should emit events with GLOBAL source identifier', () => {
        const handler = jest.fn();
        testBus.on('global-source-test', handler);
        
        testBus.emit('global-source-test', { data: 'test' });
        
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { data: 'test' },
                source: 'GLOBAL',
                event: 'global-source-test'
            })
        );
    });
});