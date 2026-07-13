/**
 * TipsComponent 单元测试
 *
 * 覆盖：构造函数、type、内容属性（default）、open/close、dispose、ArrowAbility 集成
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
import { ArrowAbility } from '@/component-abilities/render/ArrowAbility';

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
    // ArrowAbility 集成
    // ============================================

    describe('ArrowAbility 集成', () => {
        const TipsWithArrow = (TipsComponent as any).with(ArrowAbility);

        it('_initTips 调用 initArrow', () => {
            const tips = new TipsWithArrow() as any;
            const anchor = document.createElement('div');
            document.body.appendChild(anchor);

            tips._initTips({ anchor, tooltip: 'test' });
            expect(tips._arrowEl).not.toBeNull();
            expect(tips._arrowEl.classList.contains('q-arrow')).toBe(true);

            anchor.remove();
            tips.dispose();
        });

        it('tooltipArrow=false 时箭头隐藏', () => {
            const tips = new TipsWithArrow() as any;
            const anchor = document.createElement('div');
            document.body.appendChild(anchor);

            tips._initTips({ anchor, tooltip: 'test', tooltipArrow: false });
            expect(tips._arrowVisible).toBe(false);
            expect(tips._arrowEl.style.display).toBe('none');

            anchor.remove();
            tips.dispose();
        });

        it('open 时箭头方向由 OverlayHostAbility 自动联动', () => {
            const tips = new TipsWithArrow() as any;
            const anchor = document.createElement('div');
            // mock getBoundingClientRect 使 top 方向不超出视口
            anchor.getBoundingClientRect = () => ({
                left: 200, top: 200, width: 100, height: 40,
                right: 300, bottom: 240, x: 200, y: 200,
                toJSON: () => ({}),
            } as DOMRect);
            tips.el.getBoundingClientRect = () => ({
                left: 0, top: 0, width: 80, height: 30,
                right: 80, bottom: 30, x: 0, y: 0,
                toJSON: () => ({}),
            } as DOMRect);
            document.body.appendChild(anchor);
            document.body.appendChild(tips.el);

            tips._initTips({ anchor, tooltip: 'test', tooltipPlacement: 'top' });
            tips.open();
            expect(tips._arrowEl.classList.contains('q-arrow--top')).toBe(true);

            anchor.remove();
            tips.dispose();
        });

        it('无 ArrowAbility 时 _initTips 不报错', () => {
            const tips = new TipsComponent() as any;
            const anchor = document.createElement('div');
            document.body.appendChild(anchor);

            expect(() => tips._initTips({ anchor, tooltip: 'test' })).not.toThrow();

            anchor.remove();
            tips.dispose();
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
