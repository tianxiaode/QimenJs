/**
 * ArrowAbility 单元测试
 *
 * 覆盖：initArrow、updateArrowPlacement、setArrowVisible、能力状态管理
 * 适配 nodeMap 模式：箭头节点由模板定义，Ability 从 nodeMap 定位
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

import { Component } from '@/component-core';
import type { ComponentTemplate } from '@/component-core';
import { ArrowAbility } from '@/component-abilities/render/ArrowAbility';

const TPL: ComponentTemplate = {
    tpl: { tag: 'div', name: 'arrow:arrow', content: 'arrow', className: 'q-arrow' },
};

describe('ArrowAbility', () => {
    const HostClass = Component.withTemplate(TPL).with([ArrowAbility]);

    // ============================================
    // initArrow
    // ============================================

    describe('initArrow', () => {
        it('从 nodeMap 定位箭头节点', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl).toBeTruthy();
            expect(arrowEl.classList.contains('q-arrow')).toBe(true);
        });

        it('默认显示箭头', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            expect(instance._arrowVisible).toBe(true);
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.style.display).not.toBe('none');
        });

        it('arrow=false 时隐藏箭头', () => {
            const instance = new HostClass() as any;
            instance.initArrow({ arrow: false });
            expect(instance._arrowVisible).toBe(false);
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.style.display).toBe('none');
        });

        it('应用 CSS 变量覆盖', () => {
            const instance = new HostClass() as any;
            instance.initArrow({
                arrowVars: {
                    '--q-arrow-color': '#fff',
                    '--q-arrow-size': '6px',
                },
            });
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.style.getPropertyValue('--q-arrow-color')).toBe('#fff');
            expect(arrowEl.style.getPropertyValue('--q-arrow-size')).toBe('6px');
        });

        it('无 arrowVars 时不设置 CSS 变量', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.style.getPropertyValue('--q-arrow-color')).toBe('');
        });

        it('nodeMap 中无 arrow 节点时不报错', () => {
            const NoArrowClass = Component.withTemplate({ tpl: { tag: 'div' } }).with([
                ArrowAbility,
            ]);
            const instance = new NoArrowClass() as any;
            expect(() => instance.initArrow()).not.toThrow();
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
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.classList.contains('q-arrow--top')).toBe(true);
        });

        it('设置 bottom 方向类', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.updateArrowPlacement('bottom');
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.classList.contains('q-arrow--bottom')).toBe(true);
        });

        it('设置 left 方向类', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.updateArrowPlacement('left');
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.classList.contains('q-arrow--left')).toBe(true);
        });

        it('设置 right 方向类', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.updateArrowPlacement('right');
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.classList.contains('q-arrow--right')).toBe(true);
        });

        it('切换方向时移除旧方向类', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            instance.updateArrowPlacement('top');
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.classList.contains('q-arrow--top')).toBe(true);
            instance.updateArrowPlacement('bottom');
            expect(arrowEl.classList.contains('q-arrow--top')).toBe(false);
            expect(arrowEl.classList.contains('q-arrow--bottom')).toBe(true);
        });

        it('无箭头节点时不报错', () => {
            const NoArrowClass = Component.withTemplate({ tpl: { tag: 'div' } }).with([
                ArrowAbility,
            ]);
            const instance = new NoArrowClass() as any;
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
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.style.display).toBe('none');
        });

        it('显示箭头', () => {
            const instance = new HostClass() as any;
            instance.initArrow({ arrow: false });
            instance.setArrowVisible(true);
            expect(instance._arrowVisible).toBe(true);
            const arrowEl = instance.nodeMap?.['arrow']?.['arrow']?.el as HTMLElement;
            expect(arrowEl.style.display).toBe('');
        });

        it('无箭头节点时不报错', () => {
            const NoArrowClass = Component.withTemplate({ tpl: { tag: 'div' } }).with([
                ArrowAbility,
            ]);
            const instance = new NoArrowClass() as any;
            expect(() => instance.setArrowVisible(false)).not.toThrow();
        });
    });

    // ============================================
    // 能力状态管理
    // ============================================

    describe('能力状态', () => {
        it('_arrowVisible 初始为 true', () => {
            const instance = new HostClass() as any;
            instance.initArrow();
            expect(instance._arrowVisible).toBe(true);
        });
    });
});
