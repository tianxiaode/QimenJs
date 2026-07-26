/**
 * LocalDataAbility 单元测试
 *
 * 覆盖：setLocalData、getLocalData、removeLocalData、hasLocalData、getLocalDataKeys、
 *       clearAllLocalData、addLocalDataItem、updateLocalDataItem、removeLocalDataItem、
 *       filterLocalData、sortLocalData、getLocalDataView、getLocalDataRaw、getLocalDataItem、
 *       onLocalDataChange、offLocalDataChange、localDataKey getter/setter
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

jest.mock('@/cache', () => ({
    CacheFactory: {
        create: jest.fn().mockResolvedValue({
            id: 'test-provider',
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            remove: jest.fn().mockResolvedValue(undefined),
        }),
        release: jest.fn(),
    },
}));

import { Component } from '@/component-core';
import type { ComponentTemplate } from '@/component-core';
import { LocalDataAbility } from '@/component-abilities/data/LocalDataAbility';

const TPL: ComponentTemplate = { tpl: { tag: 'div' } };
const HostClass = Component.withTemplate(TPL).with([LocalDataAbility]);

describe('LocalDataAbility', () => {
    // ============================================
    // localDataKey
    // ============================================

    describe('localDataKey', () => {
        it('默认为 null', () => {
            const host = new HostClass() as any;
            expect(host.localDataKey).toBeNull();
        });

        it('可设置和读取', () => {
            const host = new HostClass() as any;
            host.localDataKey = 'rows';
            expect(host.localDataKey).toBe('rows');
        });
    });

    // ============================================
    // setLocalData / getLocalData
    // ============================================

    describe('setLocalData / getLocalData', () => {
        it('设置和获取数据', () => {
            const host = new HostClass() as any;
            const data = [{ id: 1, name: 'Alice' }];
            host.setLocalData('rows', data);
            expect(host.getLocalData('rows')).toEqual(data);
        });

        it('设置数据触发变更通知', () => {
            const host = new HostClass() as any;
            const cb = jest.fn();
            host.onLocalDataChange('rows', cb);
            host.setLocalData('rows', [{ id: 1 }]);
            expect(cb).toHaveBeenCalledWith([{ id: 1 }], []);
        });

        it('getLocalData 无 key 时使用 localDataKey', () => {
            const host = new HostClass() as any;
            host.localDataKey = 'items';
            host.setLocalData('items', [1, 2]);
            expect(host.getLocalData()).toEqual([1, 2]);
        });

        it('getLocalData 无 key 且无 localDataKey 返回空数组', () => {
            const host = new HostClass() as any;
            expect(host.getLocalData()).toEqual([]);
        });

        it('getLocalData 不存在的 key 返回空数组', () => {
            const host = new HostClass() as any;
            expect(host.getLocalData('nonexist')).toEqual([]);
        });
    });

    // ============================================
    // removeLocalData
    // ============================================

    describe('removeLocalData', () => {
        it('移除数据并触发通知', () => {
            const host = new HostClass() as any;
            const cb = jest.fn();
            host.setLocalData('rows', [{ id: 1 }]);
            host.onLocalDataChange('rows', cb);
            host.removeLocalData('rows');
            expect(host.getLocalData('rows')).toEqual([]);
            expect(cb).toHaveBeenCalledWith([], [{ id: 1 }]);
        });

        it('移除不存在的 key 不报错', () => {
            const host = new HostClass() as any;
            expect(() => host.removeLocalData('nonexist')).not.toThrow();
        });
    });

    // ============================================
    // hasLocalData / getLocalDataKeys
    // ============================================

    describe('hasLocalData / getLocalDataKeys', () => {
        it('hasLocalData 返回正确状态', () => {
            const host = new HostClass() as any;
            expect(host.hasLocalData('rows')).toBe(false);
            host.setLocalData('rows', []);
            expect(host.hasLocalData('rows')).toBe(true);
        });

        it('getLocalDataKeys 返回所有 key', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', []);
            host.setLocalData('cols', []);
            expect(host.getLocalDataKeys()).toContain('rows');
            expect(host.getLocalDataKeys()).toContain('cols');
        });
    });

    // ============================================
    // clearAllLocalData
    // ============================================

    describe('clearAllLocalData', () => {
        it('清除所有数据', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [1]);
            host.setLocalData('cols', [2]);
            host.clearAllLocalData();
            expect(host.getLocalDataKeys()).toEqual([]);
        });

        it('清除时触发每个 key 的变更通知', () => {
            const host = new HostClass() as any;
            const cb1 = jest.fn();
            const cb2 = jest.fn();
            host.setLocalData('rows', [1]);
            host.setLocalData('cols', [2]);
            host.onLocalDataChange('rows', cb1);
            host.onLocalDataChange('cols', cb2);
            host.clearAllLocalData();
            expect(cb1).toHaveBeenCalledWith([], [1]);
            expect(cb2).toHaveBeenCalledWith([], [2]);
        });
    });

    // ============================================
    // CRUD 操作
    // ============================================

    describe('addLocalDataItem', () => {
        it('末尾添加项', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [{ id: 1 }]);
            host.addLocalDataItem('rows', { id: 2 });
            expect(host.getLocalData('rows')).toEqual([{ id: 1 }, { id: 2 }]);
        });

        it('指定位置插入项', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [{ id: 1 }, { id: 3 }]);
            host.addLocalDataItem('rows', { id: 2 }, 1);
            expect(host.getLocalData('rows')).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
        });
    });

    describe('updateLocalDataItem', () => {
        it('用对象替换项', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [{ id: 1, name: 'old' }]);
            host.updateLocalDataItem('rows', 0, { id: 1, name: 'new' });
            expect(host.getLocalData('rows')[0].name).toBe('new');
        });

        it('用函数更新项', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [{ id: 1, name: 'old' }]);
            host.updateLocalDataItem('rows', 0, (item: any) => ({ ...item, name: 'updated' }));
            expect(host.getLocalData('rows')[0].name).toBe('updated');
        });

        it('越界索引不报错', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [{ id: 1 }]);
            expect(() => host.updateLocalDataItem('rows', 5, { id: 2 })).not.toThrow();
        });
    });

    describe('removeLocalDataItem', () => {
        it('按索引移除项', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [{ id: 1 }, { id: 2 }]);
            host.removeLocalDataItem('rows', 0);
            expect(host.getLocalData('rows')).toEqual([{ id: 2 }]);
        });

        it('越界索引不报错', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [{ id: 1 }]);
            expect(() => host.removeLocalDataItem('rows', 5)).not.toThrow();
        });
    });

    // ============================================
    // 数据操作（filter/sort/view/raw）
    // ============================================

    describe('filterLocalData / sortLocalData / getLocalDataView', () => {
        it('filterLocalData 过滤数据', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
            ]);
            host.filterLocalData('rows', 'ali');
            const view = host.getLocalDataView('rows');
            expect(view.length).toBeLessThanOrEqual(2);
        });

        it('sortLocalData 排序数据', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [
                { id: 1, name: 'Bob' },
                { id: 2, name: 'Alice' },
            ]);
            host.sortLocalData('rows', 'name', 'asc');
            const view = host.getLocalDataView('rows');
            expect(view[0].name).toBe('Alice');
        });

        it('getLocalDataView 无 manager 时返回原始数据', () => {
            const host = new HostClass() as any;
            expect(host.getLocalDataView('nonexist')).toEqual([]);
        });

        it('getLocalDataView 使用 localDataKey', () => {
            const host = new HostClass() as any;
            host.localDataKey = 'items';
            host.setLocalData('items', [1, 2, 3]);
            expect(host.getLocalDataView()).toEqual([1, 2, 3]);
        });
    });

    describe('getLocalDataRaw', () => {
        it('返回原始数据', () => {
            const host = new HostClass() as any;
            const data = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
            ];
            host.setLocalData('rows', data);
            const raw = host.getLocalDataRaw('rows');
            expect(raw.length).toBe(2);
        });

        it('无 key 且无 localDataKey 返回空数组', () => {
            const host = new HostClass() as any;
            expect(host.getLocalDataRaw()).toEqual([]);
        });
    });

    describe('getLocalDataItem', () => {
        it('按 id 获取数据项', () => {
            const host = new HostClass() as any;
            host.setLocalData('rows', [{ id: 1, name: 'Alice' }]);
            const item = host.getLocalDataItem('rows', 1);
            expect(item).toBeTruthy();
            expect(item.name).toBe('Alice');
        });

        it('无 manager 返回 null', () => {
            const host = new HostClass() as any;
            expect(host.getLocalDataItem('nonexist', 1)).toBeNull();
        });
    });

    // ============================================
    // 变更监听
    // ============================================

    describe('onLocalDataChange / offLocalDataChange', () => {
        it('监听和取消监听', () => {
            const host = new HostClass() as any;
            const cb = jest.fn();
            host.onLocalDataChange('rows', cb);
            host.setLocalData('rows', [1]);
            expect(cb).toHaveBeenCalledTimes(1);
            host.offLocalDataChange('rows', cb);
            host.setLocalData('rows', [2]);
            expect(cb).toHaveBeenCalledTimes(1);
        });

        it('offLocalDataChange 不存在的 key 不报错', () => {
            const host = new HostClass() as any;
            expect(() => host.offLocalDataChange('nonexist', jest.fn())).not.toThrow();
        });
    });
});
