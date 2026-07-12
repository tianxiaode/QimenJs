/**
 * OverflowMenuAbility 单元测试
 *
 * 覆盖：initOverflowMenu、recalcOverflowItems、toggleOverflowMenu、
 *       openOverflowMenu、closeOverflowMenu、getOverflowItems、cleanup
 *
 * 由于 precompileTemplate 在多顶级元素模板中无法正确解析 data-content，
 * 测试通过手动创建 DOM 结构 + 直接调用能力方法来验证逻辑。
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

import { TemplateComponent, TOOLBAR_TEMPLATE } from '@/component-core';
import { OverflowMenuAbility } from '@/component-abilities/render/OverflowMenuAbility';
import type { OverflowMenuItem } from '@/component-abilities/render/OverflowMenuAbility';

/**
 * 创建测试用宿主类
 */
const TestHost = TemplateComponent
    .withTemplate(TOOLBAR_TEMPLATE)
    .with([OverflowMenuAbility]);

/**
 * 手动构建 nodeMap（因为 precompileTemplate 无法解析多顶级元素模板）
 */
function buildManualNodeMap(host: any): void {
    const el = host.el;
    host.nodeMap = host.nodeMap || {};
    host.nodeMap['toolbar'] = {};

    const contentArea = el.querySelector('[data-content="toolbar:contentArea"]');
    const prevBtn = el.querySelector('[data-content="toolbar:prevBtn"]');
    const nextBtn = el.querySelector('[data-content="toolbar:nextBtn"]');
    const triggerBtn = el.querySelector('[data-content="toolbar:triggerBtn"]');
    const menuPanel = el.querySelector('[data-content="toolbar:menuPanel"]');

    if (contentArea) host.nodeMap['toolbar']['contentArea'] = { el: contentArea };
    if (prevBtn) host.nodeMap['toolbar']['prevBtn'] = { el: prevBtn };
    if (nextBtn) host.nodeMap['toolbar']['nextBtn'] = { el: nextBtn };
    if (triggerBtn) host.nodeMap['toolbar']['triggerBtn'] = { el: triggerBtn };
    if (menuPanel) host.nodeMap['toolbar']['menuPanel'] = { el: menuPanel };
}

