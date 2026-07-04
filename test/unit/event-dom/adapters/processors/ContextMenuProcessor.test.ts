import { ContextMenuProcessor } from '@/event-dom/adapters/processors/ContextMenuProcessor';
import { GestureEmit, InputSignal } from '@/event-dom/types';

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

    it('should handle custom buttons constraint', () => {
        const customProcessor = new ContextMenuProcessor('contextmenu', mockEmit, { buttons: [1] }); // Middle mouse button
        const mockEvent = new MouseEvent('mousedown', { button: 1 });
        const input = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            buttons: 1, // Middle mouse button
            originalEvent: mockEvent,
        };

        customProcessor.handle(input);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'contextmenu',
            originalEvent: mockEvent,
        });
    });

    it('should handle keyboard context menu key', () => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'ContextMenu' });
        const input = {
            signal: 'keydown' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };

        processor.handle(input);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'contextmenu',
            originalEvent: mockEvent,
        });
    });

    it('should handle Shift+F10 keyboard combination', () => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'F10', shiftKey: true });
        const input = {
            signal: 'keydown' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };

        processor.handle(input);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'contextmenu',
            originalEvent: mockEvent,
        });
    });

    it('should not emit for regular F10 key without shift', () => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'F10', shiftKey: false });
        const input = {
            signal: 'keydown' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };

        processor.handle(input);

        expect(mockEmit).not.toHaveBeenCalled();
    });

    it('should not emit for other keys', () => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        const input = {
            signal: 'keydown' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent,
        };

        processor.handle(input);

        expect(mockEmit).not.toHaveBeenCalled();
    });
});