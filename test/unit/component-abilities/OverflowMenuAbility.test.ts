/**
 * OverflowMenuAbility 单元测试
 *
 * 覆盖：initOverflowMenu、recalcOverflowItems、toggleOverflowMenu、
 *       openOverflowMenu、closeOverflowMenu、getOverflowItems、cleanup
 *
 * 重构后 OverflowMenuAbility 委托给 MenuComponent 管理菜单项，
 * 不再直接操作 toolbar:menuPanel。
 * 测试通过 mock ComponentRegistrar 来验证 MenuComponent 的创建和调用。
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

import { TemplateComponent, TOOLBAR_TEMPLATE, ComponentRegistrar } from '@/component-core';
import { OverflowMenuAbility } from '@/component-abilities/render/OverflowMenuAbility';
import type { OverflowMenuItem } from '@/component-abilities/render/OverflowMenuAbility';

/**
 * 创建测试用宿主类
 */
const TestHost = TemplateComponent
    .withTemplate(TOOLBAR_TEMPLATE)
    .with([OverflowMenuAbility]);

/**
 * 手动补充 nodeMap（compileTemplate 不生成 data-content，nodeMap 已由 _buildNodeMapFromCompiled 构建）
 */
function buildManualNodeMap(host: any): void {
    // nodeMap 已由编译时自动构建，无需手动补充
}

/**
 * Mock MenuComponent 类
 */
function createMockMenuClass() {
    return jest.fn().mockImplementation((props?: any) => ({
        _anchor: props?.anchor ?? null,
        open: jest.fn(),
        close: jest.fn(),
        dispose: jest.fn(),
        setMenuItems: jest.fn(),
        el: document.createElement('div'),
    }));
}

describe('OverflowMenuAbility', () => {

    let mockMenuClass: ReturnType<typeof createMockMenuClass>;
    let originalGet: typeof ComponentRegistrar.prototype.get;

    beforeEach(() => {
        mockMenuClass = createMockMenuClass();
        // Mock ComponentRegistrar.getInstance().get('Menu')
        const instance = ComponentRegistrar.getInstance();
        originalGet = instance.get.bind(instance);
        instance.get = jest.fn((type: string) => {
            if (type === 'Menu') return mockMenuClass;
            return originalGet(type);
        });
    });

    afterEach(() => {
        const instance = ComponentRegistrar.getInstance();
        instance.get = originalGet;
    });

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

        it('通过 MenuComponent.setMenuItems 更新菜单项', () => {
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

            // MenuComponent 应该被创建
            expect(mockMenuClass).toHaveBeenCalledTimes(1);

            // setMenuItems 应该被调用
            const menuInstance = host.getOverflowMenu('menuInstance');
            expect(menuInstance.setMenuItems).toHaveBeenCalledTimes(1);
            expect(menuInstance.setMenuItems).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ key: 'key-1', text: 'Item 2' }),
                    expect.objectContaining({ key: 'key-2', text: 'Item 3' }),
                ]),
            );
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

            // 先添加溢出项，否则 triggerBtn 隐藏
            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                contentArea.appendChild(child);
            }
            host.recalcOverflowItems();

            host.openOverflowMenu();
            expect(host.getOverflowMenu('isMenuOpen')).toBe(true);
        });

        it('closeOverflowMenu 设置 isMenuOpen 为 false', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                contentArea.appendChild(child);
            }
            host.recalcOverflowItems();

            host.openOverflowMenu();
            host.closeOverflowMenu();
            expect(host.getOverflowMenu('isMenuOpen')).toBe(false);
        });

        it('toggleOverflowMenu 切换状态', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                contentArea.appendChild(child);
            }
            host.recalcOverflowItems();

            host.toggleOverflowMenu();
            expect(host.getOverflowMenu('isMenuOpen')).toBe(true);

            host.toggleOverflowMenu();
            expect(host.getOverflowMenu('isMenuOpen')).toBe(false);
        });

        it('openOverflowMenu 调用 MenuComponent.open', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                contentArea.appendChild(child);
            }
            host.recalcOverflowItems();

            host.openOverflowMenu();

            const menuInstance = host.getOverflowMenu('menuInstance');
            expect(menuInstance.open).toHaveBeenCalledTimes(1);
        });

        it('closeOverflowMenu 调用 MenuComponent.close', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                contentArea.appendChild(child);
            }
            host.recalcOverflowItems();

            host.openOverflowMenu();
            host.closeOverflowMenu();

            const menuInstance = host.getOverflowMenu('menuInstance');
            expect(menuInstance.close).toHaveBeenCalledTimes(1);
        });

        it('openOverflowMenu 添加 trigger--active 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                contentArea.appendChild(child);
            }
            host.recalcOverflowItems();

            const triggerBtn = host.nodeMap['toolbar']['triggerBtn'].el;
            host.openOverflowMenu();
            expect(triggerBtn.classList.contains('q-overflow-menu__trigger--active')).toBe(true);
        });

        it('closeOverflowMenu 移除 trigger--active 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.textContent = `Item ${i + 1}`;
                contentArea.appendChild(child);
            }
            host.recalcOverflowItems();

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
    // _getOrCreateMenu (池化复用)
    // ============================================

    describe('_getOrCreateMenu', () => {
        it('首次调用创建 MenuComponent 实例', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            const menu = host._getOrCreateMenu();
            expect(menu).toBeTruthy();
            expect(mockMenuClass).toHaveBeenCalledTimes(1);
        });

        it('后续调用复用同一实例', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            const menu1 = host._getOrCreateMenu();
            const menu2 = host._getOrCreateMenu();
            expect(menu1).toBe(menu2);
            expect(mockMenuClass).toHaveBeenCalledTimes(1);
        });

        it('horizontal 方向使用 bottom-end 定位', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'horizontal' });

            host._getOrCreateMenu();
            expect(mockMenuClass).toHaveBeenCalledWith(
                expect.objectContaining({ placement: 'bottom-end' }),
            );
        });

        it('vertical 方向使用 left-start 定位', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowMenu({ direction: 'vertical' });

            host._getOrCreateMenu();
            expect(mockMenuClass).toHaveBeenCalledWith(
                expect.objectContaining({ placement: 'left-start' }),
            );
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

        it('dispose 后销毁 MenuComponent 实例', () => {
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

            const menuInstance = host.getOverflowMenu('menuInstance');
            expect(menuInstance).toBeTruthy();

            host.dispose();
            expect(menuInstance.dispose).toHaveBeenCalledTimes(1);
            container.remove();
        });
    });
});
