/**
 * MenuItemManageAbility 单元测试
 *
 * 覆盖：setMenuItems（池化复用）、updateMenuItem、removeMenuItem、
 *       insertMenuItem、getMenuItem、disposeAllMenuItems
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

import { TemplateComponent, MENU_TEMPLATE } from '@/component-core';
import { MenuItemManageAbility } from '@/component-abilities/menu/MenuItemManageAbility';
import { MenuItemComponent } from '@/component/menu/MenuItemComponent';
import { ComponentRegistrar } from '@qimenjs/component-core';

// 注册 MenuItem 组件
beforeAll(() => {
    const registrar = ComponentRegistrar.getInstance();
    if (!registrar.get('MenuItem')) {
        registrar.register('MenuItem', MenuItemComponent);
    }
});

/**
 * 创建测试用宿主类
 */
const TestHost = TemplateComponent
    .withTemplate(MENU_TEMPLATE)
    .with([MenuItemManageAbility]);

describe('MenuItemManageAbility', () => {

    // ============================================
    // setMenuItems（池化复用核心）
    // ============================================

    describe('setMenuItems', () => {
        it('创建菜单项', () => {
            const host = new TestHost() as any;
            host.setMenuItems([
                { text: '新建' },
                { text: '打开' },
            ]);
            expect(host.getMenuItemCount()).toBe(2);
        });

        it('复用已有项：更新属性', () => {
            const host = new TestHost() as any;
            host.setMenuItems([
                { text: '新建' },
                { text: '打开' },
            ]);

            // 更新第一项文本
            host.setMenuItems([
                { text: '创建' },
                { text: '打开' },
            ]);

            const item = host.getMenuItem(0);
            expect(item.text).toBe('创建');
        });

        it('复用已有项：减少时隐藏多余项', () => {
            const host = new TestHost() as any;
            host.setMenuItems([
                { text: '新建' },
                { text: '打开' },
                { text: '保存' },
            ]);

            host.setMenuItems([{ text: '新建' }]);

            const pool = host.getMenuItemPool();
            expect(pool.length).toBe(3); // 池中仍有3个
            expect(pool[0].el.hidden).toBe(false);
            expect(pool[1].el.hidden).toBe(true);
            expect(pool[2].el.hidden).toBe(true);
        });

        it('增加项时新增', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }]);
            host.setMenuItems([
                { text: '新建' },
                { text: '打开' },
                { text: '保存' },
            ]);

            const pool = host.getMenuItemPool();
            expect(pool.length).toBe(3);
        });

        it('空数组隐藏所有项', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }, { text: '打开' }]);
            host.setMenuItems([]);

            const pool = host.getMenuItemPool();
            expect(pool[0].el.hidden).toBe(true);
            expect(pool[1].el.hidden).toBe(true);
        });

        it('key 映射正确', () => {
            const host = new TestHost() as any;
            host.setMenuItems([
                { key: 'new', text: '新建' },
                { key: 'open', text: '打开' },
            ]);

            const item = host.getMenuItemByKey('new');
            expect(item).not.toBeNull();
            expect(item.text).toBe('新建');
        });
    });

    // ============================================
    // updateMenuItem
    // ============================================

    describe('updateMenuItem', () => {
        it('按索引更新', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }, { text: '打开' }]);
            host.updateMenuItem(0, { text: '创建' });

            const item = host.getMenuItem(0);
            expect(item.text).toBe('创建');
        });

        it('按 key 更新', () => {
            const host = new TestHost() as any;
            host.setMenuItems([
                { key: 'new', text: '新建' },
                { key: 'open', text: '打开' },
            ]);
            host.updateMenuItemByKey('new', { text: '创建' });

            const item = host.getMenuItemByKey('new');
            expect(item.text).toBe('创建');
        });

        it('索引越界不报错', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }]);
            expect(() => host.updateMenuItem(5, { text: '测试' })).not.toThrow();
        });

        it('key 不存在不报错', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }]);
            expect(() => host.updateMenuItemByKey('notexist', { text: '测试' })).not.toThrow();
        });
    });

    // ============================================
    // removeMenuItem
    // ============================================

    describe('removeMenuItem', () => {
        it('默认隐藏不销毁', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }, { text: '打开' }]);
            host.removeMenuItem(0);

            const pool = host.getMenuItemPool();
            expect(pool.length).toBe(2);
            expect(pool[0].el.hidden).toBe(true);
        });

        it('destroy=true 销毁实例', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }, { text: '打开' }]);
            host.removeMenuItem(0, true);

            const pool = host.getMenuItemPool();
            expect(pool.length).toBe(1);
        });

        it('按 key 移除', () => {
            const host = new TestHost() as any;
            host.setMenuItems([
                { key: 'new', text: '新建' },
                { key: 'open', text: '打开' },
            ]);
            host.removeMenuItemByKey('new');

            const pool = host.getMenuItemPool();
            expect(pool[0].el.hidden).toBe(true);
            expect(host.getMenuItemByKey('new')).toBeNull();
        });

        it('索引越界不报错', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }]);
            expect(() => host.removeMenuItem(5)).not.toThrow();
        });
    });

    // ============================================
    // insertMenuItem
    // ============================================

    describe('insertMenuItem', () => {
        it('在指定位置插入', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }, { text: '保存' }]);
            host.insertMenuItem(1, { text: '打开' });

            const pool = host.getMenuItemPool();
            expect(pool.length).toBe(3);
            expect(pool[1].text).toBe('打开');
        });

        it('在末尾插入', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }]);
            host.insertMenuItem(1, { text: '打开' });

            const pool = host.getMenuItemPool();
            expect(pool.length).toBe(2);
        });

        it('插入带 key 的项', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }]);
            host.insertMenuItem(1, { key: 'open', text: '打开' });

            const item = host.getMenuItemByKey('open');
            expect(item).not.toBeNull();
            expect(item.text).toBe('打开');
        });
    });

    // ============================================
    // 查询
    // ============================================

    describe('查询', () => {
        it('getMenuItem 按索引获取', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }, { text: '打开' }]);

            const item = host.getMenuItem(0);
            expect(item.text).toBe('新建');
        });

        it('getMenuItem 索引越界返回 null', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }]);

            expect(host.getMenuItem(5)).toBeNull();
        });

        it('getAllMenuItems 返回所有项', () => {
            const host = new TestHost() as any;
            host.setMenuItems([{ text: '新建' }, { text: '打开' }]);

            const all = host.getAllMenuItems();
            expect(all.length).toBe(2);
        });
    });

    // ============================================
    // disposeAllMenuItems
    // ============================================

    describe('disposeAllMenuItems', () => {
        it('销毁所有菜单项', () => {
            const host = new TestHost() as any;
            host.setMenuItems([
                { text: '新建' },
                { text: '打开' },
                { text: '保存' },
            ]);
            host.disposeAllMenuItems();

            const pool = host.getMenuItemPool();
            expect(pool.length).toBe(0);
            expect(host.getMenuItemCount()).toBe(0);
        });
    });
});
