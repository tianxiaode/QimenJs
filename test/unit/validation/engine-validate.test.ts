/**
 * validation/engine/validate 测试
 *
 * 验证 validate/normalize/assert 糖函数
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
        Logger: {
            for: jest.fn().mockReturnValue(mockLogger),
            root: { emit: jest.fn() },
        },
        ILogger: jest.fn(),
        LoggerChild: jest.fn().mockImplementation(() => mockLogger),
    };
});

import { validate, normalize, assert } from '@/validation/engine/validate';
import { bootstrapValidators } from '@/validation';
import '@orbit-js/pattern';

// Bootstrap validators (patterns auto-registered by @orbit-js/pattern)
bootstrapValidators();

describe('validate sugar functions', () => {
    describe('validate.string', () => {
        it('should validate string type', async () => {
            const result = await validate.string('hello', {});
            expect(result).toBeNull();
        });

        it('should return errors for invalid string', async () => {
            const result = await validate.string(123, {});
            expect(result).not.toBeNull();
        });
    });

    describe('validate.number', () => {
        it('should validate number type', async () => {
            const result = await validate.number(42, {});
            expect(result).toBeNull();
        });
    });

    describe('validate.split', () => {
        it('should validate split type', async () => {
            const result = await validate.split('a,b,c', {});
            expect(result).toBeNull();
        });
    });

    describe('validate.format', () => {
        it('should validate format type', async () => {
            const result = await validate.format('test@example.com', { format: 'email' });
            expect(result).toBeNull();
        });
    });

    describe('validate (generic)', () => {
        it('should validate with raw rule', async () => {
            const result = await validate.validate('hello', { type: 'string' });
            expect(result).toBeNull();
        });
    });

    describe('normalize', () => {
        it('should return value when valid', async () => {
            const result = await normalize.string('hello', 'default', {});
            expect(result).toBe('hello');
        });

        it('should return default when required and invalid', async () => {
            const result = await normalize.string(123, 'default', { required: true });
            expect(result).toBe('default');
        });

        it('should return value when not required and invalid', async () => {
            const result = await normalize.string(123, 'default', {});
            expect(result).toBe(123);
        });
    });

    describe('assert', () => {
        it('should not throw for valid value', async () => {
            const result = await assert.string('hello', {});
            expect(result).toBeNull();
        });

        it('should throw for invalid value', async () => {
            await expect(assert.string(123, {})).rejects.toThrow();
        });
    });
});