describe('OverflowMenuAbility', () => {

    // ============================================
    // initOverflowMenu
    // ============================================

    describe('initOverflowMenu', () => {
        it('添加 q-overflow-menu-container 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            expect(host.el.classList.contains('q-overflow-menu-container')).toBe(true);
            expect(host.el.classList.contains('q-overflow-menu-container--horizontal')).toBe(true);
        });

        it('vertical 方向添加 q-overflow-menu-container--vertical 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'vertical' });
            expect(host.el.classList.contains('q-overflow-menu-container--vertical')).toBe(true);
        });

        it('contentArea 添加 q-overflow-menu__visible 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            expect(contentArea.classList.contains('q-overflow-menu__visible')).toBe(true);
        });

        it('triggerBtn 添加方向类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            const triggerBtn = host.nodeMap['toolbar']['triggerBtn'].el;
            expect(triggerBtn.classList.contains('q-overflow-menu__trigger--horizontal')).toBe(true);
        });

        it('menuPanel 添加方向类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            const menuPanel = host.nodeMap['toolbar']['menuPanel'].el;
            expect(menuPanel.classList.contains('q-overflow-menu__panel--horizontal')).toBe(true);
        });

        it('存储 direction 和 maxVisibleItems 到 abilityState', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'vertical', maxVisibleItems: 3 });
            expect(host.getOverflowMenu('direction')).toBe('vertical');
            expect(host.getOverflowMenu('maxVisibleItems')).toBe(3);
        });

        it('默认 maxVisibleItems 为 0', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({});
            expect(host.getOverflowMenu('maxVisibleItems')).toBe(0);
        });

        it('isMenuOpen 初始为 false', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({});
            expect(host.getOverflowMenu('isMenuOpen')).toBe(false);
        });

        it('缺少必要节点时不报错', () => {
            const host = new (TestHost as any)();
            host.nodeMap = {};
            expect(() => host.initOverflowMenu({ direction: 'horizontal' })).not.toThrow();
        });
    });

    // ============================================
    // recalcOverflowItems
    // ============================================

    describe('recalcOverflowItems', () => {
        it('无子项时 triggerBtn 隐藏', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            const triggerBtn = host.nodeMap['toolbar']['triggerBtn'].el;

            host.recalcOverflowItems();
            expect(triggerBtn.hidden).toBe(true);
        });

        it('maxVisibleItems 限制时隐藏超出子项', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal', maxVisibleItems: 2 });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 4; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                child.setAttribute('data-key', `item-${i}`);
                contentArea.appendChild(child);
            }

            host.recalcOverflowItems();

            const children = Array.from(contentArea.children) as HTMLElement[];
            expect(children[0].hidden).toBe(false);
            expect(children[1].hidden).toBe(false);
            expect(children[2].hidden).toBe(true);
            expect(children[3].hidden).toBe(true);

            const triggerBtn = host.nodeMap['toolbar']['triggerBtn'].el;
            expect(triggerBtn.hidden).toBe(false);
        });

        it('maxVisibleItems 限制时生成正确的 overflowItems', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal', maxVisibleItems: 1 });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                child.setAttribute('data-key', `key-${i}`);
                contentArea.appendChild(child);
            }

            host.recalcOverflowItems();

            const items = host.getOverflowItems() as OverflowMenuItem[];
            expect(items).toHaveLength(2);
            expect(items[0].key).toBe('key-1');
            expect(items[1].key).toBe('key-2');
        });

        it('所有子项可见时 triggerBtn 隐藏', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal', maxVisibleItems: 10 });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            const child = document.createElement('div');
            child.textContent = 'Item 1';
            contentArea.appendChild(child);

            host.recalcOverflowItems();

            const triggerBtn = host.nodeMap['toolbar']['triggerBtn'].el;
            expect(triggerBtn.hidden).toBe(true);
        });
    });

    // ============================================
    // toggleOverflowMenu / openOverflowMenu / closeOverflowMenu
    // ============================================

    describe('菜单开关', () => {
        it('openOverflowMenu 设置 isMenuOpen 为 true', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            host.openOverflowMenu();
            expect(host.getOverflowMenu('isMenuOpen')).toBe(true);
        });

        it('closeOverflowMenu 设置 isMenuOpen 为 false', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            host.openOverflowMenu();
            host.closeOverflowMenu();
            expect(host.getOverflowMenu('isMenuOpen')).toBe(false);
        });

        it('toggleOverflowMenu 切换状态', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            host.toggleOverflowMenu();
            expect(host.getOverflowMenu('isMenuOpen')).toBe(true);

            host.toggleOverflowMenu();
            expect(host.getOverflowMenu('isMenuOpen')).toBe(false);
        });

        it('openOverflowMenu 显示 menuPanel', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            const menuPanel = host.nodeMap['toolbar']['menuPanel'].el;

            host.openOverflowMenu();
            expect(menuPanel.hidden).toBe(false);
        });

        it('closeOverflowMenu 隐藏 menuPanel', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            const menuPanel = host.nodeMap['toolbar']['menuPanel'].el;

            host.openOverflowMenu();
            host.closeOverflowMenu();
            expect(menuPanel.hidden).toBe(true);
        });

        it('openOverflowMenu 添加 trigger--active 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            const triggerBtn = host.nodeMap['toolbar']['triggerBtn'].el;

            host.openOverflowMenu();
            expect(triggerBtn.classList.contains('q-overflow-menu__trigger--active')).toBe(true);
        });

        it('closeOverflowMenu 移除 trigger--active 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            const triggerBtn = host.nodeMap['toolbar']['triggerBtn'].el;

            host.openOverflowMenu();
            host.closeOverflowMenu();
            expect(triggerBtn.classList.contains('q-overflow-menu__trigger--active')).toBe(false);
        });
    });

    // ============================================
    // getOverflowItems
    // ============================================

    describe('getOverflowItems', () => {
        it('未初始化时返回空数组', () => {
            const host = new (TestHost as any)();
            const items = host.getOverflowItems();
            expect(items).toEqual([]);
        });
    });

    // ============================================
    // cleanup (onCleanup)
    // ============================================

    describe('cleanup', () => {
        it('dispose 后 contentArea 移除 q-overflow-menu__visible 类', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const host = new (TestHost as any)();
            container.appendChild(host.el);
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });
            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            expect(contentArea.classList.contains('q-overflow-menu__visible')).toBe(true);

            host.dispose();
            expect(contentArea.classList.contains('q-overflow-menu__visible')).toBe(false);
            container.remove();
        });

        it('dispose 后隐藏的子项恢复显示', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const host = new (TestHost as any)();
            container.appendChild(host.el);
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal', maxVisibleItems: 1 });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                contentArea.appendChild(child);
            }
            host.recalcOverflowItems();

            const children = Array.from(contentArea.children) as HTMLElement[];
            expect(children[1].hidden).toBe(true);

            host.dispose();
            expect(children[1].hidden).toBe(false);
            container.remove();
        });
    });
});
