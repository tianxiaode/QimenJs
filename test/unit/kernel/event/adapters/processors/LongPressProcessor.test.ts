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

import { LongPressProcessor } from '@/kernel/events/adapters/processors';
import { GestureEmit } from '@/kernel/events/adapters/processors/types';
import { InputSignal } from '@/kernel/events/adapters/semantic-map';

describe('LongPressProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: LongPressProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new LongPressProcessor(
            'longpress',
            mockEmit
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect long press when held for minimum duration', () => {
        jest.useFakeTimers();
        const mockEvent = new MouseEvent('mousedown');
        const input = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };

        processor.handle(input);
        // Fast-forward time to exceed default 500ms
        jest.advanceTimersByTime(500);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'longpress',
            originalEvent: mockEvent
        });
    });

    it('should not detect long press if cancelled before timeout', () => {
        jest.useFakeTimers();
        const mockEvent = new MouseEvent('mousedown');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };
        const cancelInput = {
            signal: 'cancel' as InputSignal,
            time: 200,
            x: 100,
            y: 100,
            originalEvent: new MouseEvent('mouseup')
        };

        processor.handle(pressInput);
        processor.handle(cancelInput);

        // Fast-forward time
        jest.advanceTimersByTime(500);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should cancel long press if movement exceeds max distance', () => {
        jest.useFakeTimers();
        const mockEvent = new MouseEvent('mousedown');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 150,
            x: 200, // Exceeds default 10px max distance
            y: 200,
            originalEvent: new MouseEvent('mousemove')
        };

        processor.handle(pressInput);
        processor.handle(moveInput);

        // Fast-forward time
        jest.advanceTimersByTime(500);

        expect(mockEmit).not.toHaveBeenCalled();
    });
});