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

import { GestureProcessor } from '@/event-dom/adapters/processors/GestureProcessor';
import { GestureEmit, InputSignal } from '@/event-dom/types';
import { GestureError, KernelErrorCode } from '@/error';

// 创建一个具体的子类来测试抽象基类
class TestGestureProcessor extends GestureProcessor {
    constructor(semantic: 'tap' | 'click' | 'dblclick' | 'longpress' | 'drag' | 'swipe' | 'hover' | 'contextmenu' | 'submit' = 'tap', emit: (event: GestureEmit) => void) {
        super(semantic, emit);

        // 设置处理器句柄，以便可以测试底层的start方法
        this.handlers = {
            press: input => {
                // 调用基类的start方法，这将触发x和y的验证
                this.start(input);
            },
            move: input => {
                this.move(input);
            },
            release: input => {
                this.end();
            },
            cancel: () => this.reset(),
        };
    }

    public handleInput(input: any) {
        this.handle(input);
    }

    public getActiveStatus() {
        return this.active;
    }
}

describe('GestureProcessor', () => {
    let mockEmit: jest.Mock<void, [GestureEmit]>;
    let processor: TestGestureProcessor;

    beforeEach(() => {
        mockEmit = jest.fn();
        processor = new TestGestureProcessor('tap', mockEmit);
    });

    it('should throw error when x is null', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: null,
            y: 100,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'x must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should throw error when x is undefined', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: undefined,
            y: 100,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'x must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should throw error when x is NaN', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: NaN,
            y: 100,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'x must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should throw error when x is Infinity', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: Infinity,
            y: 100,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'x must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should throw error when x is -Infinity', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: -Infinity,
            y: 100,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'x must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should throw error when y is null', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: null,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'y must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should throw error when y is undefined', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: undefined,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'y must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should throw error when y is NaN', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: NaN,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'y must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should throw error when y is Infinity', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: Infinity,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'y must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should throw error when y is -Infinity', () => {
        const invalidInput: any = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: -Infinity,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(GestureError);

        expect(() => {
            processor.handleInput(invalidInput);
        }).toThrow(expect.objectContaining({
            message: 'y must be a finite number',
            code: KernelErrorCode.GESTURE_RECOGNITION_ERROR,
        }));
    });

    it('should successfully start gesture when x and y are valid numbers', () => {
        const validInput = {
            signal: 'press' as InputSignal,
            time: 100,
            x: 100,
            y: 200,
            buttons: 1,
            originalEvent: new MouseEvent('click'),
        };

        // 这次不应该抛出错误
        expect(() => {
            processor.handleInput(validInput);
        }).not.toThrow();

        // 检查状态是否正确设置
        expect(processor.getActiveStatus()).toBe(true);
    });
});