/**
 * OverlayMaskAbility 单元测试
 *
 * 覆盖：initMask、showMask、hideMask、setMaskVisible、能力状态管理
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
import { OverlayMaskAbility } from '@/component-abilities/render/OverlayMaskAbility';

const TPL = '<div class="host"></div>';

describe('OverlayMaskAbility', () => {
    const HostClass = TemplateComponent.withTemplate(TPL).with(OverlayMaskAbility);

    // ============================================
    // initMask
    // ============================================

    describe('initMask', () => {
        it('创建遮罩 DOM 并挂载到 el', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            const mask = instance._maskEl;
            expect(mask).toBeInstanceOf(HTMLElement);
            expect(mask.className).toBe('q-overlay-mask');
            expect(instance.el.contains(mask)).toBe(true);
        });

        it('默认隐藏遮罩', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            expect(instance._maskVisible).toBe(false);
            expect(instance._maskEl.style.display).toBe('none');
        });

        it('默认使用 absolute 定位', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            expect(instance._maskEl.style.position).toBe('absolute');
        });

        it('fullscreen=true 时使用 fixed 定位', () => {
            const instance = new HostClass() as any;
            instance.initMask({ fullscreen: true });
            expect(instance._maskEl.style.position).toBe('fixed');
        });

        it('默认遮罩背景色为 rgba(0, 0, 0, 0.5)', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            expect(instance._maskEl.style.backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
        });

        it('自定义遮罩背景色', () => {
            const instance = new HostClass() as any;
            instance.initMask({ maskColor: 'rgba(255, 0, 0, 0.3)' });
            expect(instance._maskEl.style.backgroundColor).toBe('rgba(255, 0, 0, 0.3)');
        });

        it('自定义 maskZIndex', () => {
            const instance = new HostClass() as any;
            instance.initMask({ maskZIndex: '2000' });
            expect(instance._maskEl.style.zIndex).toBe('2000');
        });

        it('宿主 position 为 static 时自动改为 relative', () => {
            const instance = new HostClass() as any;
            instance.el.style.position = 'static';
            instance.initMask();
            expect(instance.el.style.position).toBe('relative');
        });

        it('宿主 position 非 static 时不变', () => {
            const instance = new HostClass() as any;
            instance.el.style.position = 'absolute';
            instance.initMask();
            expect(instance.el.style.position).toBe('absolute');
        });

        it('fullscreen 时不修改宿主 position', () => {
            const instance = new HostClass() as any;
            instance.el.style.position = 'static';
            instance.initMask({ fullscreen: true });
            expect(instance.el.style.position).toBe('static');
        });

        it('onMaskClick 回调被绑定', () => {
            const onClick = jest.fn();
            const instance = new HostClass() as any;
            instance.initMask({ onMaskClick: onClick });
            instance._maskEl.click();
            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    // ============================================
    // showMask / hideMask
    // ============================================

    describe('showMask / hideMask', () => {
        it('showMask 显示遮罩', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            instance.showMask();
            expect(instance._maskVisible).toBe(true);
            expect(instance._maskEl.style.display).toBe('');
        });

        it('hideMask 隐藏遮罩', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            instance.showMask();
            instance.hideMask();
            expect(instance._maskVisible).toBe(false);
            expect(instance._maskEl.style.display).toBe('none');
        });

        it('未初始化时 showMask 不报错', () => {
            const instance = new HostClass() as any;
            expect(() => instance.showMask()).not.toThrow();
        });

        it('未初始化时 hideMask 不报错', () => {
            const instance = new HostClass() as any;
            expect(() => instance.hideMask()).not.toThrow();
        });
    });

    // ============================================
    // setMaskVisible
    // ============================================

    describe('setMaskVisible', () => {
        it('true 时显示遮罩', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            instance.setMaskVisible(true);
            expect(instance._maskVisible).toBe(true);
        });

        it('false 时隐藏遮罩', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            instance.showMask();
            instance.setMaskVisible(false);
            expect(instance._maskVisible).toBe(false);
        });
    });

    // ============================================
    // 能力状态管理
    // ============================================

    describe('能力状态', () => {
        it('_maskEl 初始为 null', () => {
            const instance = new HostClass() as any;
            expect(instance._maskEl).toBeFalsy();
        });

        it('_maskVisible 初始为 falsy', () => {
            const instance = new HostClass() as any;
            expect(instance._maskVisible).toBeFalsy();
        });

        it('initMask 后 _maskEl 有值', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            expect(instance._maskEl).not.toBeNull();
        });
    });

    // ============================================
    // 清理
    // ============================================

    describe('清理', () => {
        it('dispose 后遮罩 DOM 被移除', () => {
            const instance = new HostClass() as any;
            instance.initMask();
            const mask = instance._maskEl;
            instance.dispose();
            expect(mask.parentNode).toBeNull();
        });
    });
});
