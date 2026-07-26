/**
 * DirtyAbility 单元测试
 *
 * 覆盖：isDirty、startEdit、submitEdit、cancelEdit、rollbackAll
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

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { DirtyAbility } from '@/entity/abilities/core/DirtyAbility';

function createHost() {
    class TestHost extends ComposableBase {
        schema = { idField: 'id', idType: 'number' };
    }
    withAbilities(TestHost, [DirtyAbility]);
    return new TestHost() as any;
}

describe('DirtyAbility', () => {
    // ============================================
    // isDirty
    // ============================================

    describe('isDirty', () => {
        it('无快照时返回 false', () => {
            const host = createHost();
            expect(host.isDirty()).toBe(false);
        });

        it('有快照时返回 true', () => {
            const host = createHost();
            host.startEdit({ id: 1, name: 'Alice' });
            expect(host.isDirty()).toBe(true);
        });

        it('指定 item 未修改时返回 false', () => {
            const host = createHost();
            const item = { id: 1, name: 'Alice' };
            host.startEdit(item);
            expect(host.isDirty(item)).toBe(false);
        });

        it('指定 item 已修改时返回 true', () => {
            const host = createHost();
            const item = { id: 1, name: 'Alice' };
            host.startEdit(item);
            item.name = 'Bob';
            expect(host.isDirty(item)).toBe(true);
        });

        it('updatedAt/version 字段变更不算脏', () => {
            const host = createHost();
            const item = { id: 1, name: 'Alice', updatedAt: 'old' };
            host.startEdit(item);
            item.updatedAt = 'new';
            expect(host.isDirty(item)).toBe(false);
        });

        it('对象类型字段用 JSON 对比', () => {
            const host = createHost();
            const item = { id: 1, meta: { a: 1 } };
            host.startEdit(item);
            item.meta = { a: 2 };
            expect(host.isDirty(item)).toBe(true);
        });

        it('无快照的 item 返回 false', () => {
            const host = createHost();
            expect(host.isDirty({ id: 99, name: 'X' })).toBe(false);
        });
    });

    // ============================================
    // startEdit
    // ============================================

    describe('startEdit', () => {
        it('创建快照', () => {
            const host = createHost();
            const item = { id: 1, name: 'Alice' };
            host.startEdit(item);
            expect(host.isDirty()).toBe(true);
        });

        it('重复 startEdit 不覆盖快照', () => {
            const host = createHost();
            const item = { id: 1, name: 'Alice' };
            host.startEdit(item);
            item.name = 'Bob';
            host.startEdit(item);
            expect(host.isDirty(item)).toBe(true);
        });
    });

    // ============================================
    // submitEdit
    // ============================================

    describe('submitEdit', () => {
        it('提交后清除快照', () => {
            const host = createHost();
            const item = { id: 1, name: 'Alice' };
            host.startEdit(item);
            host.submitEdit(item);
            expect(host.isDirty()).toBe(false);
        });
    });

    // ============================================
    // cancelEdit
    // ============================================

    describe('cancelEdit', () => {
        it('恢复快照数据', () => {
            const host = createHost();
            const item = { id: 1, name: 'Alice' };
            host.startEdit(item);
            item.name = 'Bob';
            host.cancelEdit(item);
            expect(item.name).toBe('Alice');
        });

        it('取消后清除快照', () => {
            const host = createHost();
            const item = { id: 1, name: 'Alice' };
            host.startEdit(item);
            host.cancelEdit(item);
            expect(host.isDirty()).toBe(false);
        });

        it('无快照时不报错', () => {
            const host = createHost();
            expect(() => host.cancelEdit({ id: 99, name: 'X' })).not.toThrow();
        });
    });

    // ============================================
    // rollbackAll
    // ============================================

    describe('rollbackAll', () => {
        it('清除所有快照', () => {
            const host = createHost();
            host.startEdit({ id: 1, name: 'A' });
            host.startEdit({ id: 2, name: 'B' });
            expect(host.isDirty()).toBe(true);
            host.rollbackAll();
            expect(host.isDirty()).toBe(false);
        });
    });
});
