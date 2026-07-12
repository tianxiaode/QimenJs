/**
 * OverlayAbility 单元测试
 *
 * 覆盖：createOverlay（ComponentRegistrar 模式）、
 *       open/close/position 委托方法、placement getter/setter、cleanup
 *
 * 注意：tooltip 专属逻辑已拆分到 TooltipAbility，对应测试在 tooltip-ability.test.ts
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

const TPL = '<div class="box"><span data-content="box:label"></span></div>';
const TIPS_TPL = '<div class="q-tips"><span data-content="tips:text"></span></div>';

describe('OverlayAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(OverlayAbility);

    // 创建一个模拟的浮层组件类
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
            instance.createOverlay({ prefix: 'tips' });
            // placement 委托给浮层实例
            expect(typeof instance.tipsPlacement).toBeDefined();
        });

        it('prefix 首字母大写后查找 ComponentRegistrar', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'tips' });
            expect(result).not.toBeNull();
        });

        it('typeOverride 覆盖查找名', () => {
            const CustomTips = TemplateComponent.withTemplate('<div class="custom-tips"></div>').with([]);
            registrar.register('CustomTips', CustomTips as any);

            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'tips', typeOverride: 'CustomTips' });
            expect(result).not.toBeNull();

            registrar.unregister('CustomTips');
        });

        it('overlayProps 传递给浮层组件', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({
                prefix: 'tips',
                overlayProps: { text: 'Hello' },
            });
            expect(result).not.toBeNull();
        });

        it('浮层组件无 el → 返回 null', () => {
            // 注册一个没有 el 的类
            const NoElClass = class { constructor() {} };
            registrar.register('NoEl', NoElClass as any);

            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'noEl' });
            expect(result).toBeNull();

            registrar.unregister('NoEl');
        });
    });

    // ============================================
    // 委托方法
    // ============================================

    describe('委托方法', () => {
        it('openTips 不报错', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips' });
            expect(() => instance.openTips()).not.toThrow();
        });

        it('closeTips 不报错', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips' });
            expect(() => instance.closeTips()).not.toThrow();
        });

        it('positionTips 不报错', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips' });
            expect(() => instance.positionTips()).not.toThrow();
        });
    });

    // ============================================
    // cleanup
    // ============================================

    describe('cleanup', () => {
        it('dispose 时清理浮层和委托方法', () => {
            const instance = new BoxClass() as any;
            instance.createOverlay({ prefix: 'tips' });
            expect(typeof instance.openTips).toBe('function');
            instance.dispose();
            expect((instance as any).openTips).toBeUndefined();
            expect((instance as any).closeTips).toBeUndefined();
            expect((instance as any).positionTips).toBeUndefined();
        });

        it('dispose 时销毁浮层实例', () => {
            const instance = new BoxClass() as any;
            const result = instance.createOverlay({ prefix: 'tips' });
            const disposeSpy = jest.spyOn(result!.overlayInstance, 'dispose');
            instance.dispose();
            expect(disposeSpy).toHaveBeenCalled();
            disposeSpy.mockRestore();
        });
    });
});
