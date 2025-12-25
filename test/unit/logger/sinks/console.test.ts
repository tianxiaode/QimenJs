import { consoleSink } from '@/logger/sinks/console';

describe('consoleSink', () => {
    // 保存原始的 console 方法
    const originalConsole = {
        error: console.error,
        warn: console.warn,
        log: console.log,
    };

    // 创建 mock 函数来监视 console 调用
    const mockConsoleError = jest.fn();
    const mockConsoleWarn = jest.fn();
    const mockConsoleLog = jest.fn();

    beforeEach(() => {
        // 清除所有 mock 的调用历史
        mockConsoleError.mockClear();
        mockConsoleWarn.mockClear();
        mockConsoleLog.mockClear();

        // 替换原始 console 方法为 mock 函数
        console.error = mockConsoleError;
        console.warn = mockConsoleWarn;
        console.log = mockConsoleLog;
    });

    afterEach(() => {
        // 恢复原始的 console 方法
        console.error = originalConsole.error;
        console.warn = originalConsole.warn;
        console.log = originalConsole.log;
    });

    it('should call console.error for error level logs', () => {
        const logText = '2023-01-01T12:00:00.000Z ERROR Test error message';

        consoleSink(logText, 'error');

        expect(mockConsoleError).toHaveBeenCalledWith(logText);
        expect(mockConsoleWarn).not.toHaveBeenCalled();
        expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should call console.warn for warn level logs', () => {
        const logText = '2023-01-01T12:00:00.000Z WARN  Test warning message';

        consoleSink(logText, 'warn');

        expect(mockConsoleWarn).toHaveBeenCalledWith(logText);
        expect(mockConsoleError).not.toHaveBeenCalled();
        expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should call console.log for info level logs', () => {
        const logText = '2023-01-01T12:00:00.000Z INFO  Test info message';

        consoleSink(logText, 'info');

        expect(mockConsoleLog).toHaveBeenCalledWith(logText);
        expect(mockConsoleError).not.toHaveBeenCalled();
        expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should call console.log for debug level logs', () => {
        const logText = '2023-01-01T12:00:00.000Z DEBUG Test debug message';

        consoleSink(logText, 'debug');

        expect(mockConsoleLog).toHaveBeenCalledWith(logText);
        expect(mockConsoleError).not.toHaveBeenCalled();
        expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should call console.log for unknown level logs', () => {
        const logText = '2023-01-01T12:00:00.000Z FATAL Test fatal message';

        consoleSink(logText, 'fatal');

        expect(mockConsoleLog).toHaveBeenCalledWith(logText);
        expect(mockConsoleError).not.toHaveBeenCalled();
        expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should handle empty text strings', () => {
        consoleSink('', 'error');

        expect(mockConsoleError).toHaveBeenCalledWith('');
    });

    it('should handle special characters in log text', () => {
        const logTextWithSpecialChars =
            '2023-01-01T12:00:00.000Z ERROR Message with %c color & symbols!';

        consoleSink(logTextWithSpecialChars, 'error');

        expect(mockConsoleError).toHaveBeenCalledWith(logTextWithSpecialChars);
    });

    it('should handle multiline log text', () => {
        const multilineLogText = `2023-01-01T12:00:00.000Z ERROR First line
    Second line
    Third line`;

        consoleSink(multilineLogText, 'error');

        expect(mockConsoleError).toHaveBeenCalledWith(multilineLogText);
    });

    it('should handle very long log text', () => {
        const longLogText = '2023-01-01T12:00:00.000Z INFO  ' + 'A'.repeat(10000);

        consoleSink(longLogText, 'info');

        expect(mockConsoleLog).toHaveBeenCalledWith(longLogText);
    });

    it('should properly handle case-sensitive level names', () => {
        const logText = '2023-01-01T12:00:00.000Z ERROR Test case sensitivity';

        // 大写的 ERROR 应该不会匹配，因此使用 console.log
        consoleSink(logText, 'ERROR');

        expect(mockConsoleLog).toHaveBeenCalledWith(logText);
        expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should handle numeric strings as level', () => {
        const logText = '2023-01-01T12:00:00.000Z 123   Test numeric level';

        consoleSink(logText, '123');

        expect(mockConsoleLog).toHaveBeenCalledWith(logText);
    });

    describe('multiple calls', () => {
        it('should handle multiple sequential calls correctly', () => {
            const errorText = '2023-01-01T12:00:00.000Z ERROR Error message';
            const warnText = '2023-01-01T12:00:00.000Z WARN  Warning message';
            const infoText = '2023-01-01T12:00:00.000Z INFO  Info message';

            consoleSink(errorText, 'error');
            consoleSink(warnText, 'warn');
            consoleSink(infoText, 'info');

            expect(mockConsoleError).toHaveBeenCalledWith(errorText);
            expect(mockConsoleWarn).toHaveBeenCalledWith(warnText);
            expect(mockConsoleLog).toHaveBeenCalledWith(infoText);
        });

        it('should accumulate calls to the same console method', () => {
            const errorText1 = '2023-01-01T12:00:00.000Z ERROR First error';
            const errorText2 = '2023-01-01T12:00:00.000Z ERROR Second error';

            consoleSink(errorText1, 'error');
            consoleSink(errorText2, 'error');

            expect(mockConsoleError).toHaveBeenNthCalledWith(1, errorText1);
            expect(mockConsoleError).toHaveBeenNthCalledWith(2, errorText2);
            expect(mockConsoleError).toHaveBeenCalledTimes(2);
        });
    });
});
