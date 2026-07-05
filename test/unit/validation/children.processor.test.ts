/**
 * ArrayChildrenProcessor 单元测试
 *
 * 覆盖：
 * 1. 无 itemRule 或非数组时跳过
 * 2. allowEmptyItem 跳过空项
 * 3. 自定义校验函数（路径 A）
 * 4. 标准规则递归（路径 B）
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
            })),
        },
    };
});

jest.mock('@/validation/core', () => ({
    doValidate: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
}));

import { ArrayChildrenProcessor } from '@/validation/processors/array/children';
import { doValidate } from '@/validation/core';

describe('ArrayChildrenProcessor', () => {
    const mockDoValidate = doValidate as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('无 itemRule 时应直接返回', async () => {
        const context: any = {
            value: [1, 2, 3],
            rule: { type: 'array' },
            path: 'root',
            errors: [],
        };

        await ArrayChildrenProcessor(context);
        expect(mockDoValidate).not.toHaveBeenCalled();
    });

    it('value 非数组时应直接返回', async () => {
        const context: any = {
            value: 'not-array',
            rule: { type: 'array', itemRule: { type: 'string' } },
            path: 'root',
            errors: [],
        };

        await ArrayChildrenProcessor(context);
        expect(mockDoValidate).not.toHaveBeenCalled();
    });

    it('allowEmptyItem 时应跳过 null/undefined/空字符串', async () => {
        const context: any = {
            value: [null, undefined, '', 'valid'],
            rule: { type: 'array', itemRule: { type: 'string' }, allowEmptyItem: true },
            path: 'root',
            errors: [],
        };

        await ArrayChildrenProcessor(context);

        // 只有 'valid' 走 doValidate
        expect(mockDoValidate).toHaveBeenCalledTimes(1);
        expect(mockDoValidate).toHaveBeenCalledWith('valid', { type: 'string' }, expect.anything());
    });

    it('自定义校验函数返回 true 时不应添加错误', async () => {
        const customValidator = jest.fn().mockResolvedValue(true);
        const context: any = {
            value: ['item1'],
            rule: { type: 'array', itemRule: customValidator },
            path: 'root',
            errors: [],
        };

        await ArrayChildrenProcessor(context);

        expect(customValidator).toHaveBeenCalled();
        expect(context.errors.length).toBe(0);
    });

    it('自定义校验函数返回非 true/null 时应添加错误', async () => {
        const customValidator = jest.fn().mockResolvedValue('invalid_item');
        const context: any = {
            value: ['bad'],
            rule: { type: 'array', itemRule: customValidator },
            path: 'root',
            errors: [],
        };

        await ArrayChildrenProcessor(context);

        expect(context.errors.length).toBe(1);
        expect(context.errors[0].code).toBe('VALIDATION_INVALID_VALUE');
    });

    it('自定义校验函数返回 null 时不应添加错误', async () => {
        const customValidator = jest.fn().mockResolvedValue(null);
        const context: any = {
            value: ['ok'],
            rule: { type: 'array', itemRule: customValidator },
            path: 'root',
            errors: [],
        };

        await ArrayChildrenProcessor(context);

        expect(context.errors.length).toBe(0);
    });

    it('标准规则应递归调用 doValidate', async () => {
        const context: any = {
            value: ['a', 'b'],
            rule: { type: 'array', itemRule: { type: 'string' } },
            path: 'root',
            errors: [],
        };

        await ArrayChildrenProcessor(context);

        expect(mockDoValidate).toHaveBeenCalledTimes(2);
        expect(mockDoValidate).toHaveBeenCalledWith(
            'a',
            { type: 'string' },
            expect.objectContaining({ path: 'root[0]' })
        );
        expect(mockDoValidate).toHaveBeenCalledWith(
            'b',
            { type: 'string' },
            expect.objectContaining({ path: 'root[1]' })
        );
    });
});
