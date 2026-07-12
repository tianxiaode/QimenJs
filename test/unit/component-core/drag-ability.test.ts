/**
 * DragAbility 单元测试
 *
 * 覆盖：getDrag/setDrag、initDrag（框架 drag 手势绑定）、
 *       setDraggable 委托方法、cleanup
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
import { DragAbility } from '@/component-core/abilities/DragAbility';

const TPL = '<div class="box"><span data-content="box:label"></span></div>';

describe('DragAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(DragAbility);

    // ============================================
    // getDrag / setDrag
    // ============================================

    describe('getDrag / setDrag', () => {
        it('有默认值的 key 返回默认值', () => {
            const instance = new BoxClass() as any;
            expect(instance.getDrag('draggable')).toBe(false);
            expect(instance.getDrag('dragAxis')).toBe('both');
        });

        it('无默认值的 key 返回 undefined', () => {
            const instance = new BoxClass() as any;
            expect(instance.getDrag('dragHandle')).toBeUndefined();
            expect(instance.getDrag('dragBounds')).toBeUndefined();
            expect(instance.getDrag('dragActiveClass')).toBeUndefined();
            expect(instance.getDrag('dragGrid')).toBeUndefined();
        });

        it('setDrag 设置值', () => {
            const instance = new BoxClass() as any;
            instance.setDrag('draggable', true);
            expect(instance.getDrag('draggable')).toBe(true);
        });

        it('setDrag 覆盖默认值', () => {
            const instance = new BoxClass() as any;
            instance.setDrag('dragAxis', 'x');
            expect(instance.getDrag('dragAxis')).toBe('x');
        });
    });

    // ============================================
    // initDrag
    // ============================================

    describe('initDrag', () => {
        it('调用 initDrag 后生成 setDraggable 委托方法', () => {
            const instance = new BoxClass() as any;
            instance.initDrag({ draggable: true });
            expect(typeof instance.setDraggable).toBe('function');
        });

        it('调用 initDrag 后设置 touchAction 和 userSelect', () => {
            const instance = new BoxClass() as any;
            instance.initDrag({ draggable: true });
            expect(instance.el.style.touchAction).toBe('none');
            expect(instance.el.style.userSelect).toBe('none');
        });

        it('dragHandle 选择器找不到元素时不报错', () => {
            const instance = new BoxClass() as any;
            expect(() => {
                instance.initDrag({ draggable: true, dragHandle: '.nonexistent' });
            }).not.toThrow();
        });

        it('dragHandle 选择器找到元素时以该元素为拖拽目标', () => {
            const instance = new BoxClass() as any;
            const label = instance.el.querySelector('[data-content="box:label"]') as HTMLElement;
            instance.initDrag({ draggable: true, dragHandle: '[data-content="box:label"]' });
            // 手柄元素被设置了 touchAction
            expect(label.style.touchAction).toBe('none');
        });

        it('setDraggable 切换 touchAction', () => {
            const instance = new BoxClass() as any;
            instance.initDrag({ draggable: true });
            instance.setDraggable(false);
            expect(instance.el.style.touchAction).toBe('');
            instance.setDraggable(true);
            expect(instance.el.style.touchAction).toBe('none');
        });

        it('dragActiveClass 在 initDrag 中传入但不影响初始状态', () => {
            const instance = new BoxClass() as any;
            instance.initDrag({ draggable: true, dragActiveClass: 'dragging' });
            expect(instance.el.classList.contains('dragging')).toBe(false);
        });
    });

    // ============================================
    // cleanup
    // ============================================

    describe('cleanup', () => {
        it('dispose 时清理委托方法和样式', () => {
            const instance = new BoxClass() as any;
            instance.initDrag({ draggable: true });
            expect(typeof instance.setDraggable).toBe('function');

            instance.dispose();
            expect((instance as any).setDraggable).toBeUndefined();
        });
    });
});
