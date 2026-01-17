// Mock the logger to prevent errors during testing
jest.mock('@orbitjs/logger', () => {
    const mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        log: jest.fn(),
    };

    return {
        ...jest.requireActual('@orbitjs/logger'),
        Logger: {
            for: jest.fn(() => mockLogger),
        },
    };
});

// Mock the validation module to prevent errors during testing
jest.mock('@orbitjs/validation', () => {
    return {
        ...jest.requireActual('@orbitjs/validation'),
        assert: {
            finite: jest.fn(value => {
                // Simply return the value without validation for testing purposes
                return value;
            }),
        },
    };
});

import { TapProcessor } from '@/kernel/events/adapters/processors/TapProcessor';
import { GestureEmit, InputSignal } from '@/kernel/types';

describe('TapProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: TapProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new TapProcessor('tap', mockEmit);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect tap when press and release happen in quick succession', () => {
        const mockEvent = new MouseEvent('touchstart');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 110, // 10ms later
            x: 102, // Small movement
            y: 102,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Press and release quickly
        processor.handle(pressInput);
        processor.handle(releaseInput);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'tap',
            originalEvent: mockEvent,
        });
    });

    it('should not detect tap when press and release are too far apart in time', () => {
        const mockEvent = new MouseEvent('touchstart');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 500, // Too long - exceeded maxDuration
            x: 102, // Small movement
            y: 102,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Press and release after too long
        processor.handle(pressInput);
        processor.handle(releaseInput);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should detect tap when movement during press and release is within threshold', () => {
        const mockEvent = new MouseEvent('touchstart');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 110, // 10ms later - OK
            x: 105, // Within movement threshold
            y: 105, // Within movement threshold
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Press and release within movement threshold
        processor.handle(pressInput);
        processor.handle(releaseInput);

        // Expect tap to be detected when movement is within threshold
        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'tap',
            originalEvent: mockEvent,
        });
    });

    it('should reset state after successful tap detection', () => {
        const mockEvent = new MouseEvent('touchstart');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 110,
            x: 102,
            y: 102,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Initially not waiting for release
        expect((processor as any).waitingForRelease).toBe(false);

        // After press, should be waiting for release
        processor.handle(pressInput);
        expect((processor as any).waitingForRelease).toBe(true);

        // After successful release, should reset
        processor.handle(releaseInput);
        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'tap',
            originalEvent: mockEvent,
        });
        
        // State should be reset after successful tap
        expect((processor as any).waitingForRelease).toBe(false);
    });

    it('should reset state after timeout', () => {
        const mockEvent = new MouseEvent('touchstart');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        // Initially not waiting for release
        expect((processor as any).waitingForRelease).toBe(false);

        // After press, should be waiting for release
        processor.handle(pressInput);
        expect((processor as any).waitingForRelease).toBe(true);

        // Simulate timeout by manually resetting
        (processor as any).reset();
        expect((processor as any).waitingForRelease).toBe(false);
    });
});