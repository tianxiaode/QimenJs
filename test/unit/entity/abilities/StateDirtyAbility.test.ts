/**
 * DirtyAbility 独立单元测试
 *
 * 验证脏检查能力的核心行为：
 * 1. isDirty 无参/有参调用
 * 2. startEdit / submitEdit / cancelEdit 生命周期
 * 3. rollbackAll
 * 4. 多宿主隔离（abilityStates）
 * 5. dispose 后安全性
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
import { DirtyAbility } from '@/entity/abilities/core/DirtyAbility';

// ============================================
// 辅助
// ============================================

function createDirtyHost() {
    class DirtyHost extends ComposableBase {
        static readonly abilities = [DirtyAbility];
        schema = { idField: 'id' };
        sourceData = new Map<string, any>();
    }
    return new DirtyHost() as any;
}

// ============================================
// 测试
// ============================================

describe('DirtyAbility', () => {
    describe('isDirty', () => {
        it('无参调用，初始状态应返回 false', () => {
            const host = createDirtyHost();
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });

        it('无参调用，startEdit 后应返回 true', () => {
            const host = createDirtyHost();
            host.startEdit({ id: '1', name: 'test' });
            expect(host.isDirty()).toBe(true);
            host.dispose();
        });

        it('有参调用，未编辑的项应返回 false', () => {
            const host = createDirtyHost();
            expect(host.isDirty({ id: '1', name: 'test' })).toBe(false);
            host.dispose();
        });

        it('有参调用，编辑后未修改应返回 false', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            expect(host.isDirty(item)).toBe(false);
            host.dispose();
        });

        it('有参调用，编辑后修改应返回 true', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            expect(host.isDirty(item)).toBe(true);
            host.dispose();
        });

        it('应忽略 updatedAt 和 version 字段的变更', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'test', updatedAt: '2024-01-01', version: 1 };
            host.startEdit(item);
            item.updatedAt = '2024-06-01';
            item.version = 2;
            expect(host.isDirty(item)).toBe(false);
            host.dispose();
        });

        it('应正确检测对象类型字段的变更', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'test', meta: { key: 'val' } };
            host.startEdit(item);
            item.meta = { key: 'changed' };
            expect(host.isDirty(item)).toBe(true);
            host.dispose();
        });

        it('对象字段值未变更时（深比较 JSON.stringify 分支）应返回 false', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'test', meta: { key: 'val' } };
            host.startEdit(item);
            // 替换为内容相同的新对象引用，JSON.stringify 深比较应判定为相等
            item.meta = { key: 'val' };
            expect(host.isDirty(item)).toBe(false);
            host.dispose();
        });

        it('对象字段值为 null 时应走原始值比较分支', () => {
            const host = createDirtyHost();
            const item: any = { id: '1', name: 'test', meta: null };
            host.startEdit(item);
            item.meta = { key: 'newVal' };
            expect(host.isDirty(item)).toBe(true);
            host.dispose();
        });

        it('多个字段中部分变更时应返回 true', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'test', age: 20, active: true };
            host.startEdit(item);
            item.age = 25; // 只修改 age
            expect(host.isDirty(item)).toBe(true);
            host.dispose();
        });
    });

    describe('startEdit / submitEdit / cancelEdit', () => {
        it('startEdit 应创建快照', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            expect(host.isDirty(item)).toBe(true);
            host.dispose();
        });

        it('submitEdit 应移除快照', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            host.submitEdit(item);
            expect(host.isDirty(item)).toBe(false);
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });

        it('cancelEdit 应恢复原始值并移除快照', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            host.cancelEdit(item);
            expect(item.name).toBe('test');
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });

        it('重复 startEdit 不应覆盖已有快照', () => {
            const host = createDirtyHost();
            const item = { id: '1', name: 'original' };
            host.startEdit(item);
            item.name = 'changed';
            host.startEdit(item); // 不应覆盖
            host.cancelEdit(item);
            expect(item.name).toBe('original');
            host.dispose();
        });
    });

    describe('rollbackAll', () => {
        it('应清除所有快照', () => {
            const host = createDirtyHost();
            host.startEdit({ id: '1', name: 'a' });
            host.startEdit({ id: '2', name: 'b' });
            expect(host.isDirty()).toBe(true);
            host.rollbackAll();
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });
    });

    describe('多宿主隔离', () => {
        it('两个宿主应有独立的快照状态', () => {
            const host1 = createDirtyHost();
            const host2 = createDirtyHost();

            host1.startEdit({ id: '1', name: 'a' });
            expect(host1.isDirty()).toBe(true);
            expect(host2.isDirty()).toBe(false);

            host1.dispose();
            host2.dispose();
        });

        it('dispose 一个宿主不应影响另一个', () => {
            const host1 = createDirtyHost();
            const host2 = createDirtyHost();

            host1.startEdit({ id: '1', name: 'a' });
            host2.startEdit({ id: '2', name: 'b' });

            host1.dispose();
            expect(host2.isDirty()).toBe(true);

            host2.dispose();
        });
    });

    describe('schema 无 idField 时使用默认值', () => {
        function createDirtyHostNoIdField() {
            class DirtyHost extends ComposableBase {
                static readonly abilities = [DirtyAbility];
                schema = {}; // 无 idField
                sourceData = new Map<string, any>();
            }
            return new DirtyHost() as any;
        }

        it('isDirty 应使用默认 idField "id"', () => {
            const host = createDirtyHostNoIdField();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            expect(host.isDirty(item)).toBe(true);
            host.dispose();
        });

        it('submitEdit 应使用默认 idField "id"', () => {
            const host = createDirtyHostNoIdField();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            host.submitEdit(item);
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });

        it('cancelEdit 应使用默认 idField "id"', () => {
            const host = createDirtyHostNoIdField();
            const item = { id: '1', name: 'test' };
            host.startEdit(item);
            item.name = 'changed';
            host.cancelEdit(item);
            expect(item.name).toBe('test');
            expect(host.isDirty()).toBe(false);
            host.dispose();
        });
    });

    describe('dispose 后安全性', () => {
        it('dispose 后 isDirty 无参调用应返回 false', () => {
            const host = createDirtyHost();
            host.startEdit({ id: '1', name: 'a' });
            host.dispose();
            expect(host.isDirty()).toBe(false);
        });
    });
});
