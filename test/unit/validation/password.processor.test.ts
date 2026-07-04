/**
 * PasswordProcessor 独立单元测试
 *
 * 验证密码模式校验处理器的核心行为：
 * 1. uppercase / lowercase / digit / specialChar 规则
 * 2. 多规则组合
 * 3. 所有规则满足时无错误
 */

jest.mock('@orbit-js/pattern', () => ({
    PatternRegistrar: {
        getInstance: jest.fn(() => ({
            get: jest.fn((name: string) => {
                const patterns: Record<string, RegExp> = {
                    uppercase: /[A-Z]/,
                    lowercase: /[a-z]/,
                    digit: /\d/,
                    specialChar: /[!@#$%^&*]/,
                };
                return patterns[name] || null;
            }),
        })),
    },
}));

import { PasswordProcessor } from '@/validation/processors/password/password';
import { ValidationPatternType } from '@/validation/types';
import type { ValidationContext } from '@/validation/types';

// ============================================
// 辅助
// ============================================

function createContext(value: any, rule: any): ValidationContext {
    return {
        value,
        rawValue: value,
        rule: { ...rule },
        errors: [],
        status: {
            isUndefined: false,
            isNull: false,
            isNaN: false,
            isEmpty: false,
            isModified: false,
        },
    } as any;
}

// ============================================
// 测试
// ============================================

describe('PasswordProcessor', () => {
    it('启用 uppercase 规则时，无大写字母应报错', async () => {
        const ctx = createContext('abcdef', { [ValidationPatternType.UPPERCASE]: true });
        await PasswordProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThan(0);
    });

    it('启用 lowercase 规则时，无小写字母应报错', async () => {
        const ctx = createContext('ABCDEF', { [ValidationPatternType.LOWERCASE]: true });
        await PasswordProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThan(0);
    });

    it('启用 digit 规则时，无数字应报错', async () => {
        const ctx = createContext('abcdef', { [ValidationPatternType.DIGIT]: true });
        await PasswordProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThan(0);
    });

    it('启用 specialChar 规则时，无特殊字符应报错', async () => {
        const ctx = createContext('abcdef', { [ValidationPatternType.SPECIAL_CHAR]: true });
        await PasswordProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThan(0);
    });

    it('同时启用多个规则时，不满足的规则应逐一报错', async () => {
        const ctx = createContext('abcdef', {
            [ValidationPatternType.UPPERCASE]: true,
            [ValidationPatternType.DIGIT]: true,
            [ValidationPatternType.SPECIAL_CHAR]: true,
        });
        await PasswordProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThanOrEqual(3);
    });

    it('所有规则都满足时，不应报错', async () => {
        const ctx = createContext('Abc123!', {
            [ValidationPatternType.UPPERCASE]: true,
            [ValidationPatternType.LOWERCASE]: true,
            [ValidationPatternType.DIGIT]: true,
            [ValidationPatternType.SPECIAL_CHAR]: true,
        });
        await PasswordProcessor(ctx);
        expect(ctx.errors.length).toBe(0);
    });

    it('未启用任何规则时，不应报错', async () => {
        const ctx = createContext('abcdef', {});
        await PasswordProcessor(ctx);
        expect(ctx.errors.length).toBe(0);
    });
});
