/**
 * TooltipAbility 单元测试
 *
 * 覆盖：getTooltip/setTooltip、initTooltipOverlay、cleanup
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

import { TemplateComponent } from '@/component-core';
import { OverlayAbility } from '@/component-core/abilities/OverlayAbility';
import { TooltipAbility } from '@/component-core/abilities/TooltipAbility';
import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';

const TPL = '<div class="box"><span data-content="box:label"></span></div>';
const TIPS_TPL = '<div class="q-tips"><span data-content="tips:text"></span></div>';

describe('TooltipAbility', () => {
    // TooltipAbility 依赖 OverlayAbility 的 createOverlay
    const BoxClass = TemplateComponent.withTemplate(TPL).with([OverlayAbility, TooltipAbility]);

    const TipsClass = TemplateComponent.withTemplate(TIPS_TPL).with([]);

    let registrar: ComponentRegistrar;

    beforeEach(() => {
        registrar = ComponentRegistrar.getInstance();
        registrar.register('Tips', TipsClass as any);
    });

    afterEach(() => {
        try { registrar.unregister('Tips'); } catch {}
    });

    // ============================================
    // getTooltip / setTooltip
    // ============================================

    describe('getTooltip / setTooltip', () => {
        it('有默认值的 key 返回默认值', () => {
            const instance = new BoxClass() as any;
            expect(instance.getTooltip('tooltipPlacement')).toBe('top');
            expect(instance.getTooltip('tooltipOffset')).toBe(4);
            expect(instance.getTooltip('tooltipShowDelay')).toBe(0);
            expect(instance.getTooltip('tooltipHideDelay')).toBe(0);
            expect(instance.getTooltip('tooltipType')).toBe('Tips');
        });

        it('无默认值的 key 返回 props 值', () => {
            const instance = new BoxClass() as any;
            expect(instance.getTooltip('tooltip')).toBeUndefined();
        });

        it('setTooltip 设置值', () => {
            const instance = new BoxClass() as any;
            instance.setTooltip('tooltip', 'Hello');
            expect(instance.getTooltip('tooltip')).toBe('Hello');
        });

        it('setTooltip 覆盖默认值', () => {
            const instance = new BoxClass() as any;
            instance.setTooltip('tooltipPlacement', 'bottom');
            expect(instance.getTooltip('tooltipPlacement')).toBe('bottom');
        });
    });

    // ============================================
    // initTooltipOverlay
    // ============================================

    describe('initTooltipOverlay', () => {
        it('创建 tooltip 浮层并生成委托方法', () => {
            const instance = new BoxClass() as any;
            instance.initTooltipOverlay({ tooltip: 'Hello' });
            expect(typeof instance.openTips).toBe('function');
            expect(typeof instance.closeTips).toBe('function');
        });

        it('自定义 tooltipType', () => {
            const CustomTips = TemplateComponent.withTemplate('<div class="custom-tips"></div>').with([]);
            registrar.register('CustomTips', CustomTips as any);

            const instance = new BoxClass() as any;
            instance.initTooltipOverlay({ tooltip: 'Hello', tooltipType: 'CustomTips' });
            expect(typeof instance.openTips).toBe('function');

            registrar.unregister('CustomTips');
        });

        it('tooltipType 对应类不存在 → 不报错', () => {
            const instance = new BoxClass() as any;
            expect(() => {
                instance.initTooltipOverlay({ tooltip: 'Hello', tooltipType: 'NonExistent' });
            }).not.toThrow();
        });

        it('showDelay / hideDelay 配置', () => {
            const instance = new BoxClass() as any;
            instance.initTooltipOverlay({
                tooltip: 'Hello',
                tooltipShowDelay: 100,
                tooltipHideDelay: 200,
            });
            expect(typeof instance.openTips).toBe('function');
        });

        it('tooltipType 为默认 Tips 时不传 typeOverride', () => {
            const instance = new BoxClass() as any;
            instance.initTooltipOverlay({ tooltip: 'Hello', tooltipType: 'Tips' });
            expect(typeof instance.openTips).toBe('function');
        });
    });

    // ============================================
    // cleanup
    // ============================================

    describe('cleanup', () => {
        it('dispose 时清理 tooltip 浮层', () => {
            const instance = new BoxClass() as any;
            instance.initTooltipOverlay({ tooltip: 'Hello' });
            expect(typeof instance.openTips).toBe('function');
            instance.dispose();
            expect((instance as any).openTips).toBeUndefined();
            expect((instance as any).closeTips).toBeUndefined();
        });
    });
});
