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

// Mock the validation module to prevent errors during testing
jest.mock('@orbitjs/validation', () => {
    return {
        ...jest.requireActual('@orbitjs/validation'),
        assert: {
            finite: jest.fn((value) => {
                // Simply return the value without validation for testing purposes
                return value;
            })
        }
    };
});

import { 
    createGestureProcessor,
    TapProcessor,
    DoubleTapProcessor,
    LongPressProcessor,
    DragProcessor,
    SwipeProcessor,
    HoverProcessor,
    ContextMenuProcessor,
    SubmitProcessor
} from '@/kernel/events/adapters/processors';
import { GestureEmit } from '@/kernel/events/adapters/processors/types';

describe('GestureProcessor Factory', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;

    beforeEach(() => {
        mockEmit = jest.fn();
    });

    it('should create a TapProcessor', () => {
        const descriptor = {
            semantic: 'tap' as const,
            processor: 'tapProcessor' as const,
            requires: ['press', 'release'] as const
        };

        const processor = createGestureProcessor(descriptor, mockEmit);

        expect(processor).toBeInstanceOf(TapProcessor);
    });

    it('should create a DoubleTapProcessor', () => {
        const descriptor = {
            semantic: 'dblclick' as const,
            processor: 'doubleTapProcessor' as const,
            requires: ['press'] as const
        };

        const processor = createGestureProcessor(descriptor, mockEmit);

        expect(processor).toBeInstanceOf(DoubleTapProcessor);
    });

    it('should create a LongPressProcessor', () => {
        const descriptor = {
            semantic: 'longpress' as const,
            processor: 'longPressProcessor' as const,
            requires: ['press', 'move', 'cancel'] as const
        };

        const processor = createGestureProcessor(descriptor, mockEmit);

        expect(processor).toBeInstanceOf(LongPressProcessor);
    });

    it('should create a DragProcessor (panProcessor)', () => {
        const descriptor = {
            semantic: 'drag' as const,
            processor: 'panProcessor' as const,
            requires: ['press', 'move', 'release', 'cancel'] as const
        };

        const processor = createGestureProcessor(descriptor, mockEmit);

        expect(processor).toBeInstanceOf(DragProcessor);
    });

    it('should create a SwipeProcessor', () => {
        const descriptor = {
            semantic: 'swipe' as const,
            processor: 'swipeProcessor' as const,
            requires: ['press', 'release', 'cancel'] as const
        };

        const processor = createGestureProcessor(descriptor, mockEmit);

        expect(processor).toBeInstanceOf(SwipeProcessor);
    });

    it('should create a HoverProcessor', () => {
        const descriptor = {
            semantic: 'hover' as const,
            processor: 'hoverProcessor' as const,
            requires: ['enter', 'leave'] as const
        };

        const processor = createGestureProcessor(descriptor, mockEmit);

        expect(processor).toBeInstanceOf(HoverProcessor);
    });

    it('should create a ContextMenuProcessor', () => {
        const descriptor = {
            semantic: 'contextmenu' as const,
            processor: 'contextMenuProcessor' as const,
            requires: ['press', 'keydown'] as const
        };

        const processor = createGestureProcessor(descriptor, mockEmit);

        expect(processor).toBeInstanceOf(ContextMenuProcessor);
    });

    it('should create a SubmitProcessor (enterKeyProcessor)', () => {
        const descriptor = {
            semantic: 'submit' as const,
            processor: 'enterKeyProcessor' as const,
            requires: ['submit'] as const
        };

        const processor = createGestureProcessor(descriptor, mockEmit);

        expect(processor).toBeInstanceOf(SubmitProcessor);
    });

    it('should throw an error for unknown processor', () => {
        const descriptor = {
            semantic: 'tap' as const, // Use an existing semantic value
            processor: 'unknownProcessor' as any, // But use an unknown processor
            requires: ['press', 'release'] as const
        };

        expect(() => {
            createGestureProcessor(descriptor, mockEmit);
        }).toThrow('Unknown gesture processor');
    });
});