/**
 * OverlayHostAbility 单元测试
 *
 * 覆盖：initOverlayHost、positionOverlay、openOverlay/closeOverlay、
 *       z-index 管理、placement/offset/flip 状态
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
import { OverlayHostAbility } from '@/component-core/abilities/OverlayHostAbility';
import { ArrowAbility } from '@/component-abilities/render/ArrowAbility';

const TPL = '<div class="overlay-host"></div>';

describe('OverlayHostAbility', () => {
    const HostClass = TemplateComponent.withTemplate(TPL).with(OverlayHostAbility);

    // ============================================
    // initOverlayHost
    // ============================================

    describe('initOverlayHost', () => {
        it('设置初始样式', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            expect(instance.el.style.position).toBe('absolute');
            expect(instance.el.style.display).toBe('none');
            expect(instance.el.style.pointerEvents).toBe('auto');
        });

        it('使用默认配置', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            expect(instance._placement).toBe('bottom');
            expect(instance._offset).toBe(4);
            expect(instance._flip).toBe(true);
        });

        it('使用自定义配置', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost({
                placement: 'top',
                offset: 10,
                flip: false,
            });
            expect(instance._placement).toBe('top');
            expect(instance._offset).toBe(10);
            expect(instance._flip).toBe(false);
        });
    });

    // ============================================
    // placement / offset / flip / anchor 状态
    // ============================================

    describe('状态属性', () => {
        it('placement getter/setter', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            instance._placement = 'left';
            expect(instance._placement).toBe('left');
        });

        it('offset getter/setter', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            instance._offset = 20;
            expect(instance._offset).toBe(20);
        });

        it('flip getter/setter', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            instance._flip = false;
            expect(instance._flip).toBe(false);
        });

        it('anchor getter/setter', () => {
            const instance = new HostClass() as any;
            const anchor = document.createElement('div');
            instance._anchor = anchor;
            expect(instance._anchor).toBe(anchor);
        });

        it('anchor 默认为 null/undefined', () => {
            const instance = new HostClass() as any;
            expect(instance._anchor).toBeFalsy();
        });
    });

    // ============================================
    // z-index 管理
    // ============================================

    describe('z-index 管理', () => {
        it('acquireZIndex 设置 el.style.zIndex', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            const zIdx = instance.acquireZIndex();
            expect(instance.el.style.zIndex).toBe(String(zIdx));
            expect(zIdx).toBeGreaterThan(0);
        });

        it('acquireZIndex 使用自定义 level', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            const zIdx = instance.acquireZIndex(2000);
            expect(zIdx).toBeGreaterThanOrEqual(2000);
        });

        it('releaseZIndex 不报错', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            instance.acquireZIndex();
            expect(() => instance.releaseZIndex()).not.toThrow();
        });
    });

    // ============================================
    // positionOverlay
    // ============================================

    describe('positionOverlay', () => {
        it('无 anchor 时不报错', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            expect(() => instance.positionOverlay()).not.toThrow();
        });

        it('有 anchor 时计算定位', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();

            // 创建 anchor 并添加到 DOM
            const anchor = document.createElement('div');
            anchor.style.position = 'absolute';
            anchor.style.left = '100px';
            anchor.style.top = '100px';
            anchor.style.width = '50px';
            anchor.style.height = '30px';
            document.body.appendChild(anchor);
            document.body.appendChild(instance.el);

            instance._anchor = anchor;
            instance.positionOverlay();

            // 验证 el 被设置了 left/top
            expect(instance.el.style.left).not.toBe('');
            expect(instance.el.style.top).not.toBe('');

            anchor.remove();
            instance.el.remove();
        });

        it('reposition 委托给 positionOverlay', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            const spy = jest.spyOn(instance, 'positionOverlay');
            instance.reposition();
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it('返回实际 placement', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost({ placement: 'top' });

            const anchor = document.createElement('div');
            // mock getBoundingClientRect 使 top 方向不超出视口
            anchor.getBoundingClientRect = () => ({
                left: 200, top: 200, width: 100, height: 40,
                right: 300, bottom: 240, x: 200, y: 200,
                toJSON: () => ({}),
            } as DOMRect);
            instance.el.getBoundingClientRect = () => ({
                left: 0, top: 0, width: 80, height: 30,
                right: 80, bottom: 30, x: 0, y: 0,
                toJSON: () => ({}),
            } as DOMRect);
            document.body.appendChild(anchor);
            document.body.appendChild(instance.el);

            instance._anchor = anchor;
            const result = instance.positionOverlay();
            expect(result).toBe('top');

            anchor.remove();
            instance.el.remove();
        });

        it('无 anchor 时返回传入的 placement', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost({ placement: 'left' });
            const result = instance.positionOverlay();
            expect(result).toBe('left');
        });
    });

    // ============================================
    // ArrowAbility 联动
    // ============================================

    describe('ArrowAbility 联动', () => {
        const HostWithArrow = TemplateComponent.withTemplate(TPL)
            .with(OverlayHostAbility)
            .with(ArrowAbility);

        it('positionOverlay 自动调用 updateArrowPlacement', () => {
            const instance = new HostWithArrow() as any;
            instance.initOverlayHost({ placement: 'top' });
            instance.initArrow();

            const anchor = document.createElement('div');
            // mock getBoundingClientRect 使 top 方向不超出视口
            anchor.getBoundingClientRect = () => ({
                left: 200, top: 200, width: 100, height: 40,
                right: 300, bottom: 240, x: 200, y: 200,
                toJSON: () => ({}),
            } as DOMRect);
            instance.el.getBoundingClientRect = () => ({
                left: 0, top: 0, width: 80, height: 30,
                right: 80, bottom: 30, x: 0, y: 0,
                toJSON: () => ({}),
            } as DOMRect);
            document.body.appendChild(anchor);
            document.body.appendChild(instance.el);

            instance._anchor = anchor;
            instance.positionOverlay();
            expect(instance._arrowEl.classList.contains('q-arrow--top')).toBe(true);

            anchor.remove();
            instance.el.remove();
        });

        it('无 ArrowAbility 时 positionOverlay 不报错', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost({ placement: 'top' });

            const anchor = document.createElement('div');
            anchor.style.position = 'absolute';
            anchor.style.left = '100px';
            anchor.style.top = '100px';
            anchor.style.width = '50px';
            anchor.style.height = '30px';
            document.body.appendChild(anchor);
            document.body.appendChild(instance.el);

            instance._anchor = anchor;
            expect(() => instance.positionOverlay()).not.toThrow();

            anchor.remove();
            instance.el.remove();
        });
    });

    // ============================================
    // openOverlay / closeOverlay
    // ============================================

    describe('openOverlay / closeOverlay', () => {
        it('openOverlay 挂载到 OverlayRoot', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            instance.openOverlay();
            // 验证 el 被添加到 overlayRoot
            expect(instance.el.parentNode).not.toBeNull();
        });

        it('closeOverlay 从父节点移除', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            instance.openOverlay();
            instance.closeOverlay();
            expect(instance.el.parentNode).toBeNull();
        });

        it('closeOverlay 无父节点时不报错', () => {
            const instance = new HostClass() as any;
            instance.initOverlayHost();
            expect(() => instance.closeOverlay()).not.toThrow();
        });
    });

    // ============================================
    // overlayRoot
    // ============================================

    describe('overlayRoot', () => {
        it('返回 OverlayRoot 容器', () => {
            const instance = new HostClass() as any;
            const root = instance.overlayRoot;
            expect(root).toBeDefined();
        });
    });
});
