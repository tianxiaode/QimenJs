/**
 * RuleAlignmentProcessor 单元测试
 *
 * 覆盖：
 * 1. file 类型规则对齐（minFiles、allowedTypes、allowedExtensions）
 * 2. password 类型规则对齐（从 SystemRegistrar 获取全局配置）
 * 3. 其他类型不处理
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

jest.mock('@orbit-js/registry', () => ({
    SystemRegistrar: {
        getInstance: jest.fn(),
    },
}));

import { RuleAlignmentProcessor } from '@/validation/processors/common/rule-align';
import { SystemRegistrar } from '@orbit-js/registry';

describe('RuleAlignmentProcessor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('file 类型', () => {
        it('minFiles 未设置时应设为 1', async () => {
            const context: any = {
                value: [],
                rule: { type: 'file' },
                path: 'root',
                errors: [],
            };

            await RuleAlignmentProcessor(context);

            expect(context.rule.minFiles).toBe(1);
        });

        it('minFiles 为 0 时应设为 1', async () => {
            const context: any = {
                value: [],
                rule: { type: 'file', minFiles: 0 },
                path: 'root',
                errors: [],
            };

            await RuleAlignmentProcessor(context);

            expect(context.rule.minFiles).toBe(1);
        });

        it('minFiles 大于 0 时不应修改', async () => {
            const context: any = {
                value: [],
                rule: { type: 'file', minFiles: 3 },
                path: 'root',
                errors: [],
            };

            await RuleAlignmentProcessor(context);

            expect(context.rule.minFiles).toBe(3);
        });

        it('allowedTypes 和 allowedExtensions 未设置时应设为空数组', async () => {
            const context: any = {
                value: [],
                rule: { type: 'file' },
                path: 'root',
                errors: [],
            };

            await RuleAlignmentProcessor(context);

            expect(context.rule.allowedTypes).toEqual([]);
            expect(context.rule.allowedExtensions).toEqual([]);
        });

        it('allowedTypes 和 allowedExtensions 已设置时不应覆盖', async () => {
            const context: any = {
                value: [],
                rule: { type: 'file', allowedTypes: ['image/*'], allowedExtensions: ['.png'] },
                path: 'root',
                errors: [],
            };

            await RuleAlignmentProcessor(context);

            expect(context.rule.allowedTypes).toEqual(['image/*']);
            expect(context.rule.allowedExtensions).toEqual(['.png']);
        });
    });

    describe('password 类型', () => {
        it('应从 SystemRegistrar 获取全局配置并覆盖 rule', async () => {
            const mockConfig = {
                minLength: 8,
                maxLength: 32,
                uppercase: true,
                lowercase: true,
                digit: true,
                specialChar: false,
            };
            (SystemRegistrar.getInstance as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue(mockConfig),
            });

            const context: any = {
                value: 'test',
                rule: { type: 'password' },
                path: 'root',
                errors: [],
            };

            await RuleAlignmentProcessor(context);

            expect(context.rule.minLength).toBe(8);
            expect(context.rule.maxLength).toBe(32);
            expect(context.rule.uppercase).toBe(true);
            expect(context.rule.lowercase).toBe(true);
            expect(context.rule.digit).toBe(true);
            expect(context.rule.specialChar).toBe(false);
        });
    });

    describe('其他类型', () => {
        it('不应修改 rule', async () => {
            const context: any = {
                value: 'test',
                rule: { type: 'string' },
                path: 'root',
                errors: [],
            };

            await RuleAlignmentProcessor(context);

            expect(context.rule).toEqual({ type: 'string' });
        });
    });
});
