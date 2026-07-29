/**
 * TooltipComponent 单元测试
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
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { TooltipComponent } from '@/component/tooltip/TooltipComponent';
import { ArrowAbility } from '@/component-abilities/render/ArrowAbility';

describe('TooltipComponent', () => {
    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el', () => {
            const tooltip = new TooltipComponent() as any;
            expect(tooltip.el).toBeInstanceOf(HTMLElement);
        });

        it('type 为 Tooltip', () => {
            const tooltip = new TooltipComponent() as any;
            expect(tooltip.type).toBe('Tooltip');
        });
    });

    // ============================================
    // 内容属性（withTemplate 自动生成）
    // ============================================

    describe('内容属性', () => {
        it('default getter/setter', () => {
            const tooltip = new TooltipComponent() as any;
            tooltip.default = 'Hello World';
            expect(tooltip.default).toBe('Hello World');
        });
    });

    // ============================================
    // open / close
    // ============================================

    describe('open / close', () => {
        it('open 设置 display 为空', () => {
            const tooltip = new TooltipComponent() as any;
            tooltip.initOverlayHost();
            tooltip.open();
            expect(tooltip.el.style.display).toBe('');
        });

        it('close 设置 display 为 none', () => {
            const tooltip = new TooltipComponent() as any;
            tooltip.initOverlayHost();
            tooltip.open();
            tooltip.close();
            expect(tooltip.el.style.display).toBe('none');
        });

        it('open 设置 zIndex', () => {
            const tooltip = new TooltipComponent() as any;
            tooltip.initOverlayHost();
            tooltip.open();
            expect(tooltip.el.style.zIndex).not.toBe('');
        });
    });

    // ============================================
    // ArrowAbility 集成
    // ============================================

    describe('ArrowAbility 集成', () => {
        const TooltipWithArrow = (TooltipComponent as any).with([ArrowAbility]);

        it('_initTooltip 调用 initArrow', () => {
            const tooltip = new TooltipWithArrow() as any;
            const anchor = document.createElement('div');
            document.body.appendChild(anchor);

            tooltip._initTooltip({ anchor, tooltip: 'test' });
            expect(tooltip._arrowEl).not.toBeNull();
            expect(tooltip._arrowEl.classList.contains('q-arrow')).toBe(true);

            anchor.remove();
            tooltip.dispose();
        });

        it('tooltipArrow=false 时箭头隐藏', () => {
            const tooltip = new TooltipWithArrow() as any;
            const anchor = document.createElement('div');
            document.body.appendChild(anchor);

            tooltip._initTooltip({ anchor, tooltip: 'test', tooltipArrow: false });
            expect(tooltip._arrowVisible).toBe(false);
            expect(tooltip._arrowEl.style.display).toBe('none');

            anchor.remove();
            tooltip.dispose();
        });

        it('open 时箭头方向由 OverlayHostAbility 自动联动', () => {
            const tooltip = new TooltipWithArrow() as any;
            const anchor = document.createElement('div');
            // mock getBoundingClientRect 使 top 方向不超出视口
            anchor.getBoundingClientRect = () =>
                ({
                    left: 200,
                    top: 200,
                    width: 100,
                    height: 40,
                    right: 300,
                    bottom: 240,
                    x: 200,
                    y: 200,
                    toJSON: () => ({}),
                }) as DOMRect;
            tooltip.el.getBoundingClientRect = () =>
                ({
                    left: 0,
                    top: 0,
                    width: 80,
                    height: 30,
                    right: 80,
                    bottom: 30,
                    x: 0,
                    y: 0,
                    toJSON: () => ({}),
                }) as DOMRect;
            document.body.appendChild(anchor);
            document.body.appendChild(tooltip.el);

            tooltip._initTooltip({ anchor, tooltip: 'test', tooltipPlacement: 'top' });
            tooltip.open();
            expect(tooltip._arrowEl.classList.contains('q-arrow--top')).toBe(true);

            anchor.remove();
            tooltip.dispose();
        });

        it('无 ArrowAbility 时 _initTooltip 不报错', () => {
            const tooltip = new TooltipComponent() as any;
            const anchor = document.createElement('div');
            document.body.appendChild(anchor);

            expect(() => tooltip._initTooltip({ anchor, tooltip: 'test' })).not.toThrow();

            anchor.remove();
            tooltip.dispose();
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const tooltip = new TooltipComponent() as any;
            container.appendChild(tooltip.el);
            expect(container.contains(tooltip.el)).toBe(true);
            tooltip.dispose();
            expect(document.contains(tooltip.el)).toBe(false);
            container.remove();
        });
    });
});
