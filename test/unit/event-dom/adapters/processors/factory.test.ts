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

// Mock the validation module to prevent errors during testing
jest.mock('@qimenjs/validation', () => {
    return {
        ...jest.requireActual('@qimenjs/validation'),
        assert: {
            finite: jest.fn(value => {
                // Simply return the value without validation for testing purposes
                return value;
            }),
        },
    };
});

import { createGestureProcessor } from '@/event-dom/adapters/processors/factory';
import { GestureEmit, GestureEventDescriptor } from '@/event-dom/types';

describe('Processor Factory', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;

    beforeEach(() => {
        mockEmit = jest.fn();
    });

    it('should create ContextMenuProcessor', () => {
        const descriptor: GestureEventDescriptor = {
            requires: [],
            processor: 'contextMenuProcessor',
            semantic: 'contextmenu'
        };
        const processor = createGestureProcessor(descriptor, mockEmit);
        expect(processor).toBeDefined();
        expect(processor).toHaveProperty('handlers');
    });

    it('should create DoubleTapProcessor', () => {
        const descriptor: GestureEventDescriptor = {
            requires: [],
            processor: 'doubleTapProcessor',
            semantic: 'dblclick'
        };
        const processor = createGestureProcessor(descriptor, mockEmit);
        expect(processor).toBeDefined();
        expect(processor).toHaveProperty('handlers');
    });

    it('should create DragProcessor', () => {
        const descriptor: GestureEventDescriptor = {
            requires: [],
            processor: 'panProcessor',
            semantic: 'drag'
        };
        const processor = createGestureProcessor(descriptor, mockEmit);
        expect(processor).toBeDefined();
        expect(processor).toHaveProperty('handlers');
    });

    it('should create HoverProcessor', () => {
        const descriptor: GestureEventDescriptor = {
            requires: [],
            processor: 'hoverProcessor',
            semantic: 'hover'
        };
        const processor = createGestureProcessor(descriptor, mockEmit);
        expect(processor).toBeDefined();
        expect(processor).toHaveProperty('handlers');
    });

    it('should create LongPressProcessor', () => {
        const descriptor: GestureEventDescriptor = {
            requires: [],
            processor: 'longPressProcessor',
            semantic: 'longpress'
        };
        const processor = createGestureProcessor(descriptor, mockEmit);
        expect(processor).toBeDefined();
        expect(processor).toHaveProperty('handlers');
    });

    it('should create SubmitProcessor', () => {
        const descriptor: GestureEventDescriptor = {
            requires: [],
            processor: 'enterKeyProcessor',
            semantic: 'submit'
        };
        const processor = createGestureProcessor(descriptor, mockEmit);
        expect(processor).toBeDefined();
        expect(processor).toHaveProperty('handlers');
    });

    it('should create SwipeProcessor', () => {
        const descriptor: GestureEventDescriptor = {
            requires: [],
            processor: 'swipeProcessor',
            semantic: 'swipe'
        };
        const processor = createGestureProcessor(descriptor, mockEmit);
        expect(processor).toBeDefined();
        expect(processor).toHaveProperty('handlers');
    });

    it('should create TapProcessor', () => {
        const descriptor: GestureEventDescriptor = {
            requires: [],
            processor: 'tapProcessor',
            semantic: 'tap'
        };
        const processor = createGestureProcessor(descriptor, mockEmit);
        expect(processor).toBeDefined();
        expect(processor).toHaveProperty('handlers');
    });

    it('should throw error for unknown processor type', () => {
        const descriptor: GestureEventDescriptor = {
            requires: [],
            processor: 'unknownProcessor' as any,
            semantic: 'tap'
        };
        
        expect(() => {
            createGestureProcessor(descriptor, mockEmit);
        }).toThrow(/Unknown gesture processor/);
    });
});