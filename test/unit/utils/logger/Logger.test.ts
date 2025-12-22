import { Logger } from '@/utils/logger/Logger';
import { LogEntry, LogLevel, LoggerOptions } from '@/utils/logger/types';
import { format } from '@/utils/logger/format';
import { consoleSink } from '@/utils/logger/sinks/console';
import { LoggerChild } from '@/utils/logger/LoggerChild';

// Mock依赖项
jest.mock('@/utils/logger/format', () => ({
    format: jest.fn(),
}));

jest.mock('@/utils/logger/sinks/console', () => ({
    consoleSink: jest.fn(),
}));

describe('Logger', () => {
    let logger: Logger;
    let mockOptions: LoggerOptions;

    beforeEach(() => {
        // 实际初始化 Logger.root
        if (!Logger.root) {
            Logger.root = new Logger();
        }

        mockOptions = { level: 'info', color: true };
        logger = new Logger(mockOptions);

        // 清除 mocks
        (format as jest.Mock).mockClear();
        (consoleSink as jest.Mock).mockClear();

        // 重置静态children映射
        (Logger as any).children = new Map<string, LoggerChild>();
    });

    describe('constructor', () => {
        it('should create a logger instance with default options', () => {
            const defaultLogger = new Logger();
            expect(defaultLogger).toBeInstanceOf(Logger);
        });

        it('should create a logger instance with provided options', () => {
            const options: LoggerOptions = { level: 'debug', color: false };
            const customLogger = new Logger(options);
            expect(customLogger).toBeInstanceOf(Logger);
        });
    });

    describe('for', () => {
        it('should create and return a LoggerChild for a string target', () => {
            const child = Logger.for('TestModule');

            expect(child).toBeInstanceOf(LoggerChild);
            expect(Logger.for('TestModule')).toBe(child); // Should return same instance
        });

        it('should create and return a LoggerChild for a function target', () => {
            class TestClass {}

            const child = Logger.for(TestClass);

            expect(child).toBeInstanceOf(LoggerChild);
            expect(Logger.for(TestClass)).toBe(child); // Should return same instance
        });

        it('should use $ClassName property if available on function target', () => {
            const TestFunction = () => {};
            (TestFunction as any).$ClassName = 'CustomClassName';

            const child = Logger.for(TestFunction);

            expect(child).toBeInstanceOf(LoggerChild);
        });

        it('should handle targets with no name gracefully', () => {
            const AnonymousFunction = Function();

            const child = Logger.for(AnonymousFunction);

            expect(child).toBeInstanceOf(LoggerChild);
        });
    });

    describe('emit', () => {
        let mockEntry: LogEntry;

        beforeEach(() => {
            mockEntry = {
                timestamp: Date.now(),
                level: 'info',
                category: 'Test',
                message: 'Test message',
            };

            (format as jest.Mock).mockReturnValue('formatted log message');
        });

        it('should format and output logs that meet minimum level requirements', () => {
            logger.emit(mockEntry);

            expect(format).toHaveBeenCalledWith(mockEntry, mockOptions);
            expect(consoleSink).toHaveBeenCalledWith('formatted log message', 'info');
        });

        it('should not output logs below the minimum level', () => {
            const debugEntry: LogEntry = { ...mockEntry, level: 'debug' };
            const loggerWithInfoMinLevel = new Logger({ level: 'info' });

            loggerWithInfoMinLevel.emit(debugEntry);

            expect(format).not.toHaveBeenCalled();
            expect(consoleSink).not.toHaveBeenCalled();
        });

        it('should output logs at or above the minimum level', () => {
            const warnEntry: LogEntry = { ...mockEntry, level: 'warn' };
            const loggerWithInfoMinLevel = new Logger({ level: 'info' });
            (format as jest.Mock).mockReturnValue('formatted warning');

            loggerWithInfoMinLevel.emit(warnEntry);

            expect(format).toHaveBeenCalledWith(warnEntry, { level: 'info' });
            expect(consoleSink).toHaveBeenCalledWith('formatted warning', 'warn');
        });

        it('should handle error level logs correctly', () => {
            const errorEntry: LogEntry = { ...mockEntry, level: 'error' };
            const loggerWithWarnMinLevel = new Logger({ level: 'warn' });
            (format as jest.Mock).mockReturnValue('formatted error');

            loggerWithWarnMinLevel.emit(errorEntry);

            expect(format).toHaveBeenCalledWith(errorEntry, { level: 'warn' });
            expect(consoleSink).toHaveBeenCalledWith('formatted error', 'error');
        });
    });

    describe('shouldLog', () => {
        it('should return true for levels at or above the minimum level', () => {
            const loggerWithWarnMinLevel = new Logger({ level: 'warn' });

            expect((loggerWithWarnMinLevel as any).shouldLog('warn')).toBe(true);
            expect((loggerWithWarnMinLevel as any).shouldLog('error')).toBe(true);
        });

        it('should return false for levels below the minimum level', () => {
            const loggerWithWarnMinLevel = new Logger({ level: 'warn' });

            expect((loggerWithWarnMinLevel as any).shouldLog('info')).toBe(false);
            expect((loggerWithWarnMinLevel as any).shouldLog('debug')).toBe(false);
        });

        it('should default to info level when not specified', () => {
            const loggerWithDefaultLevel = new Logger({});

            expect((loggerWithDefaultLevel as any).shouldLog('debug')).toBe(false);
            expect((loggerWithDefaultLevel as any).shouldLog('info')).toBe(true);
            expect((loggerWithDefaultLevel as any).shouldLog('warn')).toBe(true);
            expect((loggerWithDefaultLevel as any).shouldLog('error')).toBe(true);
        });

        it('should handle all defined log levels correctly', () => {
            const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

            levels.forEach(level => {
                const logger = new Logger({ level });
                // Should always allow the current level
                expect((logger as any).shouldLog(level)).toBe(true);
            });
        });
    });

    describe('root', () => {
        it('should have a static root property', () => {
            expect(Logger.root).toBeDefined();
        });
    });
});
