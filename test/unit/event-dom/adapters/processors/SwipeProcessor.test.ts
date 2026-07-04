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

import { SwipeProcessor } from '@/event-dom/adapters/processors/SwipeProcessor';
import { GestureEmit, InputSignal } from '@/event-dom/types';

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

    it('should reset state when cancel signal is received', () => {
        const mockEvent = new MouseEvent('touchcancel');
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
            time: 120,
            x: 100,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Press and then cancel
        processor.handle(pressInput);
        processor.handle(cancelInput);

        // Verify that state was reset after cancel
        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should call reset method when release signal is received', () => {
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

        // Spy on the reset method
        const resetSpy = jest.spyOn(processor as any, 'reset');

        // Execute the gesture sequence
        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(releaseInput);

        // Verify that reset was called
        expect(resetSpy).toHaveBeenCalled();
    });

    it('should call reset method when cancel signal is received', () => {
        const mockEvent = new MouseEvent('touchcancel');
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
            time: 120,
            x: 100,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Spy on the reset method
        const resetSpy = jest.spyOn(processor as any, 'reset');

        // Execute the gesture sequence
        processor.handle(pressInput);
        processor.handle(cancelInput);

        // Verify that reset was called
        expect(resetSpy).toHaveBeenCalled();
    });

    it('should not process release event when not active', () => {
        const mockEvent = new MouseEvent('touchend');
        
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 120,
            x: 150,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // Directly send release without press (inactive state)
        processor.handle(releaseInput);

        // Should not call emit since not active
        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should not process move event when not active', () => {
        const mockEvent = new MouseEvent('touchmove');
        
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 120,
            x: 150,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        // Directly send move without press (inactive state)
        processor.handle(moveInput);

        // Should not call emit since not active
        expect(mockEmit).not.toHaveBeenCalled();
    });
});
