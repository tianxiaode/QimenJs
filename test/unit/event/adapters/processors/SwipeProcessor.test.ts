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
            for: jest.fn(() => mockLogger)
        }
    };
});

// Mock the validation module to prevent errors during testing
jest.mock('@orbitjs/validation', () => {
    return {
        ...jest.requireActual('@orbitjs/validation'),
        assert: {
            finite: jest.fn((value) => {
                // Simply return the value without validation for testing purposes
                return value;
            })
        }
    };
});

import { SwipeProcessor } from '@/event/adapters/processors';
import { GestureEmit } from '@/event/adapters/processors/types';
import { InputSignal } from '@/event/adapters/semantic-map';

describe('SwipeProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: SwipeProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new SwipeProcessor(
            'swipe',
            mockEmit
        );
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect swipe when movement is fast and far enough', () => {
        const mockEvent = new MouseEvent('touchmove');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 125, // halfway through
            x: 150,    // halfway to destination
            y: 100,
            originalEvent: mockEvent
        };
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 150, // 50ms between press and release
            x: 200,    // 100px distance (enough, since default minDistance is 30px)
            y: 100,
            originalEvent: mockEvent
        };

        processor.handle(pressInput);
        processor.handle(moveInput);  // Add move event to update lastX and lastY
        processor.handle(releaseInput);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'swipe',
            originalEvent: mockEvent
        });
    });

    it('should not detect swipe when movement is too slow', () => {
        const mockEvent = new MouseEvent('touchmove');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 300,
            x: 150,
            y: 100,
            originalEvent: mockEvent
        };
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 500, // 400ms between press and release - too slow for the velocity requirement
            x: 150,    // 50px distance
            y: 100,
            originalEvent: mockEvent
        };

        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(releaseInput);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should not detect swipe when movement is too short', () => {
        const mockEvent = new MouseEvent('touchmove');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 125,
            x: 105,
            y: 100,
            originalEvent: mockEvent
        };
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 150, // 50ms between press and release
            x: 110,    // Only 10px distance - less than 30px minimum
            y: 100,
            originalEvent: mockEvent
        };

        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(releaseInput);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should reset on cancel signal', () => {
        const mockEvent = new MouseEvent('touchmove');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 125,
            x: 150,
            y: 100,
            originalEvent: mockEvent
        };
        const cancelInput = {
            signal: 'cancel' as InputSignal,
            time: 150,
            x: 200,
            y: 100,
            originalEvent: mockEvent
        };

        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(cancelInput);

        // After cancel, a subsequent release should not trigger swipe
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 200,
            x: 200,
            y: 100,
            originalEvent: mockEvent
        };
        processor.handle(releaseInput);

        expect(mockEmit).not.toHaveBeenCalled();
    });
});