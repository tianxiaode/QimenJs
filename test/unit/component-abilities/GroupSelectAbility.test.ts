/**
 * GroupSelectAbility 单元测试
 *
 * 覆盖：initGroupSelect、registerGroupItem/unregisterGroupItem、
 *       notifyGroupSelect（radio/checkbox 互斥）、查询方法、setGroupChecked、clearGroups
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

import { TemplateComponent, ITEMGROUP_TEMPLATE } from '@/component-core';
import { GroupSelectAbility } from '@/component-abilities/group/GroupSelectAbility';

/**
 * 创建测试用宿主类
 */
const TestHost = TemplateComponent
    .withTemplate(ITEMGROUP_TEMPLATE)
    .with([GroupSelectAbility]);

/** 创建 mock 子项 */
function createMockItem(group: string, groupMode: 'radio' | 'checkbox', checked: boolean = false) {
    return { group, groupMode, checked, el: document.createElement('div') };
}

describe('GroupSelectAbility', () => {

    // ============================================
    // initGroupSelect
    // ============================================

    describe('initGroupSelect', () => {
        it('初始化后无分组', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            expect(host.getGroupNames()).toEqual([]);
        });

        it('默认模式为 radio', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item = createMockItem('test', undefined as any);
            host.registerGroupItem(item);
            const info = host.getGroupInfo('test');
            expect(info.mode).toBe('radio');
        });

        it('可配置默认模式为 checkbox', () => {
            const host = new TestHost() as any;
            host.initGroupSelect({ defaultMode: 'checkbox' });
            const item = createMockItem('test', undefined as any);
            host.registerGroupItem(item);
            const info = host.getGroupInfo('test');
            expect(info.mode).toBe('checkbox');
        });
    });

    // ============================================
    // registerGroupItem / unregisterGroupItem
    // ============================================

    describe('registerGroupItem / unregisterGroupItem', () => {
        it('注册子项到分组', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item = createMockItem('view', 'radio');
            host.registerGroupItem(item);
            expect(host.getGroupNames()).toContain('view');
            expect(host.getGroupInfo('view').items).toContain(item);
        });

        it('避免重复注册', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item = createMockItem('view', 'radio');
            host.registerGroupItem(item);
            host.registerGroupItem(item);
            expect(host.getGroupInfo('view').items).toHaveLength(1);
        });

        it('注销子项', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item = createMockItem('view', 'radio');
            host.registerGroupItem(item);
            host.unregisterGroupItem(item);
            expect(host.getGroupNames()).not.toContain('view');
        });

        it('注销后组内无项时清理分组', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item = createMockItem('view', 'radio');
            host.registerGroupItem(item);
            host.unregisterGroupItem(item);
            expect(host.getGroupInfo('view')).toBeNull();
        });

        it('registerGroupItems 批量注册', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const items = [
                createMockItem('view', 'radio'),
                createMockItem('view', 'radio'),
            ];
            host.registerGroupItems(items);
            expect(host.getGroupInfo('view').items).toHaveLength(2);
        });

        it('无 group 的子项不注册', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item = { group: '', groupMode: 'radio', checked: false };
            host.registerGroupItem(item);
            expect(host.getGroupNames()).toEqual([]);
        });
    });

    // ============================================
    // notifyGroupSelect
    // ============================================

    describe('notifyGroupSelect', () => {
        it('radio：取消同组其他项', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item1 = createMockItem('view', 'radio', true);
            const item2 = createMockItem('view', 'radio', false);
            host.registerGroupItem(item1);
            host.registerGroupItem(item2);

            item2.checked = true;
            host.notifyGroupSelect(item2);

            expect(item1.checked).toBe(false);
            expect(item2.checked).toBe(true);
        });

        it('radio：确保当前项选中', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item = createMockItem('view', 'radio', false);
            host.registerGroupItem(item);

            host.notifyGroupSelect(item);

            expect(item.checked).toBe(true);
        });

        it('checkbox：不处理互斥', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item1 = createMockItem('show', 'checkbox', true);
            const item2 = createMockItem('show', 'checkbox', false);
            host.registerGroupItem(item1);
            host.registerGroupItem(item2);

            item2.checked = true;
            host.notifyGroupSelect(item2);

            expect(item1.checked).toBe(true);
            expect(item2.checked).toBe(true);
        });
    });

    // ============================================
    // 查询方法
    // ============================================

    describe('查询方法', () => {
        it('getGroupChecked radio 返回单个项', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item1 = createMockItem('view', 'radio', true);
            const item2 = createMockItem('view', 'radio', false);
            host.registerGroupItem(item1);
            host.registerGroupItem(item2);

            expect(host.getGroupChecked('view')).toBe(item1);
        });

        it('getGroupChecked radio 无选中返回 null', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item = createMockItem('view', 'radio', false);
            host.registerGroupItem(item);

            expect(host.getGroupChecked('view')).toBeNull();
        });

        it('getGroupChecked checkbox 返回数组', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item1 = createMockItem('show', 'checkbox', true);
            const item2 = createMockItem('show', 'checkbox', true);
            host.registerGroupItem(item1);
            host.registerGroupItem(item2);

            const checked = host.getGroupChecked('show');
            expect(checked).toHaveLength(2);
        });

        it('getGroupCheckedIndex radio 返回索引', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item1 = createMockItem('view', 'radio', false);
            const item2 = createMockItem('view', 'radio', true);
            host.registerGroupItem(item1);
            host.registerGroupItem(item2);

            expect(host.getGroupCheckedIndex('view')).toBe(1);
        });

        it('getGroupCheckedIndex checkbox 返回索引数组', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item1 = createMockItem('show', 'checkbox', true);
            const item2 = createMockItem('show', 'checkbox', false);
            const item3 = createMockItem('show', 'checkbox', true);
            host.registerGroupItem(item1);
            host.registerGroupItem(item2);
            host.registerGroupItem(item3);

            expect(host.getGroupCheckedIndex('show')).toEqual([0, 2]);
        });

        it('getGroupInfo 不存在的分组返回 null', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            expect(host.getGroupInfo('nonexist')).toBeNull();
        });

        it('getGroupChecked 不存在的分组返回 null', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            expect(host.getGroupChecked('nonexist')).toBeNull();
        });
    });

    // ============================================
    // setGroupChecked
    // ============================================

    describe('setGroupChecked', () => {
        it('radio 模式设置选中项', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item1 = createMockItem('view', 'radio', true);
            const item2 = createMockItem('view', 'radio', false);
            host.registerGroupItem(item1);
            host.registerGroupItem(item2);

            host.setGroupChecked('view', 1);
            expect(item1.checked).toBe(false);
            expect(item2.checked).toBe(true);
        });

        it('checkbox 模式设置多个选中项', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            const item1 = createMockItem('show', 'checkbox', false);
            const item2 = createMockItem('show', 'checkbox', false);
            host.registerGroupItem(item1);
            host.registerGroupItem(item2);

            host.setGroupChecked('show', [0, 1]);
            expect(item1.checked).toBe(true);
            expect(item2.checked).toBe(true);
        });
    });

    // ============================================
    // clearGroups
    // ============================================

    describe('clearGroups', () => {
        it('清除所有分组', () => {
            const host = new TestHost() as any;
            host.initGroupSelect();
            host.registerGroupItem(createMockItem('view', 'radio'));
            host.registerGroupItem(createMockItem('show', 'checkbox'));
            host.clearGroups();
            expect(host.getGroupNames()).toEqual([]);
        });
    });
});
