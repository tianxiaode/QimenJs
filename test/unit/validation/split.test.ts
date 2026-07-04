/**
 * SplitProcessor 测试
 *
 * 覆盖：
 * 1. 基本拆分逻辑
 * 2. trim 清洗
 * 3. 空项校验
 * 4. 子项规则验证
 * 5. 边界条件（非字符串、无 separator）
 */

jest.mock('@qimenjs/logger', () => {
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

import { doValidate, ValidatorRegistrar, bootstrapValidators } from '@/validation';

// 启动验证器
bootstrapValidators();

describe('SplitProcessor', () => {
    describe('基本拆分', () => {
        it('按 separator 拆分字符串', async () => {
            const result = await doValidate('a,b,c', {
                type: 'split',
                separator: ',',
            });
            expect(result.isValid).toBe(true);
        });

        it('非字符串值时由管道其他处理器报错', async () => {
            // SplitProcessor 跳过非字符串，但 common/presence 处理器可能报错
            const result = await doValidate(123 as any, {
                type: 'split',
                separator: ',',
            });
            // 非字符串值在 split 管道中会因类型不匹配而失败
            expect(result.isValid).toBe(false);
        });

        it('无 separator 直接跳过', async () => {
            const result = await doValidate('a,b,c', {
                type: 'split',
            } as any);
            expect(result.isValid).toBe(true);
        });
    });

    describe('trim 清洗', () => {
        it('rule.trim = true 时去除每项空格', async () => {
            const result = await doValidate(' a , b , c ', {
                type: 'split',
                separator: ',',
                trim: true,
            });
            expect(result.isValid).toBe(true);
        });
    });

    describe('空项校验', () => {
        it('allowEmptyItem = false 时拒绝空项', async () => {
            const result = await doValidate('a,,c', {
                type: 'split',
                separator: ',',
                allowEmptyItem: false,
            });
            expect(result.isValid).toBe(false);
        });

        it('allowEmptyItem = true 时允许空项', async () => {
            const result = await doValidate('a,,c', {
                type: 'split',
                separator: ',',
                allowEmptyItem: true,
            });
            expect(result.isValid).toBe(true);
        });

        it('allErrors = false 时空项错误后提前返回', async () => {
            const result = await doValidate('a,,c', {
                type: 'split',
                separator: ',',
                allowEmptyItem: false,
                allErrors: false,
            });
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBe(1);
        });
    });

    describe('子项规则验证', () => {
        it('itemRule 验证每个子项（子项不满足规则时报错）', async () => {
            const result = await doValidate('a,123,c', {
                type: 'split',
                separator: ',',
                itemRule: { type: 'string', min: 2 },
            });
            expect(result.isValid).toBe(false);
        });

        it('无 itemRule 时只做拆分和空项校验', async () => {
            const result = await doValidate('hello,world', {
                type: 'split',
                separator: ',',
            });
            expect(result.isValid).toBe(true);
        });
    });
});
