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

// Mock the validation function used in DoubleTapProcessor
jest.mock('@/event-dom/adapters/utils/validation', () => {
    return {
        validateDoubleTap: jest.fn(
            (now, lastTapTime, x, y, lastX, lastY, maxInterval, maxDistance) => {
                const timeDiff = now - lastTapTime;
                const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
                return timeDiff < maxInterval && distance < maxDistance;
            }
        ),
    };
});

import { DoubleTapProcessor } from '@/event-dom/adapters/processors/DoubleTapProcessor';
import { GestureEmit, InputSignal } from '@/event-dom/types';
import { validateDoubleTap } from '@/event-dom/adapters/utils/validation';
import { Logger } from '@orbit-js/logger';

describe('DoubleTapProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: DoubleTapProcessor;
    let mockLogger: any;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new DoubleTapProcessor('dblclick', mockEmit);
        
        // Create a mock logger instance
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        
        // Mock the logger for the processor
        Object.defineProperty(processor, 'logger', {
            value: mockLogger,
            writable: true,
        });
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect double tap when two taps occur in quick succession', () => {
        const mockEvent = new MouseEvent('touchstart');
        const input1 = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const input2 = {
            signal: 'press' as InputSignal,
            time: 150, // 50ms later
            x: 102, // Close to first tap
            y: 102,
            buttons: 1,
            originalEvent: mockEvent,
        };

        // First tap
        processor.handle(input1);
        // Second tap - should trigger double tap
        processor.handle(input2);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'dblclick',
            originalEvent: mockEvent,
        });
    });

    it('should not detect double tap when taps are too far apart', () => {
        const mockEvent = new MouseEvent('touchstart');
        const input1 = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const input2 = {
            signal: 'press' as InputSignal,
            time: 150, // 50ms later - OK
            x: 200, // Too far from first tap
            y: 200, // Too far from first tap
            buttons: 1,
            originalEvent: mockEvent,
        };

        // First tap
        processor.handle(input1);
        // Second tap - should NOT trigger double tap because it's too far
        processor.handle(input2);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should not detect double tap when taps are too far apart in time', () => {
        const mockEvent = new MouseEvent('touchstart');
        const input1 = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const input2 = {
            signal: 'press' as InputSignal,
            time: 500, // Too long after first tap
            x: 102, // Close to first tap
            y: 102,
            buttons: 1,
            originalEvent: mockEvent,
        };

        // First tap
        processor.handle(input1);
        // Second tap - should NOT trigger double tap because it's too late
        processor.handle(input2);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should update last tap info when a tap occurs', () => {
        const mockEvent = new MouseEvent('touchstart');
        const input = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        processor.handle(input);

        // After handling a tap, the processor should store the tap info
        // The processor validates against the previous tap info, then updates
        // For the first tap, it checks against defaults (0, 0, 0) then stores the current tap
        expect((processor as any).lastTapTime).toBe(100);
        expect((processor as any).lastTapX).toBe(100);
        expect((processor as any).lastTapY).toBe(100);
    });

    it('should use validateDoubleTap function to check if it is a double tap', () => {
        const mockEvent = new MouseEvent('touchstart');
        const input1 = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const input2 = {
            signal: 'press' as InputSignal,
            time: 150,
            x: 102,
            y: 102,
            buttons: 1,
            originalEvent: mockEvent,
        };

        processor.handle(input1);
        processor.handle(input2);

        // The first tap triggers the validation (with defaults since there was no prior tap)
        // The second tap triggers validation against the first tap
        // So we check that the validation was called with the right params for the second tap
        expect(validateDoubleTap).toHaveBeenLastCalledWith(
            150, // current time
            100, // last tap time
            102, // current x
            102, // current y
            100, // last x
            100, // last y
            300, // max interval default
            10   // max distance default
        );
    });
});