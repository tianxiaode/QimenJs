/**
 * ExpandArrowAbility 单元测试
 *
 * 覆盖：initExpandArrow、toggleExpandArrow、setExpandArrowState、能力状态管理
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
import { ExpandArrowAbility } from '@/component-abilities/render/ExpandArrowAbility';

// 模板包含 expand 节点（div > i 结构）
const TPL = '<span data-content="expand:expand" class="q-expand-arrow q-expand-arrow--collapsed"><i></i></span>';

describe('ExpandArrowAbility', () => {
    const HostClass = TemplateComponent.withTemplate(TPL).with(ExpandArrowAbility);

    // ============================================
    // initExpandArrow
    // ============================================

    describe('initExpandArrow', () => {
        it('从 nodeMap 定位箭头节点并设置初始状态类', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            const expandEl = instance.nodeMap?.['expand']?.['expand']?.el as HTMLElement;
            expect(expandEl).toBeTruthy();
            expect(expandEl.classList.contains('q-expand-arrow')).toBe(true);
            expect(expandEl.classList.contains('q-expand-arrow--collapsed')).toBe(true);
        });

        it('默认状态为 collapsed', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            expect(instance._expandArrowState).toBe('collapsed');
        });

        it('配置初始状态为 expanded', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow({ arrowState: 'expanded' });
            expect(instance._expandArrowState).toBe('expanded');
            const expandEl = instance.nodeMap?.['expand']?.['expand']?.el as HTMLElement;
            expect(expandEl.classList.contains('q-expand-arrow--expanded')).toBe(true);
        });

        it('默认事件名为 toggle', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            expect(instance._expandArrowEvent).toBe('toggle');
        });

        it('配置自定义事件名', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow({ arrowEvent: 'expand' });
            expect(instance._expandArrowEvent).toBe('expand');
        });

        it('nodeMap 中无 expand 节点时不报错', () => {
            const NoExpandClass = TemplateComponent.withTemplate('<div></div>').with(ExpandArrowAbility);
            const instance = new NoExpandClass() as any;
            expect(() => instance.initExpandArrow()).not.toThrow();
        });
    });

    // ============================================
    // toggleExpandArrow
    // ============================================

    describe('toggleExpandArrow', () => {
        it('从 collapsed 切换到 expanded', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            instance.toggleExpandArrow();
            expect(instance._expandArrowState).toBe('expanded');
            const expandEl = instance.nodeMap?.['expand']?.['expand']?.el as HTMLElement;
            expect(expandEl.classList.contains('q-expand-arrow--expanded')).toBe(true);
            expect(expandEl.classList.contains('q-expand-arrow--collapsed')).toBe(false);
        });

        it('从 expanded 切换到 collapsed', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow({ arrowState: 'expanded' });
            instance.toggleExpandArrow();
            expect(instance._expandArrowState).toBe('collapsed');
            const expandEl = instance.nodeMap?.['expand']?.['expand']?.el as HTMLElement;
            expect(expandEl.classList.contains('q-expand-arrow--collapsed')).toBe(true);
            expect(expandEl.classList.contains('q-expand-arrow--expanded')).toBe(false);
        });
    });

    // ============================================
    // setExpandArrowState
    // ============================================

    describe('setExpandArrowState', () => {
        it('设置 expanded 状态并更新 CSS 类', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            instance.setExpandArrowState('expanded');
            expect(instance._expandArrowState).toBe('expanded');
            const expandEl = instance.nodeMap?.['expand']?.['expand']?.el as HTMLElement;
            expect(expandEl.classList.contains('q-expand-arrow--expanded')).toBe(true);
        });

        it('设置相同状态时不重复操作', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            const emitSpy = jest.spyOn(instance, 'emit');
            instance.setExpandArrowState('collapsed');
            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('状态切换时触发内部事件', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            const emitSpy = jest.spyOn(instance, 'emit');
            instance.setExpandArrowState('expanded');
            expect(emitSpy).toHaveBeenCalledWith('toggle', { state: 'expanded', prev: 'collapsed' });
        });

        it('使用自定义事件名', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow({ arrowEvent: 'expand' });
            const emitSpy = jest.spyOn(instance, 'emit');
            instance.setExpandArrowState('expanded');
            expect(emitSpy).toHaveBeenCalledWith('expand', { state: 'expanded', prev: 'collapsed' });
        });
    });

    // ============================================
    // 点击交互
    // ============================================

    describe('点击交互', () => {
        it('点击箭头节点切换状态', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            const expandEl = instance.nodeMap?.['expand']?.['expand']?.el as HTMLElement;
            expandEl.click();
            expect(instance._expandArrowState).toBe('expanded');
        });

        it('点击事件 stopPropagation', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            const expandEl = instance.nodeMap?.['expand']?.['expand']?.el as HTMLElement;
            const event = new MouseEvent('click', { bubbles: true });
            const stopSpy = jest.spyOn(event, 'stopPropagation');
            expandEl.dispatchEvent(event);
            expect(stopSpy).toHaveBeenCalled();
        });
    });

    // ============================================
    // 能力状态管理
    // ============================================

    describe('能力状态', () => {
        it('_expandArrowState 初始为 collapsed', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            expect(instance._expandArrowState).toBe('collapsed');
        });

        it('_expandArrowEvent 初始为 toggle', () => {
            const instance = new HostClass() as any;
            instance.initExpandArrow();
            expect(instance._expandArrowEvent).toBe('toggle');
        });
    });
});
