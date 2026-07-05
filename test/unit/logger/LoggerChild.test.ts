import { LoggerChild } from '@/logger/LoggerChild';
import { Logger } from '@/logger/Logger';
import { LogEntry } from '@/logger/types';

// 创建 Logger mock
const mockLoggerEmit = jest.fn();

jest.mock('@/logger/Logger', () => {
    return {
        Logger: jest.fn().mockImplementation(() => {
            return {
                emit: mockLoggerEmit,
            };
        }),
    };
});

describe('LoggerChild', () => {
    let loggerChild: LoggerChild;
    let mockParent: Logger;

    beforeEach(() => {
        mockLoggerEmit.mockClear();
        mockParent = new Logger();
        loggerChild = new LoggerChild(mockParent, 'TestCategory');
    });

    describe('constructor', () => {
        it('should create a LoggerChild instance with parent and category', () => {
            expect(loggerChild).toBeInstanceOf(LoggerChild);
        });
    });

    describe('debug', () => {
        it('should emit a debug level log entry', () => {
            const message = 'Debug message';
            const data = ['data1', 'data2'];

            loggerChild.debug(message, ...data);

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('debug');
            expect(calledWith.category).toBe('TestCategory');
            expect(calledWith.message).toBe(message);
            expect(calledWith.data).toEqual(data);
            expect(calledWith.timestamp).toBeDefined();
        });

        it('should handle debug calls with no arguments', () => {
            loggerChild.debug();

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('debug');
            expect(calledWith.message).toBeUndefined();
            expect(calledWith.data).toEqual([]);
        });
    });

    describe('info', () => {
        it('should emit an info level log entry', () => {
            const message = 'Info message';
            const data = [123, 'test'];

            loggerChild.info(message, ...data);

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('info');
            expect(calledWith.category).toBe('TestCategory');
            expect(calledWith.message).toBe(message);
            expect(calledWith.data).toEqual(data);
            expect(calledWith.timestamp).toBeDefined();
        });

        it('should handle info calls with only message', () => {
            const message = 'Simple info message';

            loggerChild.info(message);

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('info');
            expect(calledWith.message).toBe(message);
            expect(calledWith.data).toEqual([]);
        });
    });

    describe('warn', () => {
        it('should emit a warn level log entry', () => {
            const message = 'Warning message';
            const data = [{ warning: true }];

            loggerChild.warn(message, ...data);

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('warn');
            expect(calledWith.category).toBe('TestCategory');
            expect(calledWith.message).toBe(message);
            expect(calledWith.data).toEqual(data);
            expect(calledWith.timestamp).toBeDefined();
        });

        it('should handle warn calls with multiple data arguments', () => {
            loggerChild.warn('Warning', 'data1', 42, { key: 'value' });

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('warn');
            expect(calledWith.message).toBe('Warning');
            expect(calledWith.data).toEqual(['data1', 42, { key: 'value' }]);
        });
    });

    describe('error', () => {
        it('should emit an error level log entry with Error object', () => {
            const error = new Error('Test error');
            error.stack = 'Error: Test error\n    at <stack trace>';
            const data = ['additional', 'data'];

            loggerChild.error(error, ...data);

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('error');
            expect(calledWith.category).toBe('TestCategory');
            expect(calledWith.error).toBe(error);
            expect(calledWith.data).toEqual(data);
            expect(calledWith.timestamp).toBeDefined();
            expect(calledWith.message).toBeUndefined();
        });

        it('should emit an error level log entry with non-Error object', () => {
            const errorMessage = 'Error message';
            const data = ['more', 'data'];

            loggerChild.error(errorMessage, ...data);

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('error');
            expect(calledWith.category).toBe('TestCategory');
            expect(calledWith.message).toBe(errorMessage);
            expect(calledWith.data).toEqual(data);
            expect(calledWith.timestamp).toBeDefined();
        });

        it('should handle error calls with Error object but no additional data', () => {
            const error = new Error('Only error, no data');

            loggerChild.error(error);

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('error');
            expect(calledWith.category).toBe('TestCategory');
            expect(calledWith.error).toBe(error);
            expect(calledWith.data).toEqual([]);
            expect(calledWith.message).toBeUndefined();
        });

        it('should handle error calls with primitive error and no additional data', () => {
            loggerChild.error('Simple error message');

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('error');
            expect(calledWith.category).toBe('TestCategory');
            expect(calledWith.message).toBe('Simple error message');
            expect(calledWith.data).toEqual([]);
        });

        it('should handle error calls with null and undefined values', () => {
            loggerChild.error(null, 'additionalData');
            loggerChild.error(undefined, 'moreData');

            expect(mockLoggerEmit).toHaveBeenCalledTimes(2);

            const firstCall: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(firstCall.level).toBe('error');
            expect(firstCall.message).toBeNull();
            expect(firstCall.data).toEqual(['additionalData']);

            const secondCall: LogEntry = mockLoggerEmit.mock.calls[1][0];
            expect(secondCall.level).toBe('error');
            expect(secondCall.message).toBeUndefined();
            expect(secondCall.data).toEqual(['moreData']);
        });
    });

    describe('log method (private)', () => {
        it('should properly structure log entries', () => {
            // Since log is private, we test it indirectly through public methods
            loggerChild.info('Test message', 'data1', 123);

            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith).toMatchObject({
                timestamp: expect.any(Number),
                level: 'info',
                category: 'TestCategory',
                message: 'Test message',
                data: ['data1', 123],
            });
        });
    });

    describe('different data types', () => {
        it('should handle various data types in log messages', () => {
            const complexData = {
                string: 'text',
                number: 42,
                boolean: true,
                array: [1, 2, 3],
                object: { nested: 'value' },
                null: null,
                undefined: undefined,
            };

            loggerChild.info('Complex data test', complexData, new Date(), /regex/);

            expect(mockLoggerEmit).toHaveBeenCalledTimes(1);
            const calledWith: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(calledWith.level).toBe('info');
            expect(calledWith.message).toBe('Complex data test');
            expect(calledWith.data).toEqual([complexData, expect.any(Date), /regex/]);
        });
    });

    describe('timestamp handling', () => {
        // 在需要使用假时间的测试套件中设置
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should generate different timestamps for different log entries', () => {
            loggerChild.info('First message');
            jest.advanceTimersByTime(100); // Advance timer by 100ms
            loggerChild.info('Second message');

            const firstCallTimestamp = mockLoggerEmit.mock.calls[0][0].timestamp;
            const secondCallTimestamp = mockLoggerEmit.mock.calls[1][0].timestamp;

            expect(secondCallTimestamp).toBeGreaterThan(firstCallTimestamp);
        });
    });

    describe('category handling', () => {
        it('should maintain the assigned category for all log entries', () => {
            const category = 'CustomCategory';
            const customLoggerChild = new LoggerChild(mockParent, category);

            customLoggerChild.debug('Debug');
            customLoggerChild.info('Info');
            customLoggerChild.warn('Warn');
            customLoggerChild.error(new Error('Error'));

            expect(mockLoggerEmit).toHaveBeenCalledTimes(4);
            mockLoggerEmit.mock.calls.forEach(call => {
                const logEntry: LogEntry = call[0];
                expect(logEntry.category).toBe(category);
            });
        });
    });

    describe('all code paths coverage', () => {
        it('should cover all branches in error method', () => {
            // 测试 Error 实例分支
            loggerChild.error(new Error('Error instance'));

            // 测试非 Error 实例分支
            loggerChild.error('String error');

            expect(mockLoggerEmit).toHaveBeenCalledTimes(2);

            // 验证第一次调用使用 error 字段
            const firstCall: LogEntry = mockLoggerEmit.mock.calls[0][0];
            expect(firstCall.error).toBeInstanceOf(Error);
            expect(firstCall.message).toBeUndefined();

            // 验证第二次调用使用 message 字段
            const secondCall: LogEntry = mockLoggerEmit.mock.calls[1][0];
            expect(secondCall.message).toBe('String error');
            expect(secondCall.error).toBeUndefined();
        });
    });
});
