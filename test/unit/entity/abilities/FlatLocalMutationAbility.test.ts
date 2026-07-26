/**
 * FlatLocalMutationAbility 独立单元测试
 *
 * 验证平铺本地变更能力的核心行为：
 * 1. create / update / toggle
 * 2. save (isBatch=true / isBatch=false)
 * 3. _internalSave 无变更时直接返回
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

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { FlatLocalMutationAbility } from '@/entity/abilities/local/FlatLocalMutationAbility';
import { FlatLocalStateAbility } from '@/entity/abilities/local/FlatLocalStateAbility';
import { ENTITY_CRUD_EVENTS } from '@/events';

// ============================================
// 辅助
// ============================================

function createHost() {
    class TestHost extends ComposableBase {
        schema = { idField: 'id', idType: 'string' };
        sourceData = new Map<string, any>();
        setCache = jest.fn().mockResolvedValue(undefined);
        refreshView = jest.fn();
        fetch = jest.fn().mockResolvedValue({ data: {}, metadata: { hasError: false } });
        buildOptions = jest.fn().mockResolvedValue({});
        emit = jest.fn();
        debounce = jest.fn((_key: string, fn: any, _ms: number) => fn) as any;
    }
    withAbilities(TestHost, [FlatLocalStateAbility, FlatLocalMutationAbility]);
    return new TestHost() as any;
}

// ============================================
// 测试
// ============================================

describe('FlatLocalMutationAbility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('应调用 addItem 并触发 created 事件', () => {
            const host = createHost();
            const item = { id: '1', name: 'test' };
            const result = host.create(item);
            expect(result).toBe(item);
            expect(host.changes.added.length).toBe(1);
            expect(host.emit).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.CREATED, item);
            host.dispose();
        });
    });

    describe('update', () => {
        it('应调用 updateItem 并触发 updated 事件', async () => {
            const host = createHost();
            host.sourceData.set('1', { id: '1', name: 'old' });
            const item = { id: '1', name: 'new' };
            const result = host.update(item);
            expect(result).toBe(item);
            expect(host.emit).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.UPDATED, item);
            host.dispose();
        });
    });

    describe('toggle', () => {
        it('应切换布尔字段值并触发 toggled 事件', async () => {
            const host = createHost();
            host.sourceData.set('1', { id: '1', name: 'test', active: true });
            const item = { id: '1', name: 'test', active: true };
            host.toggle(item, 'active');
            expect(item.active).toBe(false);
            expect(host.emit).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.TOGGLED, {
                id: '1',
                item,
                field: 'active',
                oldValue: true,
            });
            host.dispose();
        });

        it('应切换 false 为 true', async () => {
            const host = createHost();
            host.sourceData.set('1', { id: '1', name: 'test', active: false });
            const item = { id: '1', name: 'test', active: false };
            host.toggle(item, 'active');
            expect(item.active).toBe(true);
            host.dispose();
        });
    });

    describe('save', () => {
        it('isBatch=true 应调用 fetch batch-save', async () => {
            const host = createHost();
            await host.addItem({ id: '1', name: 'new' });
            host.sourceData.set('2', { id: '2', name: 'old' });
            await host.updateItem({ id: '2', name: 'updated' });

            await host._internalSave(true);

            expect(host.fetch).toHaveBeenCalledWith('batch-save', expect.anything());
            expect(host.emit).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.SAVED);
            host.dispose();
        });

        it('isBatch=false 有 added 无 updated 时只调用 create', async () => {
            const host = createHost();
            await host.addItem({ id: '1', name: 'new' });

            await host._internalSave(false);

            expect(host.fetch).toHaveBeenCalledWith('create', expect.anything());
            expect(host.fetch).not.toHaveBeenCalledWith('update', expect.anything());
            expect(host.fetch).not.toHaveBeenCalledWith('batch-save', expect.anything());
            host.dispose();
        });

        it('isBatch=false 有 updated 无 added 时只调用 update', async () => {
            const host = createHost();
            host.sourceData.set('1', { id: '1', name: 'old' });
            await host.updateItem({ id: '1', name: 'updated' });

            await host._internalSave(false);

            expect(host.fetch).toHaveBeenCalledWith('update', expect.anything());
            expect(host.fetch).not.toHaveBeenCalledWith('create', expect.anything());
            host.dispose();
        });

        it('无变更时直接返回不调用 fetch', async () => {
            const host = createHost();

            await host._internalSave(false);

            expect(host.fetch).not.toHaveBeenCalled();
            host.dispose();
        });
    });
});
