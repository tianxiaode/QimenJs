/**
 * BadgeComponent 单元测试
 *
 * 覆盖：构造函数、内容属性（default/defaultHidden）、type、dispose
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(),
            })),
        },
    };
});

import { BadgeComponent } from '@/component/badge/BadgeComponent';

describe('BadgeComponent', () => {

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el', () => {
            const badge = new BadgeComponent() as any;
            expect(badge.el).toBeInstanceOf(HTMLElement);
        });

        it('type 为 badge', () => {
            const badge = new BadgeComponent() as any;
            expect(badge.type).toBe('badge');
        });
    });

    // ============================================
    // 内容属性（withTemplate 自动生成）
    // ============================================

    describe('内容属性', () => {
        it('default getter/setter', () => {
            const badge = new BadgeComponent() as any;
            badge.default = '99+';
            expect(badge.default).toBe('99+');
        });

        it('defaultHidden getter/setter', () => {
            const badge = new BadgeComponent() as any;
            badge.defaultHidden = true;
            expect(badge.defaultHidden).toBe(true);
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const badge = new BadgeComponent() as any;
            container.appendChild(badge.el);
            expect(container.contains(badge.el)).toBe(true);
            badge.dispose();
            expect(document.contains(badge.el)).toBe(false);
            container.remove();
        });
    });
});
