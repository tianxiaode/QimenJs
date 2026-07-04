/**
 * FormatProcessor 单元测试
 *
 * 覆盖：
 * 1. format 存在但注册器中找不到时应添加错误
 * 2. format 存在且注册器中找到时应调用 validatePattern
 * 3. 无 format 和 pattern 时应添加错误
 * 4. 有 pattern 时应调用 validatePattern
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            }))
        }
    };
});

jest.mock('@orbitjs/pattern', () => ({
    PatternRegistrar: {
        getInstance: jest.fn(),
    },
}));

jest.mock('@/validation/utils', () => ({
    validatePattern: jest.fn().mockReturnValue(true),
}));

import { FormatProcessor } from '@/validation/processors/format/format';
import { PatternRegistrar } from '@orbitjs/pattern';
import { validatePattern } from '@/validation/utils';

describe('FormatProcessor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('format 存在且注册器中找到时应调用 validatePattern', async () => {
        const mockRegex = /^[a-z]+$/;
        (PatternRegistrar.getInstance as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(mockRegex),
        });

        const context: any = {
            value: 'hello',
            rule: { format: 'lowercase' },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await FormatProcessor(context);

        expect(validatePattern).toHaveBeenCalledWith('hello', mockRegex, context, 'lowercase');
    });

    it('format 存在但注册器中找不到时应添加错误和 metadata', async () => {
        (PatternRegistrar.getInstance as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(null),
        });

        const context: any = {
            value: 'test',
            rule: { format: 'unknown_format' },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await FormatProcessor(context);

        expect(context.errors.length).toBe(1);
        expect(context.errors[0].code).toBe('VALIDATION_INVALID_FORMAT');
        expect(context.metadata.missingRegistrar).toBe('unknown_format');
        expect(context.metadata.warning).toContain('unknown_format');
    });

    it('无 format 和 pattern 时应添加错误', async () => {
        const context: any = {
            value: 'test',
            rule: { type: 'string' },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await FormatProcessor(context);

        expect(context.errors.length).toBe(1);
        expect(context.errors[0].code).toBe('VALIDATION_INVALID_FORMAT');
    });

    it('有 pattern 时应调用 validatePattern', async () => {
        const mockPattern = /^[0-9]+$/;
        const context: any = {
            value: '123',
            rule: { pattern: mockPattern },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await FormatProcessor(context);

        expect(validatePattern).toHaveBeenCalledWith('123', mockPattern, context, mockPattern.toString());
    });
});
