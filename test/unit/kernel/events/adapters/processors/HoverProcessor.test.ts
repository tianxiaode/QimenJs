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

import { HoverProcessor } from '@/kernel/events/adapters/processors/HoverProcessor';
import { GestureEmit, InputSignal } from '@/kernel/types';

describe('HoverProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: HoverProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new HoverProcessor('hover', mockEmit);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect hover when mouse moves over an element', () => {
        const mockEvent = new MouseEvent('mousemove');
        const input = {
            signal: 'move' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 0,
            originalEvent: mockEvent,
        };

        processor.handle(input);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'hover',
            originalEvent: mockEvent,
            x: 100,
            y: 100,
        });
    });

    it('should not detect hover when mouse moves while button is pressed', () => {
        const mockEvent = new MouseEvent('mousemove');
        const input = {
            signal: 'move' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1, // Button is pressed (dragging)
            originalEvent: mockEvent,
        };

        processor.handle(input);

        expect(mockEmit).not.toHaveBeenCalled();
    });
});