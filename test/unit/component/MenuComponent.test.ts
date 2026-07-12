/**
 * MenuComponent 单元测试
 *
 * 覆盖：构造函数、open/close、浮层协议、菜单项管理、dispose
 *
 * 注意：MenuComponent 依赖 OverlayRoot（需要 document.body），
 * 测试中需要确保 OverlayRoot 容器存在。
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

import { MenuComponent } from '@/component/menu/MenuComponent';
import { MenuItemComponent } from '@/component/menu/MenuItemComponent';
import { ComponentRegistrar } from '@qimenjs/component-core';

// 注册 MenuItem 组件（MenuComponent 的 MenuItemManageAbility 依赖）
beforeAll(() => {
    const registrar = ComponentRegistrar.getInstance();
    if (!registrar.get('MenuItem')) {
        registrar.register('MenuItem', MenuItemComponent);
    }
});

describe('MenuComponent', () => {

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el 并添加 q-menu 类', () => {
            const menu = new MenuComponent() as any;
            expect(menu.el).toBeInstanceOf(HTMLElement);
            expect(menu.el.classList.contains('q-menu')).toBe(true);
        });

        it('type 为 Menu', () => {
            const menu = new MenuComponent() as any;
            expect(menu.type).toBe('Menu');
        });

        it('初始状态为关闭', () => {
            const menu = new MenuComponent() as any;
            expect(menu.isOpen).toBe(false);
        });

        it('初始 display 为 none', () => {
            const menu = new MenuComponent() as any;
            expect(menu.el.style.display).toBe('none');
        });

        it('通过 props 设置 placement', () => {
            const menu = new MenuComponent({ placement: 'right' }) as any;
            expect(menu._placement).toBe('right');
        });

        it('通过 props 设置 offset', () => {
            const menu = new MenuComponent({ offset: 8 }) as any;
            expect(menu._offset).toBe(8);
        });

        it('通过 props 初始化菜单项', () => {
            const menu = new MenuComponent({
                items: [
                    { text: '新建' },
                    { text: '打开' },
                ],
            }) as any;
            expect(menu.getMenuItemCount()).toBe(2);
        });
    });

    // ============================================
    // open / close
    // ============================================

    describe('open / close', () => {
        it('open 设置 isOpen 为 true', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);
            const menu = new MenuComponent({ anchor }) as any;
            menu.open();
            expect(menu.isOpen).toBe(true);
            expect(menu.el.style.display).not.toBe('none');
            menu.close();
            anchor.remove();
        });

        it('close 设置 isOpen 为 false', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);
            const menu = new MenuComponent({ anchor }) as any;
            menu.open();
            menu.close();
            expect(menu.isOpen).toBe(false);
            expect(menu.el.style.display).toBe('none');
            anchor.remove();
        });

        it('重复 open 不报错', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);
            const menu = new MenuComponent({ anchor }) as any;
            menu.open();
            menu.open(); // 不应报错
            expect(menu.isOpen).toBe(true);
            menu.close();
            anchor.remove();
        });

        it('未 open 时 close 不报错', () => {
            const menu = new MenuComponent() as any;
            menu.close(); // 不应报错
            expect(menu.isOpen).toBe(false);
        });

        it('open 后点击外部关闭', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);
            const menu = new MenuComponent({ anchor }) as any;
            menu.open();
            expect(menu.isOpen).toBe(true);

            // 模拟点击外部
            const outsideEl = document.createElement('div');
            document.body.appendChild(outsideEl);
            outsideEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

            expect(menu.isOpen).toBe(false);
            outsideEl.remove();
            anchor.remove();
        });
    });

    // ============================================
    // 菜单项管理（通过 MenuItemManageAbility）
    // ============================================

    describe('菜单项管理', () => {
        it('setMenuItems 创建菜单项', () => {
            const menu = new MenuComponent() as any;
            menu.setMenuItems([
                { text: '新建' },
                { text: '打开' },
                { text: '保存' },
            ]);
            expect(menu.getMenuItemCount()).toBe(3);
        });

        it('setMenuItems 池化复用：减少项时隐藏多余项', () => {
            const menu = new MenuComponent() as any;
            menu.setMenuItems([
                { text: '新建' },
                { text: '打开' },
                { text: '保存' },
            ]);

            menu.setMenuItems([
                { text: '新建' },
                { text: '打开' },
            ]);

            // 第三项应被隐藏
            const pool = menu.getMenuItemPool();
            expect(pool.length).toBe(3); // 池中仍有3个
            expect(pool[2].el.hidden).toBe(true);
        });

        it('setMenuItems 池化复用：增加项时新增', () => {
            const menu = new MenuComponent() as any;
            menu.setMenuItems([{ text: '新建' }]);
            menu.setMenuItems([
                { text: '新建' },
                { text: '打开' },
            ]);

            const pool = menu.getMenuItemPool();
            expect(pool.length).toBe(2);
        });

        it('updateMenuItem 更新单项', () => {
            const menu = new MenuComponent() as any;
            menu.setMenuItems([{ text: '新建' }]);
            menu.updateMenuItem(0, { text: '创建' });

            const item = menu.getMenuItem(0);
            expect(item.text).toBe('创建');
        });

        it('removeMenuItem 默认隐藏不销毁', () => {
            const menu = new MenuComponent() as any;
            menu.setMenuItems([{ text: '新建' }, { text: '打开' }]);
            menu.removeMenuItem(0);

            const pool = menu.getMenuItemPool();
            expect(pool.length).toBe(2); // 未销毁
            expect(pool[0].el.hidden).toBe(true);
        });

        it('removeMenuItem destroy=true 销毁实例', () => {
            const menu = new MenuComponent() as any;
            menu.setMenuItems([{ text: '新建' }, { text: '打开' }]);
            menu.removeMenuItem(0, true);

            const pool = menu.getMenuItemPool();
            expect(pool.length).toBe(1); // 已销毁
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const menu = new MenuComponent() as any;
            const el = menu.el;
            menu.dispose();
            expect(document.contains(el)).toBe(false);
        });

        it('dispose 关闭已打开的菜单', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);
            const menu = new MenuComponent({ anchor }) as any;
            menu.open();
            expect(menu.isOpen).toBe(true);
            menu.dispose();
            anchor.remove();
        });

        it('dispose 销毁所有菜单项', () => {
            const menu = new MenuComponent() as any;
            menu.setMenuItems([
                { text: '新建' },
                { text: '打开' },
            ]);
            menu.dispose();
            const pool = menu.getMenuItemPool();
            expect(pool.length).toBe(0);
        });
    });
});
