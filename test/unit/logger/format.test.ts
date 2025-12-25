import { format } from '@/logger/format';
import { LogEntry, LoggerOptions } from '@/logger/types';
import { colorLevel } from '@/logger/color';

jest.mock('@/logger/color', () => ({
    colorLevel: jest.fn((level: string, useColor: boolean) => {
        return useColor ? `[${level}]` : level.padEnd(5);
    }),
}));

describe('format', () => {
    let mockEntry: LogEntry;
    let mockOptions: LoggerOptions;

    beforeEach(() => {
        mockEntry = {
            timestamp: new Date('2023-01-01T12:00:00.000Z').getTime(),
            level: 'info',
            category: 'TestCategory',
            message: 'Test message',
        };

        mockOptions = {
            color: false,
        };
    });

    it('should pad the level to 5 characters', () => {
        const entryWithShortLevel: LogEntry = {
            ...mockEntry,
            level: 'warn', // 4 characters, should be padded to 5
        };

        const result = format(entryWithShortLevel, mockOptions);

        // 方法1: 直接检查特定位置的内容
        const levelStartIndex = result.indexOf('WARN');
        const levelSegment = result.substring(levelStartIndex, levelStartIndex + 5);
        expect(levelSegment).toBe('WARN '); // 检查是否正确填充

        // 方法2: 使用正则表达式验证格式
        expect(result).toMatch(/2023-01-01T12:00:00\.000Z\s+WARN\s{1}/);

        // 方法3: 检查级别后是否紧跟一个空格
        const warnIndex = result.indexOf('WARN');
        expect(result.substring(warnIndex + 4, warnIndex + 5)).toBe(' ');
    });

    it('should pad the category to 16 characters', () => {
        const entryWithShortCategory: LogEntry = {
            ...mockEntry,
            category: 'Test',
        };

        const result = format(entryWithShortCategory, mockOptions);

        // 找到category的位置并验证其长度
        const testIndex = result.indexOf('Test');
        const categorySegment = result.substring(testIndex, testIndex + 16);
        expect(categorySegment).toBe('Test            '); // Test + 12个空格
    });

    it('should handle log entries without category', () => {
        const entryWithoutCategory: LogEntry = {
            ...mockEntry,
            category: undefined,
        };

        const result = format(entryWithoutCategory, mockOptions);
        const parts = result.split(' ');

        // Category position should be empty or very short
        expect(parts[2].trim()).toBe('');
    });

    it('should format error objects with stack trace', () => {
        const error = new Error('Test error');
        error.stack = 'Error: Test error\n    at <stack trace>';

        const entryWithError: LogEntry = {
            ...mockEntry,
            error: error,
            message: undefined,
        };

        const result = format(entryWithError, mockOptions);

        expect(result).toContain(error.stack);
    });

    it('should format error objects with message when stack is not available', () => {
        const error = new Error('Test error');
        Object.defineProperty(error, 'stack', { value: null }); // Remove stack

        const entryWithError: LogEntry = {
            ...mockEntry,
            error: error,
            message: undefined,
        };

        const result = format(entryWithError, mockOptions);

        expect(result).toContain('Test error');
    });

    it('should call colorLevel with correct parameters when color option is enabled', () => {
        const optionsWithColor: LoggerOptions = {
            color: true,
        };

        format(mockEntry, optionsWithColor);

        expect(colorLevel).toHaveBeenCalledWith('INFO', true);
    });

    it('should handle nullish messages gracefully', () => {
        const entryWithNullMessage: LogEntry = {
            ...mockEntry,
            message: null,
        };

        const entryWithUndefinedMessage: LogEntry = {
            ...mockEntry,
            message: undefined,
        };

        const resultWithNull = format(entryWithNullMessage, mockOptions);
        const resultWithUndefined = format(entryWithUndefinedMessage, mockOptions);

        expect(resultWithNull).not.toContain('null');
        expect(resultWithUndefined).not.toContain('undefined');
    });

    it('should convert non-string messages to strings', () => {
        const entryWithNumberMessage: LogEntry = {
            ...mockEntry,
            message: 12345,
        };

        const result = format(entryWithNumberMessage, mockOptions);

        expect(result).toContain('12345');
    });
});
