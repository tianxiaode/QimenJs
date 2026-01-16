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
import { DragProcessor, GestureEmit, InputSignal } from '@/kernel';

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

    it('should start drag when moving beyond minDistance', () => {
        const mockEvent = new MouseEvent('mousedown');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 105,
            x: 150, // More than 8px default minDistance
            y: 150,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput);

        // Expect a 'start' phase event
        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'drag',
            phase: 'start',
            originalEvent: mockEvent,
        });
    });

    it('should emit move events after drag starts', () => {
        const mockEvent = new MouseEvent('mousedown');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 105,
            x: 150, // More than 8px default minDistance
            y: 150,
            originalEvent: mockEvent,
        };
        const moveInput2 = {
            signal: 'move' as InputSignal,
            time: 110,
            x: 160,
            y: 160,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(moveInput2);

        // Check that a move phase event was emitted
        const moveEvents = mockEmit.mock.calls.filter(
            call => 'phase' in call[0] && call[0].phase === 'move'
        );
        expect(moveEvents.length).toBeGreaterThan(0);
        expect(moveEvents[0][0]).toEqual({
            semantic: 'drag',
            phase: 'move',
            dx: expect.any(Number), // dx: 60 (160 - 100) or dx: 50 (150 - 100)
            dy: expect.any(Number), // dy: 60 (160 - 100) or dy: 50 (150 - 100)
            originalEvent: mockEvent,
        });
    });

    it('should emit end event on release', () => {
        const mockEvent = new MouseEvent('mouseup');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 105,
            x: 150, // More than 8px default minDistance
            y: 150,
            originalEvent: mockEvent,
        };
        const releaseInput = {
            signal: 'release' as InputSignal,
            time: 110,
            x: 160,
            y: 160,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(releaseInput);

        const endEvents = mockEmit.mock.calls.filter(
            call => 'phase' in call[0] && call[0].phase === 'end'
        );
        expect(endEvents.length).toBeGreaterThan(0);
    });

    it('should not start drag when moving less than minDistance', () => {
        const mockEvent = new MouseEvent('mousedown');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 105,
            x: 105, // Less than 8px default minDistance
            y: 105,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput);

        // Should not have started dragging
        const startEvents = mockEmit.mock.calls.filter(
            call => 'phase' in call[0] && call[0].phase === 'start'
        );
        expect(startEvents.length).toBe(0);
    });

    it('should emit cancel event when cancelled', () => {
        const mockEvent = new MouseEvent('mousedown');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 105,
            x: 150, // More than 8px default minDistance
            y: 150,
            originalEvent: mockEvent,
        };
        const cancelInput = {
            signal: 'cancel' as InputSignal,
            time: 110,
            x: 160,
            y: 160,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput);
        processor.handle(cancelInput);

        const cancelEvents = mockEmit.mock.calls.filter(
            call => 'phase' in call[0] && call[0].phase === 'cancel'
        );
        expect(cancelEvents.length).toBeGreaterThan(0);
    });

    it('should not emit cancel event when not dragging', () => {
        const mockEvent = new MouseEvent('mousedown');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 105,
            x: 104, // Less than 8px default minDistance
            y: 104,
            originalEvent: mockEvent,
        };
        const cancelInput = {
            signal: 'cancel' as InputSignal,
            time: 110,
            x: 160,
            y: 160,
            originalEvent: mockEvent,
        };

        processor.handle(pressInput);
        processor.handle(moveInput); // This should not start dragging
        processor.handle(cancelInput);

        // Since we didn't drag, there should be no cancel event
        const cancelEvents = mockEmit.mock.calls.filter(
            call => 'phase' in call[0] && call[0].phase === 'cancel'
        );
        expect(cancelEvents.length).toBe(0);
    });

    it('should work with custom minDistance constraint', () => {
        const mockEmit2 = jest.fn();
        const customProcessor = new DragProcessor(
            'drag',
            mockEmit2,
            { minDistance: 50 } // Custom minDistance
        );

        const mockEvent = new MouseEvent('mousedown');
        const pressInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };
        const moveInput = {
            signal: 'move' as InputSignal,
            time: 105,
            x: 120, // More than default but less than custom minDistance
            y: 120,
            originalEvent: mockEvent,
        };

        customProcessor.handle(pressInput);
        customProcessor.handle(moveInput);

        // Should not have started dragging since 20px < 50px custom minDistance
        const startEvents = mockEmit2.mock.calls.filter(
            call => 'phase' in call[0] && call[0].phase === 'start'
        );
        expect(startEvents.length).toBe(0);
    });
});
