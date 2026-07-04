// Mock the logger to prevent errors during testing
jest.mock('@orbit-js/logger', () => {
    const mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        log: jest.fn(),
    };

    return {
        ...jest.requireActual('@orbit-js/logger'),
        Logger: {
            for: jest.fn(() => mockLogger),
        },
    };
});

// Mock the validation module to prevent errors during testing
jest.mock('@orbit-js/validation', () => {
    return {
        ...jest.requireActual('@orbit-js/validation'),
        assert: {
            finite: jest.fn(value => {
                // Simply return the value without validation for testing purposes
                return value;
            }),
        },
    };
});

import { TapProcessor } from '@/event-dom/adapters/processors/TapProcessor';
import { GestureEmit, InputSignal } from '@/event-dom/types';

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

    it('should update position when receiving move event', () => {
        const mockEvent = new MouseEvent('touchstart');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const moveInput = {
            signal: 'move' as InputSignal,
            time: 105,
            x: 103, // Move to new position
            y: 103,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 110,
            x: 105, // Final position
            y: 105,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Press, move, then release
        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(releaseInput);

        // Calculate the distance from start (100,100) to end (105,105)
        // Distance = sqrt((105-100)^2 + (105-100)^2) = sqrt(25+25) = sqrt(50) ≈ 7.07
        // This should be within the default threshold of 10px
        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'tap',
            originalEvent: mockEvent,
        });
    });

    it('should not respond to move when not active', () => {
        const mockEvent = new MouseEvent('touchstart');
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 105,
            x: 103,
            y: 103,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Try to move without pressing first (inactive state)
        processor.handle(moveInput);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should reset state when receiving cancel event', () => {
        const mockEvent = new MouseEvent('touchstart');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const cancelInput = {
            signal: 'cancel' as InputSignal,
            time: 105,
            x: 100,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 110,
            x: 100,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Press, cancel, then release
        processor.handle(pressInput); // Activates the processor
        processor.handle(cancelInput); // Cancels and resets
        
        // After cancel, release should not trigger tap
        processor.handle(releaseInput);
        
        expect(mockEmit).not.toHaveBeenCalled();
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
        // We can't directly access private properties, so we'll test by observing behavior

        // After press, processor should be waiting for release
        processor.handle(pressInput);
        
        // After successful release, should emit tap event
        processor.handle(releaseInput);
        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'tap',
            originalEvent: mockEvent,
        });
        
        // Verify that after processing the tap, the internal state was reset
        // by attempting another press and release and expecting a second tap
        processor.handle(pressInput);
        processor.handle(releaseInput);
        expect(mockEmit).toHaveBeenCalledTimes(2); // Should now have two taps
    });
});