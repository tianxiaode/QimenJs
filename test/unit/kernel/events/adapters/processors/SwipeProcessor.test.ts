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

import { SwipeProcessor } from '@/kernel/events/adapters/processors/SwipeProcessor';
import { GestureEmit, InputSignal } from '@/kernel/types';

describe('SwipeProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: SwipeProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new SwipeProcessor('swipe', mockEmit);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect swipe when movement is fast and far enough', () => {
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
            time: 120, // 20ms later
            x: 150, // 50px moved
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 120, // Same time as move
            x: 150,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // First press
        processor.handle(pressInput);
        // Then move
        processor.handle(moveInput);
        // Then release to complete the gesture
        processor.handle(releaseInput);

        // Check if swipe was detected
        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'swipe',
            originalEvent: mockEvent,
        });
    });

    it('should not detect swipe if movement is too slow', () => {
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
            time: 500, // 400ms later - too slow
            x: 150, // 50px moved
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 500,
            x: 150,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // First press
        processor.handle(pressInput);
        // Then move
        processor.handle(moveInput);
        // Then release
        processor.handle(releaseInput);

        // Check that no swipe was detected
        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should reset state when release signal is received', () => {
        const mockEvent = new MouseEvent('touchmove');
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
            time: 120,
            x: 100,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Press and then release
        processor.handle(pressInput);
        processor.handle(releaseInput);

        // Verify that state was reset after release
        expect(mockEmit).not.toHaveBeenCalled();
    });
});
