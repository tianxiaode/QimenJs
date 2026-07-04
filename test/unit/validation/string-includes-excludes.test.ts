/**
 * String Includes/Excludes Processor 测试
 *
 * 覆盖：
 * 1. includes 枚举值验证（数组/函数形式）
 * 2. excludes 排除值验证（数组/函数形式）
 * 3. undefined 规则跳过
 * 4. 非数组值跳过
 */

jest.mock('@orbit-js/logger', () => {
    const mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        trace: jest.fn(),
        fatal: jest.fn(),
        withFields: jest.fn().mockReturnThis(),
        withTag: jest.fn().mockReturnThis(),
    };
    return {
        Logger: { for: jest.fn().mockReturnValue(mockLogger), root: { emit: jest.fn() } },
        ILogger: jest.fn(),
        LoggerChild: jest.fn().mockImplementation(() => mockLogger),
    };
});

import { doValidate, bootstrapValidators } from '@/validation';

bootstrapValidators();

describe('String Includes/Excludes Processor', () => {
    describe('StringIncludesProcessor', () => {
        it('值在 includes 列表中时通过', async () => {
            const result = await doValidate('red', {
                type: 'string',
                includes: ['red', 'green', 'blue'],
            });
            expect(result.isValid).toBe(true);
        });

        it('值不在 includes 列表中时报错', async () => {
            const result = await doValidate('yellow', {
                type: 'string',
                includes: ['red', 'green', 'blue'],
            });
            expect(result.isValid).toBe(false);
        });

        it('includes 为函数时调用函数获取列表', async () => {
            const getColors = jest.fn().mockReturnValue(['red', 'green', 'blue']);
            const result = await doValidate('red', {
                type: 'string',
                includes: getColors,
            });
            expect(result.isValid).toBe(true);
            expect(getColors).toHaveBeenCalled();
        });

        it('includes 为 undefined 时跳过', async () => {
            const result = await doValidate('anything', {
                type: 'string',
                includes: undefined,
            });
            expect(result.isValid).toBe(true);
        });

        it('includes 返回非数组时跳过', async () => {
            const result = await doValidate('anything', {
                type: 'string',
                includes: 'not-an-array' as any,
            });
            expect(result.isValid).toBe(true);
        });
    });

    describe('StringExcludesProcessor', () => {
        it('值不在 excludes 列表中时通过', async () => {
            const result = await doValidate('yellow', {
                type: 'string',
                excludes: ['red', 'green', 'blue'],
            });
            expect(result.isValid).toBe(true);
        });

        it('值在 excludes 列表中时报错', async () => {
            const result = await doValidate('red', {
                type: 'string',
                excludes: ['red', 'green', 'blue'],
            });
            expect(result.isValid).toBe(false);
        });

        it('excludes 为函数时调用函数获取列表', async () => {
            const getForbidden = jest.fn().mockReturnValue(['admin', 'root']);
            const result = await doValidate('admin', {
                type: 'string',
                excludes: getForbidden,
            });
            expect(result.isValid).toBe(false);
            expect(getForbidden).toHaveBeenCalled();
        });

        it('excludes 为 undefined 时跳过', async () => {
            const result = await doValidate('anything', {
                type: 'string',
                excludes: undefined,
            });
            expect(result.isValid).toBe(true);
        });

        it('excludes 返回非数组时跳过', async () => {
            const result = await doValidate('anything', {
                type: 'string',
                excludes: 'not-an-array' as any,
            });
            expect(result.isValid).toBe(true);
        });
    });
});
