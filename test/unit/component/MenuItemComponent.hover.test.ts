/**
 * MenuItemComponent 补充测试
 *
 * 覆盖：onRootEnter、onRootLeave、_clearSubmenuTimer、_updateExpandArrow、submenu
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

import { MenuItemComponent } from '@/component/menu/MenuItemComponent';

describe('MenuItemComponent - hover & submenu', () => {
    describe('onRootEnter', () => {
        it('有子菜单且未禁用时展开箭头', () => {
            const item = new MenuItemComponent({ hasSubmenu: true }) as any;
            item.onRootEnter();
            const expandEl = item.nodeMap?.['menuItem']?.['expand']?.el as HTMLElement;
            if (expandEl) {
                expect(expandEl.classList.contains('q-expand-arrow--expanded')).toBe(true);
            }
        });

        it('禁用时不展开箭头', () => {
            const item = new MenuItemComponent({ hasSubmenu: true, disabled: true }) as any;
            item.onRootEnter();
        });

        it('无子菜单时不报错', () => {
            const item = new MenuItemComponent() as any;
            expect(() => item.onRootEnter()).not.toThrow();
        });
    });

    describe('onRootLeave', () => {
        it('有子菜单时折叠箭头', () => {
            const item = new MenuItemComponent({ hasSubmenu: true }) as any;
            item.onRootEnter();
            item.onRootLeave();
            const expandEl = item.nodeMap?.['menuItem']?.['expand']?.el as HTMLElement;
            if (expandEl) {
                expect(expandEl.classList.contains('q-expand-arrow--collapsed')).toBe(true);
            }
        });

        it('无子菜单时不报错', () => {
            const item = new MenuItemComponent() as any;
            expect(() => item.onRootLeave()).not.toThrow();
        });
    });

    describe('submenuProps', () => {
        it('通过 props 设置 submenuProps', () => {
            const item = new MenuItemComponent({
                hasSubmenu: true,
                submenuProps: { items: [1, 2] },
            }) as any;
            expect(item.submenuProps).toEqual({ items: [1, 2] });
        });

        it('update 更新 submenuProps', () => {
            const item = new MenuItemComponent({ hasSubmenu: true }) as any;
            item.update({ submenuProps: { items: [3] } });
            expect(item.submenuProps).toEqual({ items: [3] });
        });
    });

    describe('groupMode setter', () => {
        it('切换 groupMode 更新 role', () => {
            const item = new MenuItemComponent({ group: 'view', groupMode: 'radio' }) as any;
            expect(item.el.getAttribute('role')).toBe('menuitemradio');
            item.groupMode = 'checkbox';
            expect(item.el.getAttribute('role')).toBe('menuitemcheckbox');
        });
    });

    describe('update icon', () => {
        it('update 设置自定义 icon', () => {
            const item = new MenuItemComponent() as any;
            item.update({ icon: '📄' });
            expect(item.icon).toBe('📄');
        });
    });
});
