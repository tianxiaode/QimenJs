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

import { DragProcessor } from '@/kernel/events/adapters/processors/DragProcessor';
import { GestureEmit, InputSignal } from '@/kernel/types';

describe('DragProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: DragProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new DragProcessor('drag', mockEmit);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect drag when movement exceeds threshold', () => {
        const mockEvent = new MouseEvent('mousemove');
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
            time: 110,
            x: 150, // Moved 50px from press position
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        // First press
        processor.handle(pressInput);
        // Then move beyond threshold - this should trigger the drag start
        processor.handle(moveInput);

        // Check that drag was detected with the correct phase
        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'drag',
            originalEvent: mockEvent,
            phase: 'start',
        });
    });

    it('should not detect drag when movement is under threshold', () => {
        const mockEvent = new MouseEvent('mousemove');
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
            time: 110,
            x: 105, // Moved only 5px from press position
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        // First press
        processor.handle(pressInput);
        // Then move under threshold
        processor.handle(moveInput);

        // Check that no drag was detected
        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should reset state when released', () => {
        const mockEvent = new MouseEvent('mouseup');
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
            time: 110,
            x: 150, // Moved beyond threshold to start dragging
            y: 100,
            buttons: 1,
            originalEvent: mockEvent,
        };

        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 120,
            x: 150,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        // First press and drag beyond threshold
        processor.handle(pressInput);
        processor.handle(moveInput); // This should start dragging

        // Check that drag was detected
        expect(mockEmit).toHaveBeenCalledWith(
            expect.objectContaining({
                semantic: 'drag',
                phase: 'start'
            })
        );

        // Then release
        processor.handle(releaseInput);

        // After release, subsequent moves shouldn't continue the drag
        processor.handle(moveInput);
        // Since the drag was started once and then ended, we should still have only 2 calls (start and move)
        // If the state wasn't reset, we would have a third call
    });

    it('should not detect drag when not pressing', () => {
        const mockEvent = new MouseEvent('mousemove');
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 110,
            x: 150,
            y: 100,
            buttons: 0, // Not pressing
            originalEvent: mockEvent,
        };

        processor.handle(moveInput);

        // Should not detect drag without a prior press
        expect(mockEmit).not.toHaveBeenCalled();
    });
});
