/**
 * TipsComponent 单元测试
 *
 * 覆盖：构造函数、type、内容属性（default）、open/close、dispose
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

import { TipsComponent } from '@/component/tips/TipsComponent';

describe('TipsComponent', () => {

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el', () => {
            const tips = new TipsComponent() as any;
            expect(tips.el).toBeInstanceOf(HTMLElement);
        });

        it('type 为 tips', () => {
            const tips = new TipsComponent() as any;
            expect(tips.type).toBe('tips');
        });
    });

    // ============================================
    // 内容属性（withTemplate 自动生成）
    // ============================================

    describe('内容属性', () => {
        it('default getter/setter', () => {
            const tips = new TipsComponent() as any;
            tips.default = 'Hello World';
            expect(tips.default).toBe('Hello World');
        });
    });

    // ============================================
    // open / close
    // ============================================

    describe('open / close', () => {
        it('open 设置 display 为空', () => {
            const tips = new TipsComponent() as any;
            tips.initOverlayHost();
            tips.open();
            expect(tips.el.style.display).toBe('');
        });

        it('close 设置 display 为 none', () => {
            const tips = new TipsComponent() as any;
            tips.initOverlayHost();
            tips.open();
            tips.close();
            expect(tips.el.style.display).toBe('none');
        });

        it('open 设置 zIndex', () => {
            const tips = new TipsComponent() as any;
            tips.initOverlayHost();
            tips.open();
            expect(tips.el.style.zIndex).not.toBe('');
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const tips = new TipsComponent() as any;
            container.appendChild(tips.el);
            expect(container.contains(tips.el)).toBe(true);
            tips.dispose();
            expect(document.contains(tips.el)).toBe(false);
            container.remove();
        });
    });
});
