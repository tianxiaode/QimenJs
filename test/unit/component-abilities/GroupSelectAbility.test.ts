/**
 * GroupSelectAbility 单元测试
 */

import { GroupSelectAbility } from '@/component-abilities/group/GroupSelectAbility';

describe('GroupSelectAbility', () => {
    function createInstance() {
        const stateMap = new Map();
        return {
            setAbilityState: jest.fn((key: string, val: any) => stateMap.set(key, val)),
            abilityState: jest.fn((key: string) => stateMap.get(key)),
        };
    }

    function createItem(group: string, groupMode: 'radio' | 'checkbox', checked = false) {
        return { group, groupMode, checked };
    }

    describe('initGroupSelect', () => {
        it('默认 radio 模式', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            expect(inst.setAbilityState).toHaveBeenCalled();
        });

        it('自定义 defaultMode', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst, { defaultMode: 'checkbox' });
            expect(inst.setAbilityState).toHaveBeenCalled();
        });
    });

    describe('registerGroupItem', () => {
        it('注册子项到分组', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item = createItem('view', 'radio');
            GroupSelectAbility.registerGroupItem.call(inst, item);
            const state = inst.abilityState('GroupSelectAbility:state');
            expect(state.groups.view.items).toContain(item);
        });

        it('无 group 属性不注册', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            GroupSelectAbility.registerGroupItem.call(inst, { groupMode: 'radio', checked: false });
            const state = inst.abilityState('GroupSelectAbility:state');
            expect(Object.keys(state.groups).length).toBe(0);
        });

        it('避免重复注册', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item = createItem('view', 'radio');
            GroupSelectAbility.registerGroupItem.call(inst, item);
            GroupSelectAbility.registerGroupItem.call(inst, item);
            const state = inst.abilityState('GroupSelectAbility:state');
            expect(state.groups.view.items.length).toBe(1);
        });

        it('首次注册时以子项 groupMode 为准', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst, { defaultMode: 'checkbox' });
            const item = createItem('view', 'radio');
            GroupSelectAbility.registerGroupItem.call(inst, item);
            const state = inst.abilityState('GroupSelectAbility:state');
            expect(state.groups.view.mode).toBe('radio');
        });
    });

    describe('unregisterGroupItem', () => {
        it('注销子项', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item = createItem('view', 'radio');
            GroupSelectAbility.registerGroupItem.call(inst, item);
            GroupSelectAbility.unregisterGroupItem.call(inst, item);
            const state = inst.abilityState('GroupSelectAbility:state');
            expect(state.groups.view).toBeUndefined();
        });

        it('注销不存在的项不报错', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            expect(() =>
                GroupSelectAbility.unregisterGroupItem.call(inst, createItem('no', 'radio'))
            ).not.toThrow();
        });
    });

    describe('notifyGroupSelect', () => {
        it('radio 模式取消同组其他项', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item1 = createItem('view', 'radio', true);
            const item2 = createItem('view', 'radio', false);
            GroupSelectAbility.registerGroupItem.call(inst, item1);
            GroupSelectAbility.registerGroupItem.call(inst, item2);
            GroupSelectAbility.notifyGroupSelect.call(inst, item2);
            expect(item1.checked).toBe(false);
            expect(item2.checked).toBe(true);
        });

        it('checkbox 模式不互斥', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item1 = createItem('show', 'checkbox', true);
            const item2 = createItem('show', 'checkbox', false);
            GroupSelectAbility.registerGroupItem.call(inst, item1);
            GroupSelectAbility.registerGroupItem.call(inst, item2);
            GroupSelectAbility.notifyGroupSelect.call(inst, item2);
            expect(item1.checked).toBe(true);
        });
    });

    describe('getGroupChecked', () => {
        it('radio 返回单个选中项', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item = createItem('view', 'radio', true);
            GroupSelectAbility.registerGroupItem.call(inst, item);
            expect(GroupSelectAbility.getGroupChecked.call(inst, 'view')).toBe(item);
        });

        it('checkbox 返回选中项数组', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item1 = createItem('show', 'checkbox', true);
            const item2 = createItem('show', 'checkbox', true);
            GroupSelectAbility.registerGroupItem.call(inst, item1);
            GroupSelectAbility.registerGroupItem.call(inst, item2);
            const result = GroupSelectAbility.getGroupChecked.call(inst, 'show');
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
        });

        it('不存在的分组返回 null', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            expect(GroupSelectAbility.getGroupChecked.call(inst, 'no')).toBeNull();
        });
    });

    describe('getGroupCheckedIndex', () => {
        it('radio 返回索引', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item1 = createItem('view', 'radio', false);
            const item2 = createItem('view', 'radio', true);
            GroupSelectAbility.registerGroupItem.call(inst, item1);
            GroupSelectAbility.registerGroupItem.call(inst, item2);
            expect(GroupSelectAbility.getGroupCheckedIndex.call(inst, 'view')).toBe(1);
        });

        it('checkbox 返回索引数组', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item1 = createItem('show', 'checkbox', true);
            const item2 = createItem('show', 'checkbox', false);
            const item3 = createItem('show', 'checkbox', true);
            GroupSelectAbility.registerGroupItem.call(inst, item1);
            GroupSelectAbility.registerGroupItem.call(inst, item2);
            GroupSelectAbility.registerGroupItem.call(inst, item3);
            expect(GroupSelectAbility.getGroupCheckedIndex.call(inst, 'show')).toEqual([0, 2]);
        });
    });

    describe('getGroupInfo / getGroupNames', () => {
        it('getGroupInfo 返回分组信息', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            GroupSelectAbility.registerGroupItem.call(inst, createItem('view', 'radio'));
            const info = GroupSelectAbility.getGroupInfo.call(inst, 'view');
            expect(info?.mode).toBe('radio');
        });

        it('getGroupNames 返回所有分组名', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            GroupSelectAbility.registerGroupItem.call(inst, createItem('view', 'radio'));
            GroupSelectAbility.registerGroupItem.call(inst, createItem('show', 'checkbox'));
            expect(GroupSelectAbility.getGroupNames.call(inst)).toEqual(['view', 'show']);
        });
    });

    describe('setGroupChecked', () => {
        it('radio 模式按索引设置', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item1 = createItem('view', 'radio', true);
            const item2 = createItem('view', 'radio', false);
            GroupSelectAbility.registerGroupItem.call(inst, item1);
            GroupSelectAbility.registerGroupItem.call(inst, item2);
            GroupSelectAbility.setGroupChecked.call(inst, 'view', 1);
            expect(item1.checked).toBe(false);
            expect(item2.checked).toBe(true);
        });

        it('checkbox 模式按索引数组设置', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item1 = createItem('show', 'checkbox', true);
            const item2 = createItem('show', 'checkbox', false);
            GroupSelectAbility.registerGroupItem.call(inst, item1);
            GroupSelectAbility.registerGroupItem.call(inst, item2);
            GroupSelectAbility.setGroupChecked.call(inst, 'show', [1]);
            expect(item1.checked).toBe(false);
            expect(item2.checked).toBe(true);
        });

        it('radio 索引越界不操作', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            const item = createItem('view', 'radio', true);
            GroupSelectAbility.registerGroupItem.call(inst, item);
            GroupSelectAbility.setGroupChecked.call(inst, 'view', 5);
            expect(item.checked).toBe(true);
        });
    });

    describe('registerGroupItems / clearGroups', () => {
        it('批量注册', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            inst.registerGroupItem = (item: any) =>
                GroupSelectAbility.registerGroupItem.call(inst, item);
            const items = [createItem('a', 'radio'), createItem('b', 'checkbox')];
            GroupSelectAbility.registerGroupItems.call(inst, items);
            expect(GroupSelectAbility.getGroupNames.call(inst)).toEqual(['a', 'b']);
        });

        it('clearGroups 清除所有分组', () => {
            const inst = createInstance();
            GroupSelectAbility.initGroupSelect.call(inst);
            GroupSelectAbility.registerGroupItem.call(inst, createItem('a', 'radio'));
            GroupSelectAbility.clearGroups.call(inst);
            expect(GroupSelectAbility.getGroupNames.call(inst)).toEqual([]);
        });
    });
});
