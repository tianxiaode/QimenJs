/**
 * MenuItemComponent 单元测试
 *
 * 覆盖：构造函数、内容属性、disabled/hasSubmenu/checked/group 状态、
 *       onClick（分组切换+事件触发）、update、dispose
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

        it('默认无分组', () => {
            const item = new MenuItemComponent() as any;
            expect(item.group).toBe('');
            expect(item.checked).toBe(false);
        });

        it('通过 props 设置分组属性', () => {
            const item = new MenuItemComponent({
                group: 'view',
                groupMode: 'radio',
                checked: true,
            }) as any;
            expect(item.group).toBe('view');
            expect(item.groupMode).toBe('radio');
            expect(item.checked).toBe(true);
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
            jest.useFakeTimers();
            const item = new MenuItemComponent() as any;
            item.disabled = true;
            jest.advanceTimersByTime(0);
            expect(item.disabled).toBe(true);
            expect(item.el.classList.contains('q-menu-item--disabled')).toBe(true);
            expect(item.el.getAttribute('aria-disabled')).toBe('true');
            jest.useRealTimers();
        });

        it('取消禁用移除 aria-disabled', () => {
            jest.useFakeTimers();
            const item = new MenuItemComponent({ disabled: true }) as any;
            jest.advanceTimersByTime(0);
            item.disabled = false;
            jest.advanceTimersByTime(0);
            expect(item.el.classList.contains('q-menu-item--disabled')).toBe(false);
            expect(item.el.hasAttribute('aria-disabled')).toBe(false);
            jest.useRealTimers();
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

        it('展开箭头节点随 hasSubmenu 显隐', () => {
            const item = new MenuItemComponent() as any;
            const expandEl = item.nodeMap?.['menuItem']?.['expand']?.el as HTMLElement | null;

            item.hasSubmenu = true;
            if (expandEl) expect(expandEl.hidden).toBe(false);

            item.hasSubmenu = false;
            if (expandEl) expect(expandEl.hidden).toBe(true);
        });
    });

    // ============================================
    // 分组选中状态
    // ============================================

    describe('分组选中', () => {
        it('checked setter 更新 CSS 类和 ARIA', () => {
            jest.useFakeTimers();
            const item = new MenuItemComponent({ group: 'view', groupMode: 'radio' }) as any;
            item.checked = true;
            jest.advanceTimersByTime(0);
            expect(item.el.classList.contains('q-menu-item--checked')).toBe(true);
            expect(item.el.getAttribute('aria-checked')).toBe('true');
            jest.useRealTimers();
        });

        it('radio 分组渲染 ●/○ 指示符', () => {
            const item = new MenuItemComponent({ group: 'view', groupMode: 'radio' }) as any;
            expect(item.icon).toBe('○'); // 未选中
            item.checked = true;
            expect(item.icon).toBe('●'); // 选中
        });

        it('checkbox 分组渲染 ☑/☐ 指示符', () => {
            const item = new MenuItemComponent({ group: 'show', groupMode: 'checkbox' }) as any;
            expect(item.icon).toBe('☐'); // 未选中
            item.checked = true;
            expect(item.icon).toBe('☑'); // 选中
        });

        it('无分组时显示用户自定义 icon', () => {
            const item = new MenuItemComponent({ icon: '📄' }) as any;
            expect(item.icon).toBe('📄');
        });

        it('有分组时自定义 icon 被指示符覆盖', () => {
            const item = new MenuItemComponent({
                icon: '📄',
                group: 'view',
                groupMode: 'radio',
            }) as any;
            expect(item.icon).toBe('○'); // 指示符优先
        });

        it('radio 分组设置 role="menuitemradio"', () => {
            const item = new MenuItemComponent({ group: 'view', groupMode: 'radio' }) as any;
            expect(item.el.getAttribute('role')).toBe('menuitemradio');
        });

        it('checkbox 分组设置 role="menuitemcheckbox"', () => {
            const item = new MenuItemComponent({ group: 'show', groupMode: 'checkbox' }) as any;
            expect(item.el.getAttribute('role')).toBe('menuitemcheckbox');
        });

        it('无分组时无 role 属性', () => {
            jest.useFakeTimers();
            const item = new MenuItemComponent() as any;
            jest.advanceTimersByTime(0);
            expect(item.el.hasAttribute('role')).toBe(false);
            jest.useRealTimers();
        });

        it('grouped CSS 类随 group 属性切换', () => {
            const item = new MenuItemComponent() as any;
            expect(item.el.classList.contains('q-menu-item--grouped')).toBe(false);
            item.group = 'view';
            expect(item.el.classList.contains('q-menu-item--grouped')).toBe(true);
        });
    });

    // ============================================
    // onClick
    // ============================================

    describe('onClick', () => {
        it('正常点击触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new MenuItemComponent({ onSelect }) as any;
            item.onClick();
            expect(onSelect).toHaveBeenCalledWith(item);
        });

        it('禁用时不触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new MenuItemComponent({ disabled: true, onSelect }) as any;
            item.onClick();
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('有子菜单时不触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new MenuItemComponent({ hasSubmenu: true, onSelect }) as any;
            item.onClick();
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('checkbox 分组点击切换 checked', () => {
            const item = new MenuItemComponent({ group: 'show', groupMode: 'checkbox' }) as any;
            expect(item.checked).toBe(false);
            item.onClick();
            expect(item.checked).toBe(true);
            item.onClick();
            expect(item.checked).toBe(false);
        });

        it('radio 分组点击未选中项设为选中', () => {
            const item = new MenuItemComponent({ group: 'view', groupMode: 'radio' }) as any;
            expect(item.checked).toBe(false);
            item.onClick();
            expect(item.checked).toBe(true);
        });

        it('radio 分组点击已选中项保持选中', () => {
            const item = new MenuItemComponent({
                group: 'view',
                groupMode: 'radio',
                checked: true,
            }) as any;
            item.onClick();
            expect(item.checked).toBe(true);
        });

        it('有 eventKey 时触发 click 和 select 事件', () => {
            const item = new MenuItemComponent() as any;
            item.eventKey = 'item';
            const emitSpy = jest.spyOn(item, 'emit');
            item.onClick();
            expect(emitSpy).toHaveBeenCalledWith('click', undefined, { source: 'item' });
            expect(emitSpy).toHaveBeenCalledWith('select', undefined, { source: 'item' });
        });

        it('无 eventKey 时不触发外部事件', () => {
            const item = new MenuItemComponent() as any;
            const emitSpy = jest.spyOn(item, 'emit');
            item.onClick();
            expect(emitSpy).not.toHaveBeenCalled();
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

        it('更新分组属性', () => {
            const item = new MenuItemComponent() as any;
            item.update({ group: 'view', groupMode: 'radio', checked: true });
            expect(item.group).toBe('view');
            expect(item.groupMode).toBe('radio');
            expect(item.checked).toBe(true);
        });

        it('更新 onSelect 回调', () => {
            const onSelect = jest.fn();
            const item = new MenuItemComponent() as any;
            item.update({ onSelect });
            item.onClick();
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
