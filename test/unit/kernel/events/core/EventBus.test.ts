import { EventBus } from '@/kernel/events/core/EventBus';
import { EventScope } from '@/kernel/events/core/EventScope';
import { ILogger, Logger } from '@/logger';

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

    test('should create an instance with a unique ID', () => {
        expect(bus.getBusId()).toBeDefined();
        expect(typeof bus.getBusId()).toBe('string');
        expect(bus.getBusId().length).toBeGreaterThan(0);
    });

    test('should subscribe to events and return unsubscribe function', () => {
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
        expect(handler).toHaveBeenCalledTimes(1); // Should still be 1 after unsubscribe
    });

    test('should handle multiple listeners for the same event', () => {
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

    test('should handle once subscription', () => {
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

    test('should emit events with no listeners without error', () => {
        bus.emit('nonexistent-event', { data: 'test' });
        // Should not throw an error
    });

    test('should clear specific event listeners', () => {
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

    test('should clear all event listeners when no event specified', () => {
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

    test('should create event scope', () => {
        const scope = bus.createScope();
        expect(scope).toBeInstanceOf(EventScope);
        expect(scope.getScopeId()).toBeDefined();
    });

    test('should log events when logger is provided', () => {
        const handler = jest.fn();
        bus.on('test-event', handler);
        bus.emit('test-event', { data: 'test' });

        expect(mockLogger.debug).toHaveBeenCalledWith(
            '[event] emit',
            expect.objectContaining({ event: 'test-event', handlerCount: 1, busId: bus.getBusId() })
        );
    });

    test('should handle errors in event handlers', () => {
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

    test('should not log when no logger is provided', () => {
        const busWithoutLogger = new EventBus();
        busWithoutLogger.logBus('debug', 'emit', { test: 'data' });
        busWithoutLogger.logEvent('debug', 'emit', 'test_event', { test: 'data' });
        
        // These should not cause any logger calls since no logger was provided
        expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    test('should track source in emitted event logs', () => {
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

    test('should log when emitting to non-existent listeners', () => {
        bus.emit('no-handlers-event', { data: 'test' });

        expect(mockLogger.debug).toHaveBeenCalledWith(
            '[event.bus] emit_no_listeners',
            expect.objectContaining({ event: 'no-handlers-event', busId: bus.getBusId() })
        );
    });
});