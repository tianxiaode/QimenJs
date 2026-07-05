import { SimpleWorkerManager } from '@/task/worker/SimpleWorkerManager';
import { WorkerManagerBase } from '@/task/worker/WorkerManagerBase';
import { Logger } from '@qimenjs/logger';

// 创建一个测试用的SimpleWorkerManager子类来访问受保护的方法
class TestSimpleWorkerManager extends SimpleWorkerManager {
    public postMessage(data: any) {
        this.post(data);
    }

    public onError(error: ErrorEvent) {
        super.onError(error);
    }

    public onMessageError(error: MessageEvent) {
        super.onMessageError(error);
    }
}

describe('SimpleWorkerManager', () => {
    let simpleWorkerManager: TestSimpleWorkerManager;
    const mockWorkerUrl = '/mock/worker.js';

    beforeEach(() => {
        // 模拟Worker构造函数
        const mockWorkerInstance = {
            postMessage: jest.fn(),
            onmessage: null,
            onerror: null,
            onmessageerror: null,
            terminate: jest.fn(),
        };

        (window as any).Worker = jest.fn(() => mockWorkerInstance);

        // 创建实例前确保Worker构造函数被模拟
        simpleWorkerManager = new TestSimpleWorkerManager(mockWorkerUrl);
        // 立即启动worker
        simpleWorkerManager.start();
    });

    afterEach(() => {
        simpleWorkerManager.stop();
        (window as any).Worker = undefined;
    });

    describe('constructor', () => {
        it('should create an instance with the provided URL', () => {
            expect(simpleWorkerManager).toBeInstanceOf(SimpleWorkerManager);
            // 验证Worker构造函数被调用并传入正确的URL
            expect((window as any).Worker).toHaveBeenCalledWith(mockWorkerUrl);
        });

        it('should accept handlers options', () => {
            const mockOnMessage = jest.fn();
            const mockOnError = jest.fn();
            const mockOnMessageError = jest.fn();

            const workerWithHandlers = new SimpleWorkerManager(mockWorkerUrl, {
                onMessage: mockOnMessage,
                onError: mockOnError,
                onMessageError: mockOnMessageError,
            });

            expect((workerWithHandlers as any).handlers.onMessage).toBe(mockOnMessage);
            expect((workerWithHandlers as any).handlers.onError).toBe(mockOnError);
            expect((workerWithHandlers as any).handlers.onMessageError).toBe(mockOnMessageError);
        });
    });

    describe('onMessage', () => {
        it('should call the onMessage handler if provided', () => {
            const mockOnMessage = jest.fn();
            const workerWithHandlers = new SimpleWorkerManager(mockWorkerUrl, {
                onMessage: mockOnMessage,
            });
            workerWithHandlers.start();

            const mockEvent = { data: 'test data' } as MessageEvent;
            (workerWithHandlers as any).onMessage(mockEvent);

            expect(mockOnMessage).toHaveBeenCalledWith(mockEvent);
        });

        it('should not throw an error if no onMessage handler is provided', () => {
            const mockEvent = { data: 'test data' } as MessageEvent;

            expect(() => {
                (simpleWorkerManager as any).onMessage(mockEvent);
            }).not.toThrow();
        });
    });

    describe('onError', () => {
        beforeEach(() => {
            // 模拟logger的error方法以避免测试失败
            jest.spyOn((simpleWorkerManager as any).logger, 'error').mockImplementation(() => {});
        });

        it('should call the onError handler if provided', () => {
            const mockOnError = jest.fn();
            const workerWithHandlers = new TestSimpleWorkerManager(mockWorkerUrl, {
                onError: mockOnError,
            });
            workerWithHandlers.start();

            const mockErrorEvent = { message: 'test error' } as ErrorEvent;
            workerWithHandlers.onError(mockErrorEvent);

            expect(mockOnError).toHaveBeenCalledWith(mockErrorEvent);
        });

        it('should call super.onError method which logs the error', () => {
            const loggerErrorSpy = jest.spyOn((simpleWorkerManager as any).logger, 'error');

            const mockErrorEvent = { message: 'test error' } as ErrorEvent;
            simpleWorkerManager.onError(mockErrorEvent);

            expect(loggerErrorSpy).toHaveBeenCalledWith(mockErrorEvent);
        });

        it('should handle errors without throwing', () => {
            const mockErrorEvent = { message: 'test error' } as ErrorEvent;

            expect(() => {
                simpleWorkerManager.onError(mockErrorEvent);
            }).not.toThrow();
        });
    });

    describe('onMessageError', () => {
        beforeEach(() => {
            // 模拟logger的error方法以避免测试失败
            jest.spyOn((simpleWorkerManager as any).logger, 'error').mockImplementation(() => {});
        });

        it('should call the onMessageError handler if provided', () => {
            const mockOnMessageError = jest.fn();
            const workerWithHandlers = new SimpleWorkerManager(mockWorkerUrl, {
                onMessageError: mockOnMessageError,
            });
            workerWithHandlers.start();

            const mockMessageEvent = { data: 'error data' } as MessageEvent;
            workerWithHandlers['handlers'].onMessageError?.call(
                workerWithHandlers,
                mockMessageEvent
            );

            expect(mockOnMessageError).toHaveBeenCalledWith(mockMessageEvent);
        });

        it('should call super.onMessageError method which logs the error', () => {
            const loggerErrorSpy = jest.spyOn((simpleWorkerManager as any).logger, 'error');

            const mockMessageEvent = { data: 'error data' } as MessageEvent;
            simpleWorkerManager.onMessageError(mockMessageEvent);

            expect(loggerErrorSpy).toHaveBeenCalledWith(mockMessageEvent);
        });

        it('should handle onMessageError when no handler is provided', () => {
            const loggerErrorSpy = jest.spyOn((simpleWorkerManager as any).logger, 'error');

            const mockMessageEvent = { data: 'error data' } as MessageEvent;
            // 直接调用onMessageError，但不提供handlers.onMessageError
            simpleWorkerManager.onMessageError(mockMessageEvent);

            expect(loggerErrorSpy).toHaveBeenCalledWith(mockMessageEvent);
        });

        it('should handle message errors without throwing', () => {
            const mockMessageEvent = { data: 'error data' } as MessageEvent;

            expect(() => {
                simpleWorkerManager.onMessageError(mockMessageEvent);
            }).not.toThrow();
        });
    });

    describe('post and stop', () => {
        it('should inherit post method from WorkerManagerBase', () => {
            const testData = { action: 'test', data: 'value' };

            // 使用测试子类来访问受保护的post方法
            const testWorkerManager = new TestSimpleWorkerManager(mockWorkerUrl);
            testWorkerManager.start();

            const postMessageSpy = jest.spyOn((testWorkerManager as any).worker, 'postMessage');
            testWorkerManager.postMessage(testData);

            expect(postMessageSpy).toHaveBeenCalledWith(testData);
        });

        it('should inherit stop method from WorkerManagerBase', () => {
            const terminateSpy = jest.spyOn((simpleWorkerManager as any).worker, 'terminate');

            simpleWorkerManager.stop();

            expect(terminateSpy).toHaveBeenCalled();
        });
    });
});
