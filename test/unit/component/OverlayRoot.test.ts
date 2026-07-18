/**
 * OverlayRoot 单元测试
 *
 * 覆盖：单例模式、getRoot、mountOverlay、unmountOverlay、destroy
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

import { OverlayRoot } from '@/overlay/OverlayRoot';

describe('OverlayRoot', () => {
    afterEach(() => {
        // 每个测试后清理单例和 DOM
        try {
            OverlayRoot.getInstance().destroy();
        } catch {}
    });

    // ============================================
    // 单例模式
    // ============================================

    describe('单例', () => {
        it('getInstance 返回同一实例', () => {
            const a = OverlayRoot.getInstance();
            const b = OverlayRoot.getInstance();
            expect(a).toBe(b);
        });

        it('destroy 后重新创建新实例', () => {
            const a = OverlayRoot.getInstance();
            a.destroy();
            const b = OverlayRoot.getInstance();
            expect(a).not.toBe(b);
        });
    });

    // ============================================
    // getRoot
    // ============================================

    describe('getRoot', () => {
        it('创建 #q-overlay-root 容器', () => {
            const root = OverlayRoot.getInstance().getRoot();
            expect(root.id).toBe('q-overlay-root');
            expect(document.body.contains(root)).toBe(true);
        });

        it('容器样式正确', () => {
            const root = OverlayRoot.getInstance().getRoot();
            expect(root.style.position).toBe('fixed');
            expect(root.style.pointerEvents).toBe('none');
        });

        it('重复调用返回同一容器', () => {
            const a = OverlayRoot.getInstance().getRoot();
            const b = OverlayRoot.getInstance().getRoot();
            expect(a).toBe(b);
        });
    });

    // ============================================
    // mountOverlay / unmountOverlay
    // ============================================

    describe('mountOverlay / unmountOverlay', () => {
        it('mountOverlay 将元素挂载到浮层根容器', () => {
            const root = OverlayRoot.getInstance();
            const el = document.createElement('div');
            root.mountOverlay(el);
            expect(root.getRoot().contains(el)).toBe(true);
        });

        it('unmountOverlay 卸载元素', () => {
            const root = OverlayRoot.getInstance();
            const el = document.createElement('div');
            root.mountOverlay(el);
            root.unmountOverlay(el);
            expect(root.getRoot().contains(el)).toBe(false);
        });
    });

    // ============================================
    // destroy
    // ============================================

    describe('destroy', () => {
        it('移除 DOM 容器', () => {
            const root = OverlayRoot.getInstance();
            const el = root.getRoot();
            root.destroy();
            expect(document.body.contains(el)).toBe(false);
        });
    });
});
