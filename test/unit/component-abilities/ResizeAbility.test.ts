/**
 * ResizeAbility 单元测试
 *
 * 覆盖：initResize、resizable getter/setter、_onResizeDrag、onBeforeDispose
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
import { ResizeAbility } from '@/component-abilities/resize/ResizeAbility';

const TPL: ComponentTemplate = { tpl: { tag: 'div' } };
const HostClass = Component.withTemplate(TPL).with([ResizeAbility]);

describe('ResizeAbility', () => {
    // ============================================
    // initResize
    // ============================================

    describe('initResize', () => {
        it('默认创建所有边手柄', () => {
            const host = new HostClass() as any;
            host.initResize();
            expect(host.el.querySelectorAll('.q-resize-handle').length).toBe(8);
            expect(host.el.classList.contains('q-resizable')).toBe(true);
        });

        it('指定边创建对应手柄', () => {
            const host = new HostClass() as any;
            host.initResize({ edges: ['se'] });
            expect(host.el.querySelectorAll('.q-resize-handle').length).toBe(1);
            expect(host.el.querySelector('.q-resize-handle--se')).toBeTruthy();
        });

        it('手柄设置正确 cursor', () => {
            const host = new HostClass() as any;
            host.initResize({ edges: ['se', 'e'] });
            const seHandle = host.el.querySelector('.q-resize-handle--se') as HTMLElement;
            const eHandle = host.el.querySelector('.q-resize-handle--e') as HTMLElement;
            expect(seHandle.style.cursor).toBe('nwse-resize');
            expect(eHandle.style.cursor).toBe('ew-resize');
        });
    });

    // ============================================
    // resizable
    // ============================================

    describe('resizable', () => {
        it('initResize 后默认为 true', () => {
            const host = new HostClass() as any;
            host.initResize();
            expect(host.resizable).toBe(true);
        });

        it('未初始化时为 false', () => {
            const host = new HostClass() as any;
            expect(host.resizable).toBe(false);
        });

        it('设为 false 隐藏手柄', () => {
            const host = new HostClass() as any;
            host.initResize();
            host.resizable = false;
            expect(host.resizable).toBe(false);
            const handles = host.el.querySelectorAll('.q-resize-handle');
            handles.forEach((h: HTMLElement) => {
                expect(h.style.display).toBe('none');
            });
            expect(host.el.classList.contains('q-resizable--disabled')).toBe(true);
        });

        it('重新启用显示手柄', () => {
            const host = new HostClass() as any;
            host.initResize();
            host.resizable = false;
            host.resizable = true;
            const handles = host.el.querySelectorAll('.q-resize-handle');
            handles.forEach((h: HTMLElement) => {
                expect(h.style.display).toBe('');
            });
        });
    });

    // ============================================
    // _onResizeDrag
    // ============================================

    describe('_onResizeDrag', () => {
        it('start 阶段记录起始状态', () => {
            const host = new HostClass() as any;
            host.initResize({ edges: ['se'] });
            const seHandle = host.el.querySelector('.q-resize-handle--se') as HTMLElement;
            host._onResizeDrag({
                phase: 'start',
                dx: 10,
                dy: 20,
                originalEvent: { target: seHandle },
            });
            expect(host.el.classList.contains('q-resizable--active')).toBe(true);
        });

        it('move 阶段调整尺寸', () => {
            const host = new HostClass() as any;
            host.initResize({ edges: ['se'] });
            const seHandle = host.el.querySelector('.q-resize-handle--se') as HTMLElement;

            host._onResizeDrag({
                phase: 'start',
                dx: 0,
                dy: 0,
                originalEvent: { target: seHandle },
            });
            host._onResizeDrag({
                phase: 'move',
                dx: 50,
                dy: 30,
                originalEvent: { target: seHandle },
            });
            expect(host.el.style.width).toBeTruthy();
            expect(host.el.style.height).toBeTruthy();
        });

        it('end 阶段移除 active 类', () => {
            const host = new HostClass() as any;
            host.initResize({ edges: ['se'] });
            const seHandle = host.el.querySelector('.q-resize-handle--se') as HTMLElement;

            host._onResizeDrag({
                phase: 'start',
                dx: 0,
                dy: 0,
                originalEvent: { target: seHandle },
            });
            host._onResizeDrag({
                phase: 'end',
                originalEvent: { target: seHandle },
            });
            expect(host.el.classList.contains('q-resizable--active')).toBe(false);
        });

        it('disabled 时不处理', () => {
            const host = new HostClass() as any;
            host.initResize({ edges: ['se'] });
            host.resizable = false;
            const seHandle = host.el.querySelector('.q-resize-handle--se') as HTMLElement;
            host._onResizeDrag({
                phase: 'start',
                dx: 0,
                dy: 0,
                originalEvent: { target: seHandle },
            });
            expect(host.el.classList.contains('q-resizable--active')).toBe(false);
        });

        it('未初始化时不报错', () => {
            const host = new HostClass() as any;
            expect(() => host._onResizeDrag({ phase: 'start', dx: 0, dy: 0 })).not.toThrow();
        });
    });

    // ============================================
    // onBeforeDispose
    // ============================================

    describe('onBeforeDispose', () => {
        it('移除所有手柄', () => {
            const host = new HostClass() as any;
            host.initResize();
            expect(host.el.querySelectorAll('.q-resize-handle').length).toBe(8);
            host.onBeforeDispose();
            expect(host.el.querySelectorAll('.q-resize-handle').length).toBe(0);
        });

        it('未初始化时不报错', () => {
            const host = new HostClass() as any;
            expect(() => host.onBeforeDispose()).not.toThrow();
        });
    });
});
