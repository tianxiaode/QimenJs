// Mock the logger to prevent errors during testing
jest.mock('@qimenjs/logger', () => {
    const mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        log: jest.fn(),
    };

    return {
        ...jest.requireActual('@qimenjs/logger'),
        Logger: {
            for: jest.fn(() => mockLogger),
        },
    };
});

// Mock the validation module to prevent errors during testing
jest.mock('@qimenjs/validation', () => {
    return {
        ...jest.requireActual('@qimenjs/validation'),
        assert: {
            finite: jest.fn(value => {
                // Simply return the value without validation for testing purposes
                return value;
            }),
        },
    };
});

import { LongPressProcessor } from '@/event-dom/adapters/processors/LongPressProcessor';
import { GestureEmit, InputSignal } from '@/event-dom/types';

describe('LongPressProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: LongPressProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new LongPressProcessor('longpress', mockEmit);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect long press when press duration exceeds threshold', () => {
        const mockEvent = new MouseEvent('touchstart');
        const input = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        // Enable fake timers
        jest.useFakeTimers();

        // Simulate a press that exceeds the long press duration
        processor.handle(input);

        // Check that the processor is tracking the press
        expect(mockEmit).not.toHaveBeenCalled(); // At this point, no event should be emitted yet
        
        // Fast-forward time to exceed default threshold
        jest.advanceTimersByTime(501); // Default threshold is 500ms
        
        // Check that the long press was emitted
        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'longpress',
            originalEvent: mockEvent,
        });
        
        // Restore real timers
        jest.useRealTimers();
    });

    it('should not emit long press if released before threshold', () => {
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
            time: 150, // Before threshold
            x: 100,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };
        
        // Enable fake timers
        jest.useFakeTimers();

        // Press and release before threshold
        processor.handle(pressInput);
        processor.handle(releaseInput);

        // Fast-forward time to exceed default threshold
        jest.advanceTimersByTime((processor as any).durationThreshold + 1);

        expect(mockEmit).not.toHaveBeenCalled();
        
        // Restore real timers
        jest.useRealTimers();
    });
    
    it('should cancel long press if movement exceeds max distance', () => {
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
            time: 150,
            x: 200, // Movement exceeds max distance
            y: 200,
            buttons: 1,
            originalEvent: mockEvent,
        };
        
        // Enable fake timers
        jest.useFakeTimers();

        // Press and move beyond threshold
        processor.handle(pressInput);
        processor.handle(moveInput);

        // Fast-forward time to exceed default threshold
        jest.advanceTimersByTime((processor as any).durationThreshold + 1);

        // Should not emit since movement was too large
        expect(mockEmit).not.toHaveBeenCalled();
        
        // Restore real timers
        jest.useRealTimers();
    });
});