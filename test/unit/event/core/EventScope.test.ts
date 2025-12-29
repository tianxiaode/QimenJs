import { EventBus } from '@/event/core/EventBus';
import { EventScope } from '@/event/core/EventScope';
import { ILogger, Logger } from '@/logger';

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

    test('should create an instance with a unique ID', () => {
        expect(scope.getScopeId()).toBeDefined();
        expect(typeof scope.getScopeId()).toBe('string');
        expect(scope.getScopeId().length).toBeGreaterThan(0);
    });

    test('should subscribe to events via scope', () => {
        const handler = jest.fn();
        const unsubscribe = scope.on('test-event', handler);
        bus.emit('test-event', { data: 'test' });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ data: 'test' });

        unsubscribe();
        bus.emit('test-event', { data: 'test2' });
        expect(handler).toHaveBeenCalledTimes(1); // Should still be 1 after unsubscribe
    });

    test('should automatically dispose event subscriptions when scope is disposed', () => {
        const handler = jest.fn();
        scope.on('test-event', handler);
        
        bus.emit('test-event', { data: 'before-dispose' });
        expect(handler).toHaveBeenCalledTimes(1);
        
        scope.dispose();
        bus.emit('test-event', { data: 'after-dispose' });
        expect(handler).toHaveBeenCalledTimes(1); // Should still be 1 after dispose
    });

    test('should handle once subscription', () => {
        const handler = jest.fn();
        scope.once('test-event', handler);

        scope.emit('test-event', { data: 'first' });
        scope.emit('test-event', { data: 'second' });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ data: 'first' });
    });

    test('should emit events through scope', () => {
        const handler = jest.fn();
        bus.on('through-scope', handler);

        scope.emit('through-scope', { data: 'test' });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    test('should not emit events after disposal', () => {
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

    test('should not subscribe to events after disposal', () => {
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

    test('should dispose properly when already disposed', () => {
        scope.dispose();
        scope.dispose(); // Try to dispose again

        expect(mockLogger.debug).toHaveBeenCalledWith(
            '[event.scope] dispose_twice',
            expect.objectContaining({ 
                busId: bus.getBusId(),
                scopeId: scope.getScopeId()
            })
        );
    });

    test('should handle errors in cleanup functions', () => {
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

    test('should add custom cleanup functions', () => {
        const cleanupFn = jest.fn();
        scope.addCleanup(cleanupFn);

        scope.dispose();

        expect(cleanupFn).toHaveBeenCalledTimes(1);
    });

    test('should not add cleanup after disposal', () => {
        const cleanupFn = jest.fn();
        scope.dispose();
        scope.addCleanup(cleanupFn);

        // Cleanup function should not be stored or executed
        expect(cleanupFn).toHaveBeenCalledTimes(0);
    });
});