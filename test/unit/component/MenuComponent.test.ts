/**
 * MenuComponent 单元测试
 *
 * 覆盖：构造函数、open/close、浮层协议、内置 ItemGroup、
 *       分组选中（GroupSelectAbility）、dispose
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
import { ComponentRegistrar, TemplateComponent } from '@qimenjs/component-core';

// 注册 MenuItem 组件
beforeAll(() => {
    const registrar = ComponentRegistrar.getInstance();
    if (!registrar.get('MenuItem')) {
        registrar.register('MenuItem', MenuItemComponent);
    }
    if (!registrar.get('Icon')) {
        class MockIcon extends TemplateComponent { type = 'Icon'; tag = 'i'; }
        registrar.register('Icon', MockIcon);
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

        it('通过 props 初始化菜单项（内置 ItemGroup）', () => {
            const menu = new MenuComponent({
                items: [
                    { text: '新建' },
                    { text: '打开' },
                ],
            }) as any;
            expect(menu.itemGroup.count).toBe(2);
        });

        it('通过 itemType 替换子项组件类型', () => {
            const menu = new MenuComponent({
                itemType: 'MenuItem',
                items: [{ text: '测试' }],
            }) as any;
            expect(menu.itemGroup.itemType).toBe('MenuItem');
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
            menu.open();
            expect(menu.isOpen).toBe(true);
            menu.close();
            anchor.remove();
        });

        it('未 open 时 close 不报错', () => {
            const menu = new MenuComponent() as any;
            menu.close();
            expect(menu.isOpen).toBe(false);
        });

        it('open 后点击外部关闭', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);
            const menu = new MenuComponent({ anchor }) as any;
            menu.open();
            expect(menu.isOpen).toBe(true);

            const outsideEl = document.createElement('div');
            document.body.appendChild(outsideEl);
            outsideEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

            expect(menu.isOpen).toBe(false);
            outsideEl.remove();
            anchor.remove();
        });
    });

    // ============================================
    // 内置 ItemGroup
    // ============================================

    describe('内置 ItemGroup', () => {
        it('itemGroup 属性可访问', () => {
            const menu = new MenuComponent() as any;
            expect(menu.itemGroup).toBeDefined();
        });

        it('通过 itemGroup 增删菜单项', () => {
            const menu = new MenuComponent() as any;
            menu.itemGroup.add({ text: '新增' });
            expect(menu.itemGroup.count).toBe(1);

            menu.itemGroup.removeAt(0);
            expect(menu.itemGroup.count).toBe(0);
        });

        it('通过 itemGroup setItems 池化复用', () => {
            const menu = new MenuComponent() as any;
            menu.itemGroup.setItems([{ text: 'A' }, { text: 'B' }, { text: 'C' }]);
            expect(menu.itemGroup.count).toBe(3);

            menu.itemGroup.setItems([{ text: 'X' }]);
            expect(menu.itemGroup.count).toBe(1);
            expect(menu.itemGroup.pool.length).toBe(3); // 池中仍有3个
        });
    });

    // ============================================
    // 分组选中（GroupSelectAbility）
    // ============================================

    describe('分组选中', () => {
        it('radio 分组：点击一项自动取消同组其他项', () => {
            const menu = new MenuComponent({
                items: [
                    { text: '大图标', group: 'view', groupMode: 'radio', checked: true },
                    { text: '小图标', group: 'view', groupMode: 'radio' },
                ],
            }) as any;

            const items = menu.itemGroup.items;
            expect(items[0].checked).toBe(true);
            expect(items[1].checked).toBe(false);

            // 模拟点击第二项
            items[1].onClick();
            menu.notifyGroupSelect(items[1]);

            expect(items[1].checked).toBe(true);
            expect(items[0].checked).toBe(false);
        });

        it('checkbox 分组：各项独立切换', () => {
            const menu = new MenuComponent({
                items: [
                    { text: '状态栏', group: 'show', groupMode: 'checkbox' },
                    { text: '工具栏', group: 'show', groupMode: 'checkbox' },
                ],
            }) as any;

            const items = menu.itemGroup.items;
            items[0].onClick();
            items[1].onClick();

            expect(items[0].checked).toBe(true);
            expect(items[1].checked).toBe(true);
        });

        it('getGroupChecked 查询 radio 选中项', () => {
            const menu = new MenuComponent({
                items: [
                    { text: '大图标', group: 'view', groupMode: 'radio', checked: true },
                    { text: '小图标', group: 'view', groupMode: 'radio' },
                ],
            }) as any;

            const checked = menu.getGroupChecked('view');
            expect(checked).toBe(menu.itemGroup.items[0]);
        });

        it('getGroupChecked 查询 checkbox 选中项', () => {
            const menu = new MenuComponent({
                items: [
                    { text: '状态栏', group: 'show', groupMode: 'checkbox', checked: true },
                    { text: '工具栏', group: 'show', groupMode: 'checkbox' },
                ],
            }) as any;

            const checked = menu.getGroupChecked('show');
            expect(checked).toHaveLength(1);
            expect(checked[0]).toBe(menu.itemGroup.items[0]);
        });

        it('setGroupChecked 程序化设置选中项', () => {
            const menu = new MenuComponent({
                items: [
                    { text: '大图标', group: 'view', groupMode: 'radio' },
                    { text: '小图标', group: 'view', groupMode: 'radio' },
                ],
            }) as any;

            menu.setGroupChecked('view', 1);
            expect(menu.itemGroup.items[1].checked).toBe(true);
            expect(menu.itemGroup.items[0].checked).toBe(false);
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

        it('dispose 销毁内置 ItemGroup', () => {
            const menu = new MenuComponent({
                items: [{ text: '新建' }, { text: '打开' }],
            }) as any;
            menu.dispose();
            expect(menu.itemGroup.pool.length).toBe(0);
        });
    });
});
