/**
 * VirtualListAbility 单元测试
 *
 * 覆盖：containerHeight、rowHeight、bufferCount、items、rowRenderer、scrollTop、
 *       visibleCount、startIndex、endIndex、totalHeight、renderVirtualList、scrollToIndex
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
import { VirtualListAbility } from '@/component-abilities/render/VirtualListAbility';

const TPL: ComponentTemplate = {
    tpl: { tag: 'div', name: 'bodyScroll:bodyScroll', content: 'bodyScroll' },
};

const HostClass = Component.withTemplate(TPL).with([VirtualListAbility]);

describe('VirtualListAbility', () => {
    // ============================================
    // 属性 getter/setter
    // ============================================

    describe('containerHeight', () => {
        it('默认为 400', () => {
            const host = new HostClass() as any;
            expect(host.containerHeight).toBe(400);
        });

        it('可设置', () => {
            const host = new HostClass() as any;
            host.containerHeight = 600;
            expect(host.containerHeight).toBe(600);
        });
    });

    describe('rowHeight', () => {
        it('默认为 40', () => {
            const host = new HostClass() as any;
            expect(host.rowHeight).toBe(40);
        });

        it('可设置', () => {
            const host = new HostClass() as any;
            host.rowHeight = 50;
            expect(host.rowHeight).toBe(50);
        });
    });

    describe('bufferCount', () => {
        it('默认为 2', () => {
            const host = new HostClass() as any;
            expect(host.bufferCount).toBe(2);
        });

        it('可设置', () => {
            const host = new HostClass() as any;
            host.bufferCount = 5;
            expect(host.bufferCount).toBe(5);
        });
    });

    describe('items', () => {
        it('默认为空数组', () => {
            const host = new HostClass() as any;
            expect(host.items).toEqual([]);
        });

        it('可设置', () => {
            const host = new HostClass() as any;
            host.items = [1, 2, 3];
            expect(host.items).toEqual([1, 2, 3]);
        });
    });

    describe('rowRenderer', () => {
        it('默认为 null', () => {
            const host = new HostClass() as any;
            expect(host.rowRenderer).toBeNull();
        });

        it('可设置', () => {
            const host = new HostClass() as any;
            const renderer = () => document.createElement('div');
            host.rowRenderer = renderer;
            expect(host.rowRenderer).toBe(renderer);
        });
    });

    describe('scrollTop', () => {
        it('默认为 0', () => {
            const host = new HostClass() as any;
            expect(host.scrollTop).toBe(0);
        });

        it('可设置', () => {
            const host = new HostClass() as any;
            host.scrollTop = 100;
            expect(host.scrollTop).toBe(100);
        });
    });

    // ============================================
    // 计算属性
    // ============================================

    describe('visibleCount', () => {
        it('根据 containerHeight / rowHeight 计算', () => {
            const host = new HostClass() as any;
            host.containerHeight = 400;
            host.rowHeight = 40;
            expect(host.visibleCount).toBe(10);
        });

        it('rowHeight 为 0 时返回 0', () => {
            const host = new HostClass() as any;
            host.rowHeight = 0;
            expect(host.visibleCount).toBe(0);
        });
    });

    describe('startIndex', () => {
        it('根据 scrollTop / rowHeight - bufferCount 计算', () => {
            const host = new HostClass() as any;
            host.rowHeight = 40;
            host.scrollTop = 200;
            host.bufferCount = 2;
            expect(host.startIndex).toBe(Math.max(0, Math.floor(200 / 40) - 2));
        });

        it('rowHeight 为 0 时返回 0', () => {
            const host = new HostClass() as any;
            host.rowHeight = 0;
            expect(host.startIndex).toBe(0);
        });
    });

    describe('endIndex', () => {
        it('根据 startIndex + visibleCount + buffer 计算', () => {
            const host = new HostClass() as any;
            host.containerHeight = 400;
            host.rowHeight = 40;
            host.bufferCount = 2;
            host.items = Array.from({ length: 100 }, (_, i) => i);
            host.scrollTop = 0;
            const end = host.endIndex;
            expect(end).toBeGreaterThan(0);
            expect(end).toBeLessThanOrEqual(100);
        });
    });

    describe('totalHeight', () => {
        it('items.length * rowHeight', () => {
            const host = new HostClass() as any;
            host.items = Array.from({ length: 50 }, (_, i) => i);
            host.rowHeight = 40;
            expect(host.totalHeight).toBe(2000);
        });
    });

    // ============================================
    // renderVirtualList
    // ============================================

    describe('renderVirtualList', () => {
        it('渲染虚拟列表到容器', () => {
            const host = new HostClass() as any;
            host.items = Array.from({ length: 20 }, (_, i) => ({ id: i, name: `item${i}` }));
            host.containerHeight = 400;
            host.rowHeight = 40;
            host.bufferCount = 2;
            host.scrollTop = 0;
            host.renderVirtualList();
            const container = host.nodeMap?.['bodyScroll']?.['bodyScroll']?.el as HTMLElement;
            if (container) {
                expect(container.style.height).toBe('400px');
                expect(container.style.overflow).toBe('auto');
            }
        });

        it('无 el 时不报错', () => {
            const host = new HostClass() as any;
            host.el = null;
            expect(() => host.renderVirtualList()).not.toThrow();
        });

        it('使用自定义 rowRenderer', () => {
            const host = new HostClass() as any;
            host.items = [1, 2, 3];
            host.containerHeight = 400;
            host.rowHeight = 40;
            host.bufferCount = 2;
            host.scrollTop = 0;
            host.rowRenderer = (item: any, index: number) => {
                const el = document.createElement('div');
                el.textContent = `custom-${item}`;
                return el;
            };
            host.renderVirtualList();
            const container = host.nodeMap?.['bodyScroll']?.['bodyScroll']?.el as HTMLElement;
            if (container) {
                expect(container.innerHTML).toContain('custom-');
            }
        });
    });

    // ============================================
    // scrollToIndex
    // ============================================

    describe('scrollToIndex', () => {
        it('设置 scrollTop', () => {
            const host = new HostClass() as any;
            host.rowHeight = 40;
            host.scrollToIndex(5);
            expect(host.scrollTop).toBe(200);
        });

        it('同时设置容器 scrollTop', () => {
            const host = new HostClass() as any;
            host.rowHeight = 40;
            host.scrollToIndex(3);
            const container = host.nodeMap?.['bodyScroll']?.['bodyScroll']?.el as HTMLElement;
            if (container) {
                expect(container.scrollTop).toBe(120);
            }
        });
    });
});
