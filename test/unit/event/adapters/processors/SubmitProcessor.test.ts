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

import { SubmitProcessor } from '@/event/adapters/processors';
import { GestureEmit } from '@/event/adapters/processors/types';
import { InputSignal } from '@/event/adapters/semantic-map';

describe('SubmitProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: SubmitProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new SubmitProcessor(
            'submit',
            mockEmit
        );
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should emit submit event on submit signal', () => {
        const mockEvent = new Event('submit');
        const input = {
            signal: 'submit' as InputSignal,
            time: 100,
            x: 100,
            y: 100,
            originalEvent: mockEvent
        };

        processor.handle(input);

        expect(mockEmit).toHaveBeenCalledWith({
            semantic: 'submit',
            originalEvent: mockEvent
        });
    });
});