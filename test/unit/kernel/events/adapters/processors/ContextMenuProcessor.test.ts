import { ContextMenuProcessor } from '@/kernel/events/adapters/processors/ContextMenuProcessor';
import { GestureEmit, InputSignal } from '@/kernel/types';

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

describe('ContextMenuProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: ContextMenuProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        // 创建ContextMenuProcessor实例，使用正确的构造函数参数
        processor = new ContextMenuProcessor('contextmenu', mockEmit);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should handle press events with right mouse button', () => {
        const mockEvent = new MouseEvent('mousedown', { button: 2 });
        const input = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 2, // Right mouse button
            originalEvent: mockEvent,
        };

        processor.handle(input);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'contextmenu',
            originalEvent: mockEvent,
        });
    });

    it('should not emit gesture when button is not right mouse button', () => {
        const mockEvent = new MouseEvent('mousedown', { button: 0 });
        const input = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1, // Left mouse button
            originalEvent: mockEvent,
        };

        processor.handle(input);

        expect(mockEmit).not.toHaveBeenCalled();
    });
});
