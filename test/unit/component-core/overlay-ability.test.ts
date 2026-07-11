/**
 * OverlayAbility 单元测试
 *
 * 覆盖：getTooltip/setTooltip、createOverlay（ComponentRegistrar 模式）、
 *       initTooltipOverlay、open/close/position 方法、cleanup
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
import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';
import { ZIndexLevel } from '@/component/z-index';

const TPL = '<div class="box"><span data-content="box:label"></span></div>';
const TIPS_TPL = '<div class="q-tips"><span data-content="tips:text"></span></div>';

describe('OverlayAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(OverlayAbility);

    // 创建一个模拟的浮层组件类
    const TipsClass = TemplateComponent.withTemplate(TIPS_TPL).with([]);

    let registrar: ComponentRegistrar;

    beforeEach(() => {
        registrar = ComponentRegistrar.getInstance();
        // 注册 Tips 组件类
        registrar.register('Tips', TipsClass as any);
    });

    afterEach(() => {
        // 清理注册
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
    // createOverlay
    // ============================================

    describe('createOverlay', () => {
        it('ComponentRegistrar 无对应类 → 返回 null', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'nonexistent' });
            expect(result).toBeNull();
        });

        it('ComponentRegistrar 有对应类 → 返回 overlayInstance + overlayEl', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'tips' });
            expect(result).not.toBeNull();
            expect(result!.overlayInstance).toBeDefined();
            expect(result!.overlayEl).toBeDefined();
            expect(result!.overlayEl.classList.contains('q-tips')).toBe(true);
        });

        it('overlayEl 初始 display=none', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'tips' });
            expect(result!.overlayEl.style.display).toBe('none');
        });

        it('生成 openTips / closeTips / positionTips 方法', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips' });
            expect(typeof instance.openTips).toBe('function');
            expect(typeof instance.closeTips).toBe('function');
            expect(typeof instance.positionTips).toBe('function');
        });

        it('生成 tipsPlacement getter/setter', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips', placement: 'top' });
            expect(instance.tipsPlacement).toBe('top');
            instance.tipsPlacement = 'bottom';
            expect(instance.tipsPlacement).toBe('bottom');
        });

        it('openTips 挂载到 OverlayRoot', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'tips' });
            instance.openTips();
            expect(result!.overlayEl.style.display).not.toBe('none');
        });

        it('closeTips 隐藏浮层', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'tips' });
            instance.openTips();
            instance.closeTips();
            expect(result!.overlayEl.style.display).toBe('none');
        });

        it('positionTips 不抛异常', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips' });
            expect(() => instance.positionTips()).not.toThrow();
        });

        it('prefix 首字母大写后查找 ComponentRegistrar', () => {
            const instance = new BoxClass() as any;
            // prefix='tips' → 查找 'Tips'
            const result = instance.createOverlay({ prefix: 'tips' });
            expect(result).not.toBeNull();
        });

        it('自定义 placement 和 offset', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({
                prefix: 'tips',
                placement: 'left',
                offset: 10,
            });
            expect(result).not.toBeNull();
            expect(instance.tipsPlacement).toBe('left');
        });

        it('overlayProps 传递给浮层组件', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({
                prefix: 'tips',
                overlayProps: { text: 'Hello' },
            });
            expect(result).not.toBeNull();
        });
    });

    // ============================================
    // initTooltipOverlay
    // ============================================

    describe('initTooltipOverlay', () => {
        it('注册 hover 事件', () => {
            const instance = new BoxClass() as any;
            instance.initTooltipOverlay({ tooltip: 'Hello' });
            // 验证不抛异常
            expect(typeof instance.openTips).toBe('function');
        });

        it('自定义 tooltipType', () => {
            // 注册一个自定义浮层类
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

        it('hover 事件触发 openTips/closeTips', () => {
            jest.useFakeTimers();
            const instance = new BoxClass() as any;
            instance.initTooltipOverlay({ tooltip: 'Hello' });

            // mouseenter → openTips
            instance.el.dispatchEvent(new Event('mouseenter'));
            jest.runAllTimers();
            // 验证浮层被打开（isOpen 状态）
            expect(instance.abilityState('Overlay:tips:isOpen', () => false)).toBe(true);

            // mouseleave → closeTips
            instance.el.dispatchEvent(new Event('mouseleave'));
            jest.runAllTimers();
            expect(instance.abilityState('Overlay:tips:isOpen', () => true)).toBe(false);

            jest.useRealTimers();
        });

        it('hover showDelay=0 立即显示', () => {
            jest.useFakeTimers();
            const instance = new BoxClass() as any;
            instance.initTooltipOverlay({ tooltip: 'Hello', tooltipShowDelay: 0 });

            instance.el.dispatchEvent(new Event('mouseenter'));
            jest.runAllTimers();
            expect(instance.abilityState('Overlay:tips:isOpen', () => false)).toBe(true);

            jest.useRealTimers();
        });

        it('hover 互相取消定时器', () => {
            jest.useFakeTimers();
            const instance = new BoxClass() as any;
            instance.initTooltipOverlay({ tooltip: 'Hello', tooltipShowDelay: 100, tooltipHideDelay: 100 });

            // mouseenter → 设置 showTimer
            instance.el.dispatchEvent(new Event('mouseenter'));
            // mouseleave → 取消 showTimer，设置 hideTimer
            instance.el.dispatchEvent(new Event('mouseleave'));
            jest.runAllTimers();
            // openTips 不应被调用（showTimer 被取消了），closeTips 也不应被调用（因为没 open 过）
            expect(instance.abilityState('Overlay:tips:isOpen', () => true)).toBe(false);

            jest.useRealTimers();
        });
    });

    // ============================================
    // cleanup
    // ============================================

    describe('cleanup', () => {
        it('dispose 时清理浮层（未打开）', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips' });
            expect(typeof instance.openTips).toBe('function');
            instance.dispose();
            // 方法被删除
            expect((instance as any).openTips).toBeUndefined();
            expect((instance as any).closeTips).toBeUndefined();
        });

        it('dispose 时清理浮层（已打开）', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips' });
            instance.openTips();
            instance.dispose();
            expect((instance as any).openTips).toBeUndefined();
        });

        it('closeTips 未打开时不操作', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips' });
            // 未 open 直接 close → 不报错
            expect(() => instance.closeTips()).not.toThrow();
        });

        it('open → close 完整流程', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'tips' });
            instance.openTips();
            expect(result!.overlayEl.style.display).not.toBe('none');
            instance.closeTips();
            expect(result!.overlayEl.style.display).toBe('none');
        });
    });
});
