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

import { HoverProcessor } from '@/kernel/events/adapters/processors';
import { GestureEmit } from '@/kernel/events/adapters/processors/types';
import { InputSignal } from '@/kernel/events/adapters/semantic-map';

describe('HoverProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: HoverProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new HoverProcessor(
            'hover',
            mockEmit
        );
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should emit hover event on enter', () => {
        const mockEvent = new MouseEvent('mouseenter');
        const input = {
            signal: 'enter' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };

        processor.handle(input);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'hover',
            originalEvent: mockEvent
        });
    });

    it('should emit hover event on leave', () => {
        const mockEvent = new MouseEvent('mouseleave');
        const input = {
            signal: 'leave' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };

        processor.handle(input);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'hover',
            originalEvent: mockEvent
        });
    });
});