/**
 * ObjectPropertiesProcessor 单元测试
 *
 * 覆盖：
 * 1. 无 properties 时跳过
 * 2. 自定义校验函数（路径 A）
 * 3. 标准规则递归（路径 B）
 * 4. path 拼接
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

import { ObjectPropertiesProcessor } from '@/validation/processors/object/properties';
import { doValidate } from '@/validation/core';
import type { ValidationContext } from '@/validation/types';

// Mock doValidate 以避免完整验证管道
jest.mock('@/validation/core', () => ({
    doValidate: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
}));

describe('ObjectPropertiesProcessor', () => {
    const mockDoValidate = doValidate as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rule 无 properties 时应直接返回', async () => {
        const context: any = {
            value: { name: 'test' },
            rule: { type: 'object' },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await ObjectPropertiesProcessor(context);

        expect(context.errors.length).toBe(0);
        expect(mockDoValidate).not.toHaveBeenCalled();
    });

    it('自定义校验函数返回 true 时不应添加错误', async () => {
        const customValidator = jest.fn().mockResolvedValue(true);
        const context: any = {
            value: { name: 'valid' },
            rule: {
                type: 'object',
                properties: {
                    name: customValidator,
                },
            },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await ObjectPropertiesProcessor(context);

        expect(customValidator).toHaveBeenCalledWith('valid', 'name', { name: 'valid' }, context);
        expect(context.errors.length).toBe(0);
    });

    it('自定义校验函数返回非 true/null 时应添加错误', async () => {
        const customValidator = jest.fn().mockResolvedValue('invalid_name');
        const context: any = {
            value: { name: 'bad' },
            rule: {
                type: 'object',
                properties: {
                    name: customValidator,
                },
            },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await ObjectPropertiesProcessor(context);

        expect(context.errors.length).toBe(1);
        expect(context.errors[0].code).toBe('VALIDATION_INVALID_VALUE');
    });

    it('自定义校验函数返回 null 时不应添加错误', async () => {
        const customValidator = jest.fn().mockResolvedValue(null);
        const context: any = {
            value: { name: 'ok' },
            rule: {
                type: 'object',
                properties: {
                    name: customValidator,
                },
            },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await ObjectPropertiesProcessor(context);

        expect(context.errors.length).toBe(0);
    });

    it('标准规则应递归调用 doValidate', async () => {
        const context: any = {
            value: { age: 25 },
            rule: {
                type: 'object',
                properties: {
                    age: { type: 'number', min: 0 },
                },
            },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await ObjectPropertiesProcessor(context);

        expect(mockDoValidate).toHaveBeenCalledWith(
            25,
            { type: 'number', min: 0 },
            expect.objectContaining({
                path: 'root.age',
                terminate: false,
            })
        );
    });

    it('path 为空时应使用 key 作为 childPath', async () => {
        const context: any = {
            value: { name: 'test' },
            rule: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                },
            },
            path: '',
            errors: [],
            metadata: {},
        };

        await ObjectPropertiesProcessor(context);

        expect(mockDoValidate).toHaveBeenCalledWith(
            'test',
            { type: 'string' },
            expect.objectContaining({
                path: 'name',
            })
        );
    });

    it('多个属性应并行校验', async () => {
        const context: any = {
            value: { name: 'test', age: 25 },
            rule: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' },
                },
            },
            path: 'root',
            errors: [],
            metadata: {},
        };

        await ObjectPropertiesProcessor(context);

        expect(mockDoValidate).toHaveBeenCalledTimes(2);
    });
});
