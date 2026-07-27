/**
 * ButtonComponent 单元测试
 *
 * 覆盖：构造函数、内容属性（text/textHidden、icon/iconHidden）、type、dispose
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

import { ButtonComponent } from '@/component/button/ButtonComponent';

describe('ButtonComponent', () => {
    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el', () => {
            const btn = ButtonComponent.create() as any;
            expect(btn.el).toBeInstanceOf(HTMLElement);
        });

        it('type 为 Button', () => {
            const btn = ButtonComponent.create() as any;
            expect(btn.type).toBe('Button');
        });
    });

    // ============================================
    // 内容属性（withTemplate 自动生成）
    // ============================================

    describe('内容属性', () => {
        it('text getter/setter', () => {
            const btn = ButtonComponent.create() as any;
            btn.text = 'Submit';
            expect(btn.text).toBe('Submit');
        });

        it('textHidden getter/setter', () => {
            const btn = ButtonComponent.create() as any;
            btn.textHidden = true;
            expect(btn.textHidden).toBe(true);
        });

        it('icon getter/setter', () => {
            const btn = ButtonComponent.create() as any;
            btn.icon = '🔍';
            expect(btn.icon).toBe('🔍');
        });

        it('iconHidden getter/setter', () => {
            const btn = ButtonComponent.create() as any;
            btn.iconHidden = true;
            expect(btn.iconHidden).toBe(true);
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const btn = ButtonComponent.create() as any;
            container.appendChild(btn.el);
            expect(container.contains(btn.el)).toBe(true);
            btn.dispose();
            expect(document.contains(btn.el)).toBe(false);
            container.remove();
        });
    });
});
