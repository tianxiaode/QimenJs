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

// Mock the validation function used in DoubleTapProcessor
jest.mock('@/kernel/events/adapters/utils/validation', () => {
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

import { DoubleTapProcessor, GestureEmit, InputSignal, validateDoubleTap } from '@/kernel';
import { Logger } from '@orbitjs/logger';

describe('DoubleTapProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: DoubleTapProcessor;
    let mockLogger: any;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new DoubleTapProcessor('dblclick', mockEmit);

        // Get the mock logger instance
        mockLogger = (Logger.for as jest.Mock).mock.results[0].value;
        mockLogger.debug.mockClear();
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect double tap when two taps occur within time and distance constraints', () => {
        const mockEvent = new MouseEvent('click');
        const input1 = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const input2 = {
            signal: 'press' as InputSignal,
            time: 200, // Within 300ms default interval
            x: 105, // Within 10px default distance
            y: 105,
            originalEvent: mockEvent,
        };

        // First tap
        processor.handle(input1);
        // Second tap
        processor.handle(input2);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'dblclick',
            originalEvent: mockEvent,
        });
    });

    it('should not detect double tap when taps are too far apart', () => {
        const mockEvent = new MouseEvent('click');
        const input1 = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const input2 = {
            signal: 'press' as InputSignal,
            time: 200,
            x: 200, // Too far from first tap
            y: 200,
            originalEvent: mockEvent,
        };

        // First tap
        processor.handle(input1);
        // Second tap
        processor.handle(input2);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should not detect double tap when taps are too far apart in time', () => {
        const mockEvent = new MouseEvent('click');
        const input1 = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const input2 = {
            signal: 'press' as InputSignal,
            time: 500, // More than 300ms after first tap
            x: 105, // Within 10px distance
            y: 105,
            originalEvent: mockEvent,
        };

        // First tap
        processor.handle(input1);
        // Second tap
        processor.handle(input2);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should work with custom constraints', () => {
        // Clear the mock to start fresh
        (validateDoubleTap as jest.Mock).mockClear();

        const mockEmit2 = jest.fn();
        const customProcessor = new DoubleTapProcessor(
            'dblclick',
            mockEmit2,
            { maxInterval: 500, maxDistance: 20 } // Custom constraints
        );

        const mockEvent = new MouseEvent('click');
        const input1 = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const input2 = {
            signal: 'press' as InputSignal,
            time: 400, // Within custom 500ms interval
            x: 115, // Within custom 20px distance
            y: 115,
            originalEvent: mockEvent,
        };

        // Mock the validateDoubleTap function to return true for our test case
        (validateDoubleTap as jest.Mock).mockReturnValueOnce(true);

        // First tap
        customProcessor.handle(input1);
        // Second tap
        customProcessor.handle(input2);

        // Verify that validateDoubleTap was called with custom constraints
        expect(validateDoubleTap).toHaveBeenCalledWith(
            400, // now
            100, // lastTapTime
            115, // x
            115, // y
            100, // lastTapX
            100, // lastTapY
            500, // maxInterval (custom)
            20 // maxDistance (custom)
        );

        // Verify the emit was called
        expect(mockEmit2).toHaveBeenCalledWith({
            semantic: 'dblclick',
            originalEvent: mockEvent,
        });
    });

    it('should call validateDoubleTap with correct parameters', () => {
        const mockEvent = new MouseEvent('click');
        const input1 = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const input2 = {
            signal: 'press' as InputSignal,
            time: 200,
            x: 105,
            y: 105,
            originalEvent: mockEvent,
        };

        processor.handle(input1);
        processor.handle(input2);

        // Verify that validateDoubleTap was called with the right parameters
        expect(validateDoubleTap).toHaveBeenCalledWith(
            200, // now
            100, // lastTapTime
            105, // x
            105, // y
            100, // lastTapX
            100, // lastTapY
            300, // maxInterval (default)
            10 // maxDistance (default)
        );
    });
});
