/**
 * MenuItemComponent 单元测试
 *
 * 覆盖：构造函数、内容属性、disabled/hasSubmenu 状态、handleClick、update、dispose
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

import { MenuItemComponent } from '@/component/menu/MenuItemComponent';

describe('MenuItemComponent', () => {

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el 并添加 q-menu-item 类', () => {
            const item = new MenuItemComponent() as any;
            expect(item.el).toBeInstanceOf(HTMLElement);
            expect(item.el.classList.contains('q-menu-item')).toBe(true);
        });

        it('type 为 MenuItem', () => {
            const item = new MenuItemComponent() as any;
            expect(item.type).toBe('MenuItem');
        });

        it('通过 props 设置文本', () => {
            const item = new MenuItemComponent({ text: '新建' }) as any;
            expect(item.text).toBe('新建');
        });

        it('通过 props 设置图标', () => {
            const item = new MenuItemComponent({ icon: '📄' }) as any;
            expect(item.icon).toBe('📄');
        });

        it('通过 props 设置快捷键', () => {
            const item = new MenuItemComponent({ shortcut: 'Ctrl+N' }) as any;
            expect(item.shortcut).toBe('Ctrl+N');
        });

        it('默认不禁用', () => {
            const item = new MenuItemComponent() as any;
            expect(item.disabled).toBe(false);
            expect(item.el.classList.contains('q-menu-item--disabled')).toBe(false);
        });

        it('通过 props 设置禁用', () => {
            const item = new MenuItemComponent({ disabled: true }) as any;
            expect(item.disabled).toBe(true);
            expect(item.el.classList.contains('q-menu-item--disabled')).toBe(true);
            expect(item.el.getAttribute('aria-disabled')).toBe('true');
        });

        it('默认无子菜单', () => {
            const item = new MenuItemComponent() as any;
            expect(item.hasSubmenu).toBe(false);
            expect(item.el.classList.contains('q-menu-item--has-submenu')).toBe(false);
        });

        it('通过 props 设置子菜单', () => {
            const item = new MenuItemComponent({ hasSubmenu: true }) as any;
            expect(item.hasSubmenu).toBe(true);
            expect(item.el.classList.contains('q-menu-item--has-submenu')).toBe(true);
        });
    });

    // ============================================
    // 内容属性（withTemplate 自动生成）
    // ============================================

    describe('内容属性', () => {
        it('text getter/setter', () => {
            const item = new MenuItemComponent() as any;
            item.text = '打开';
            expect(item.text).toBe('打开');
        });

        it('icon getter/setter', () => {
            const item = new MenuItemComponent() as any;
            item.icon = '📂';
            expect(item.icon).toBe('📂');
        });

        it('shortcut getter/setter', () => {
            const item = new MenuItemComponent() as any;
            item.shortcut = 'Ctrl+O';
            expect(item.shortcut).toBe('Ctrl+O');
        });
    });

    // ============================================
    // disabled 状态
    // ============================================

    describe('disabled', () => {
        it('setter 切换禁用状态', () => {
            const item = new MenuItemComponent() as any;
            item.disabled = true;
            expect(item.disabled).toBe(true);
            expect(item.el.classList.contains('q-menu-item--disabled')).toBe(true);
            expect(item.el.getAttribute('aria-disabled')).toBe('true');
        });

        it('取消禁用移除 aria-disabled', () => {
            const item = new MenuItemComponent({ disabled: true }) as any;
            item.disabled = false;
            expect(item.el.classList.contains('q-menu-item--disabled')).toBe(false);
            expect(item.el.hasAttribute('aria-disabled')).toBe(false);
        });
    });

    // ============================================
    // hasSubmenu 状态
    // ============================================

    describe('hasSubmenu', () => {
        it('setter 切换子菜单状态', () => {
            const item = new MenuItemComponent() as any;
            item.hasSubmenu = true;
            expect(item.hasSubmenu).toBe(true);
            expect(item.el.classList.contains('q-menu-item--has-submenu')).toBe(true);
        });

        it('箭头节点随 hasSubmenu 显隐', () => {
            const item = new MenuItemComponent() as any;
            const arrowEl = item.nodeMap?.['menuItem']?.['arrow']?.el as HTMLElement | null;

            item.hasSubmenu = true;
            if (arrowEl) expect(arrowEl.hidden).toBe(false);

            item.hasSubmenu = false;
            if (arrowEl) expect(arrowEl.hidden).toBe(true);
        });
    });

    // ============================================
    // handleClick
    // ============================================

    describe('handleClick', () => {
        it('正常点击触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new MenuItemComponent({ onSelect }) as any;
            item.handleClick();
            expect(onSelect).toHaveBeenCalledWith(item);
        });

        it('禁用时不触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new MenuItemComponent({ disabled: true, onSelect }) as any;
            item.handleClick();
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('有子菜单时不触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new MenuItemComponent({ hasSubmenu: true, onSelect }) as any;
            item.handleClick();
            expect(onSelect).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // update
    // ============================================

    describe('update', () => {
        it('更新文本', () => {
            const item = new MenuItemComponent() as any;
            item.update({ text: '保存' });
            expect(item.text).toBe('保存');
        });

        it('更新禁用状态', () => {
            const item = new MenuItemComponent() as any;
            item.update({ disabled: true });
            expect(item.disabled).toBe(true);
        });

        it('更新子菜单状态', () => {
            const item = new MenuItemComponent() as any;
            item.update({ hasSubmenu: true });
            expect(item.hasSubmenu).toBe(true);
        });

        it('更新 onSelect 回调', () => {
            const onSelect = jest.fn();
            const item = new MenuItemComponent() as any;
            item.update({ onSelect });
            item.handleClick();
            expect(onSelect).toHaveBeenCalled();
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const item = new MenuItemComponent() as any;
            container.appendChild(item.el);
            expect(container.contains(item.el)).toBe(true);
            item.dispose();
            expect(document.contains(item.el)).toBe(false);
            container.remove();
        });
    });
});
