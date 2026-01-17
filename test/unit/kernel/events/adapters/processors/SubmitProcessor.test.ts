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

import { SubmitProcessor } from '@/kernel/events/adapters/processors/SubmitProcessor';
import { GestureEmit, InputSignal } from '@/kernel/types';

describe('SubmitProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: SubmitProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new SubmitProcessor('submit', mockEmit);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should detect submit when triggered', () => {
        const mockEvent = new Event('submit');
        const input = {
            signal: 'submit' as InputSignal,
            time: 100,
            x: 0,
            y: 0,
            buttons: 0,
            originalEvent: mockEvent,
        };

        processor.handle(input);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'submit',
            originalEvent: mockEvent,
        });
    });
});