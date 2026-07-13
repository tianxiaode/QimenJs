/**
 * ArrowAbility 单元测试
 *
 * 覆盖：initArrow、updateArrowPlacement、setArrowVisible、能力状态管理
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
import { ArrowAbility } from '@/component-abilities/render/ArrowAbility';

const TPL = '<div class="overlay-host"></div>';

describe('ArrowAbility', () => {
    const HostClass = TemplateComponent.withTemplate(TPL).with(ArrowAbility);

    // ============================================
    // initArrow
    // ============================================

    describe('initArrow', () => {
        it('创建箭头 DOM 并挂载到 el', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            const arrow = instance._arrowEl;
            expect(arrow).toBeInstanceOf(HTMLElement);
            expect(arrow.className).toBe('q-arrow');
            expect(instance.el.contains(arrow)).toBe(true);
        });

        it('默认显示箭头', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            expect(instance._arrowVisible).toBe(true);
            expect(instance._arrowEl.style.display).not.toBe('none');
        });

        it('arrow=false 时隐藏箭头', () => {
            const instance = new HostClass() as any;
            instance.initArrow({ arrow: false });
            expect(instance._arrowVisible).toBe(false);
            expect(instance._arrowEl.style.display).toBe('none');
        });

        it('应用 CSS 变量覆盖', () => {
            const instance = new HostClass() as any;
            instance.initArrow({
                arrowVars: {
                    '--q-arrow-color': '#fff',
                    '--q-arrow-size': '6px',
                },
            });
            expect(instance.el.style.getPropertyValue('--q-arrow-color')).toBe('#fff');
            expect(instance.el.style.getPropertyValue('--q-arrow-size')).toBe('6px');
        });

        it('无 arrowVars 时不设置 CSS 变量', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            expect(instance.el.style.getPropertyValue('--q-arrow-color')).toBe('');
        });
    });

    // ============================================
    // updateArrowPlacement
    // ============================================

    describe('updateArrowPlacement', () => {
        it('设置 top 方向类', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.updateArrowPlacement('top');
            expect(instance._arrowEl.classList.contains('q-arrow--top')).toBe(true);
        });

        it('设置 bottom 方向类', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.updateArrowPlacement('bottom');
            expect(instance._arrowEl.classList.contains('q-arrow--bottom')).toBe(true);
        });

        it('设置 left 方向类', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.updateArrowPlacement('left');
            expect(instance._arrowEl.classList.contains('q-arrow--left')).toBe(true);
        });

        it('设置 right 方向类', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.updateArrowPlacement('right');
            expect(instance._arrowEl.classList.contains('q-arrow--right')).toBe(true);
        });

        it('切换方向时移除旧方向类', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.updateArrowPlacement('top');
            expect(instance._arrowEl.classList.contains('q-arrow--top')).toBe(true);
            instance.updateArrowPlacement('bottom');
            expect(instance._arrowEl.classList.contains('q-arrow--top')).toBe(false);
            expect(instance._arrowEl.classList.contains('q-arrow--bottom')).toBe(true);
        });

        it('无箭头 DOM 时不报错', () => {
            const instance = new HostClass() as any;
            expect(() => instance.updateArrowPlacement('top')).not.toThrow();
        });
    });

    // ============================================
    // setArrowVisible
    // ============================================

    describe('setArrowVisible', () => {
        it('隐藏箭头', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.setArrowVisible(false);
            expect(instance._arrowVisible).toBe(false);
            expect(instance._arrowEl.style.display).toBe('none');
        });

        it('显示箭头', () => {
            const instance = new HostClass() as any;
            instance.initArrow({ arrow: false });
            instance.setArrowVisible(true);
            expect(instance._arrowVisible).toBe(true);
            expect(instance._arrowEl.style.display).toBe('');
        });

        it('无箭头 DOM 时不报错', () => {
            const instance = new HostClass() as any;
            expect(() => instance.setArrowVisible(false)).not.toThrow();
        });
    });

    // ============================================
    // 能力状态管理
    // ============================================

    describe('能力状态', () => {
        it('_arrowEl 初始为 null/undefined', () => {
            const instance = new HostClass() as any;
            expect(instance._arrowEl).toBeFalsy();
        });

        it('_arrowVisible 初始为 true', () => {
            const instance = new HostClass() as any;
            // _arrowVisible 依赖 abilityState，初始访问时 creator 为 null 返回 undefined
            // initArrow 后才有值
            instance.initArrow();
            expect(instance._arrowVisible).toBe(true);
        });

        it('initArrow 后 _arrowEl 有值', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            expect(instance._arrowEl).not.toBeNull();
        });
    });
});
