/**
 * ColumnOrderAbility 单元测试
 *
 * 覆盖：初始化、注册/注销列、重排、查询、规范化、CSS 变量模式/直接设置模式
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

import { ColumnOrderAbility } from '@/component-abilities/column-order';
import type { ColumnOrderConfig } from '@/component-abilities/column-order';

function createHost(config: ColumnOrderConfig = {}, withEl = true): any {
    const host: any = {
        _data: {},
        _abilityStates: new Map(),
        _cleanups: [],
        el: withEl ? document.createElement('div') : null,
        abilityState(key: string, creator?: () => any) {
            if (!this._abilityStates.has(key) && creator) {
                this._abilityStates.set(key, creator());
            }
            return this._abilityStates.get(key);
        },
        setAbilityState(key: string, value: any) {
            this._abilityStates.set(key, value);
        },
        onCleanup(cb: () => void) {
            this._cleanups.push(cb);
            return () => {
                const idx = this._cleanups.indexOf(cb);
                if (idx !== -1) this._cleanups.splice(idx, 1);
            };
        },
    };

    for (const key of Object.keys(ColumnOrderAbility)) {
        if (typeof (ColumnOrderAbility as any)[key] === 'function') {
            host[key] = (ColumnOrderAbility as any)[key].bind(host);
        }
    }

    host.initColumnOrder(config);
    return host;
}

function createMockComponent(colName: string): any {
    return {
        colName,
        type: 'header-cell',
        order: 0,
        el: document.createElement('div'),
        getData(key: string) {
            return (this as any)[key];
        },
    };
}

describe('ColumnOrderAbility', () => {
    describe('initColumnOrder', () => {
        it('默认配置：step=100, cssVarPrefix=--q-table-col-, useCssVar=true', () => {
            const host = createHost();
            const entry = host.registerColumnEntry('name', null, 0);
            expect(host.getColumnOrder('name')).toBe(100);
        });

        it('自定义配置：step=10, useCssVar=false', () => {
            const host = createHost({ step: 10, useCssVar: false });
            host.registerColumnEntry('name', createMockComponent('name'), 0);
            expect(host.getColumnOrder('name')).toBe(10);
        });

        it('注册 cleanup 回调', () => {
            const host = createHost();
            expect(host._cleanups.length).toBe(1);
        });
    });

    describe('registerColumnEntry', () => {
        it('注册列并设置初始 order 值', () => {
            const host = createHost({ useCssVar: false });
            const comp = createMockComponent('name');
            host.registerColumnEntry('name', comp, 0);
            expect(host.getColumnOrder('name')).toBe(100);
            expect(host.getColumnComponent('name')).toBe(comp);
            expect(comp.order).toBe(100);
        });

        it('注册多列，order 值按 index 递增', () => {
            const host = createHost({ useCssVar: false, step: 100 });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);
            host.registerColumnEntry('c', createMockComponent('c'), 2);
            expect(host.getColumnOrder('a')).toBe(100);
            expect(host.getColumnOrder('b')).toBe(200);
            expect(host.getColumnOrder('c')).toBe(300);
        });

        it('CSS 变量模式：设置 CSS 变量', () => {
            const host = createHost({ useCssVar: true, cssVarPrefix: '--q-table-col-' });
            host.registerColumnEntry('name', null, 0);
            const cssVar = host.el.style.getPropertyValue('--q-table-col-name-order');
            expect(cssVar).toBe('100');
        });

        it('直接设置模式：设置 component.order', () => {
            const host = createHost({ useCssVar: false });
            const comp = createMockComponent('name');
            host.registerColumnEntry('name', comp, 0);
            expect(comp.order).toBe(100);
        });

        it('自定义 order 值', () => {
            const host = createHost({ useCssVar: false });
            const comp = createMockComponent('name');
            host.registerColumnEntry('name', comp, 0, { order: 500 });
            expect(host.getColumnOrder('name')).toBe(500);
        });

        it('记录 parentGroup 和 isLeaf', () => {
            const host = createHost({ useCssVar: false });
            host.registerColumnEntry('age', createMockComponent('age'), 0, {
                parentGroup: 'baseInfo',
                isLeaf: false,
            });
            const entry = host.getColumnEntry('age');
            expect(entry.parentGroup).toBe('baseInfo');
            expect(entry.isLeaf).toBe(false);
        });
    });

    describe('unregisterColumnEntry', () => {
        it('注销列后查询返回 undefined', () => {
            const host = createHost({ useCssVar: false });
            host.registerColumnEntry('name', createMockComponent('name'), 0);
            host.unregisterColumnEntry('name');
            expect(host.getColumnOrder('name')).toBeUndefined();
            expect(host.getColumnComponent('name')).toBeUndefined();
        });
    });

    describe('reorderColumn', () => {
        it('将列移到目标列前面（isLeft=true）', () => {
            const host = createHost({ useCssVar: false, step: 100 });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);
            host.registerColumnEntry('c', createMockComponent('c'), 2);

            const result = host.reorderColumn('c', 'a', true);
            expect(result).toBe(true);

            const orderedNames = host.getOrderedColumnNames();
            expect(orderedNames).toEqual(['c', 'a', 'b']);
        });

        it('将列移到目标列后面（isLeft=false）', () => {
            const host = createHost({ useCssVar: false, step: 100 });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);
            host.registerColumnEntry('c', createMockComponent('c'), 2);

            host.reorderColumn('a', 'c', false);
            const orderedNames = host.getOrderedColumnNames();
            expect(orderedNames).toEqual(['b', 'c', 'a']);
        });

        it('from 和 to 相同时返回 false', () => {
            const host = createHost({ useCssVar: false });
            host.registerColumnEntry('a', createMockComponent('a'), 0);

            const result = host.reorderColumn('a', 'a', true);
            expect(result).toBe(false);
        });

        it('from 或 to 不存在时返回 false', () => {
            const host = createHost({ useCssVar: false });
            host.registerColumnEntry('a', createMockComponent('a'), 0);

            expect(host.reorderColumn('a', 'nonexistent', true)).toBe(false);
            expect(host.reorderColumn('nonexistent', 'a', true)).toBe(false);
        });

        it('CSS 变量模式：重排后更新 CSS 变量', () => {
            const host = createHost({ useCssVar: true, cssVarPrefix: '--q-table-col-' });
            host.registerColumnEntry('a', null, 0);
            host.registerColumnEntry('b', null, 1);
            host.registerColumnEntry('c', null, 2);

            host.reorderColumn('c', 'a', true);

            const orderC = host.el.style.getPropertyValue('--q-table-col-c-order');
            expect(parseInt(orderC)).toBeLessThan(100);
            expect(parseInt(orderC)).toBeGreaterThan(0);
        });

        it('直接设置模式：重排后更新 component.order', () => {
            const host = createHost({ useCssVar: false });
            const compA = createMockComponent('a');
            const compB = createMockComponent('b');
            const compC = createMockComponent('c');
            host.registerColumnEntry('a', compA, 0);
            host.registerColumnEntry('b', compB, 1);
            host.registerColumnEntry('c', compC, 2);

            host.reorderColumn('c', 'a', true);

            expect(compC.order).toBeLessThan(100);
            expect(compC.order).toBeGreaterThan(0);
        });

        it('多次重排后 order 值保持正确相对顺序', () => {
            const host = createHost({ useCssVar: false, step: 100 });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);
            host.registerColumnEntry('c', createMockComponent('c'), 2);
            host.registerColumnEntry('d', createMockComponent('d'), 3);

            host.reorderColumn('d', 'a', true);
            expect(host.getOrderedColumnNames()).toEqual(['d', 'a', 'b', 'c']);

            host.reorderColumn('b', 'c', false);
            expect(host.getOrderedColumnNames()).toEqual(['d', 'a', 'c', 'b']);
        });
    });

    describe('normalizeColumnOrders', () => {
        it('规范化后 order 值重新均匀分配', () => {
            const host = createHost({ useCssVar: false, step: 100 });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);
            host.registerColumnEntry('c', createMockComponent('c'), 2);

            host.reorderColumn('c', 'a', true);
            host.normalizeColumnOrders();

            expect(host.getColumnOrder('c')).toBe(100);
            expect(host.getColumnOrder('a')).toBe(200);
            expect(host.getColumnOrder('b')).toBe(300);
        });
    });

    describe('rebuildColumnOrders', () => {
        it('按指定顺序重建 order 值', () => {
            const host = createHost({ useCssVar: false, step: 100 });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);
            host.registerColumnEntry('c', createMockComponent('c'), 2);

            host.rebuildColumnOrders(['c', 'a', 'b']);

            expect(host.getColumnOrder('c')).toBe(100);
            expect(host.getColumnOrder('a')).toBe(200);
            expect(host.getColumnOrder('b')).toBe(300);
        });
    });

    describe('查询方法', () => {
        beforeEach(() => {
            // 每个测试自己创建 host
        });

        it('getColumnEntry 返回完整条目', () => {
            const host = createHost({ useCssVar: false });
            const comp = createMockComponent('name');
            host.registerColumnEntry('name', comp, 2, { isLeaf: true });

            const entry = host.getColumnEntry('name');
            expect(entry.colName).toBe('name');
            expect(entry.component).toBe(comp);
            expect(entry.order).toBe(300);
            expect(entry.index).toBe(2);
            expect(entry.isLeaf).toBe(true);
        });

        it('getColumnByIndex 按索引查询', () => {
            const host = createHost({ useCssVar: false });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);

            const entry = host.getColumnByIndex(1);
            expect(entry.colName).toBe('b');
        });

        it('getOrderedColumnNames 按 order 排序返回列名', () => {
            const host = createHost({ useCssVar: false, step: 100 });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);
            host.registerColumnEntry('c', createMockComponent('c'), 2);

            host.reorderColumn('c', 'a', true);
            expect(host.getOrderedColumnNames()).toEqual(['c', 'a', 'b']);
        });

        it('getColumnOrderCount 返回注册列数', () => {
            const host = createHost({ useCssVar: false });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);

            expect(host.getColumnOrderCount()).toBe(2);
        });
    });

    describe('_teardownColumnOrder', () => {
        it('清理后所有数据清空', () => {
            const host = createHost({ useCssVar: false });
            host.registerColumnEntry('a', createMockComponent('a'), 0);
            host.registerColumnEntry('b', createMockComponent('b'), 1);

            host._teardownColumnOrder();

            expect(host.getColumnOrderCount()).toBe(0);
            expect(host.getColumnOrder('a')).toBeUndefined();
        });

        it('通过 onCleanup 自动调用', () => {
            const host = createHost({ useCssVar: false });
            host.registerColumnEntry('a', createMockComponent('a'), 0);

            for (const cb of host._cleanups) {
                cb();
            }

            expect(host.getColumnOrderCount()).toBe(0);
        });
    });
});
