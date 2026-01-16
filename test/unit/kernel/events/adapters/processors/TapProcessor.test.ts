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
import { TapProcessor, GestureEmit, InputSignal } from '@/kernel';

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

    it('should detect tap when pressed and released quickly with minimal movement', () => {
        const mockEvent = new MouseEvent('click');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 125,
            x: 105, // Small movement
            y: 105,
            originalEvent: mockEvent,
        };
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 150, // 50ms between press and release - within 250ms default interval
            x: 105, // Same as move position
            y: 105,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput); // Add move event to update lastX and lastY
        processor.handle(releaseInput);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'tap',
            originalEvent: mockEvent,
        });
    });

    it('should not detect tap when pressed too long', () => {
        const mockEvent = new MouseEvent('click');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 150,
            x: 105,
            y: 105,
            originalEvent: mockEvent,
        };
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 500, // 400ms between press and release - beyond 250ms default interval
            x: 105,
            y: 105,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(releaseInput);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should not detect tap when moved too far', () => {
        const mockEvent = new MouseEvent('click');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 125,
            x: 150, // Large movement beyond 10px limit
            y: 150,
            originalEvent: mockEvent,
        };
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 150, // 50ms between press and release - within 250ms default interval
            x: 150, // Same as move position
            y: 150,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput); // Add move event to update lastX and lastY
        processor.handle(releaseInput);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should reset on cancel signal', () => {
        const mockEvent = new MouseEvent('click');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 125,
            x: 150,
            y: 150,
            originalEvent: mockEvent,
        };
        const cancelInput = {
            signal: 'cancel' as InputSignal,
            time: 150,
            x: 150,
            y: 150,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(cancelInput);

        // After cancel, a subsequent release should not trigger tap
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 200,
            x: 150,
            y: 150,
            originalEvent: mockEvent,
        };
        processor.handle(releaseInput);

        expect(mockEmit).not.toHaveBeenCalled();
    });
});
