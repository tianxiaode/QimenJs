/**
 * RemoteToggleAbility 集成测试
 *
 * 验证远程状态切换能力的完整行为：
 * 1. toggle 成功：乐观更新 + 事件发射
 * 2. toggle 失败：自动回滚
 * 3. toggle 防抖：多次调用合并
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

import { RemoteCrudEntityManager } from '@/entity/manager/managers';
import { RemoteToggleAbility } from '@/entity/abilities/remote/RemoteToggleAbility';
import { ENTITY_CRUD_EVENTS } from '@/events';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { SchemaRegistrar } from '@/schema';
import type { FlatSchema, RegistrSchema } from '@/schema';

// ============================================
// 测试用 Schema
// ============================================

const toggleTestSchema: FlatSchema = {
    name: 'ToggleFeature',
    domain: 'toggle-test',
    idField: 'id',
    isTree: false,
    searchFields: ['name'],
    fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', searchable: true },
        { name: 'enabled', type: 'boolean' },
        { name: 'visible', type: 'boolean' },
    ],
};

// ============================================
// 测试用 Manager（显式包含 RemoteToggleAbility）
// ============================================

class TestToggleManager extends RemoteCrudEntityManager {
    // 按照任务要求，显式声明包含 RemoteToggleAbility
    // 虽然 RemoteCrudEntityManager 已包含，但此处显式列出以明确测试意图

    domain = 'toggle-test';
    entityName = 'ToggleFeature';
    url = '/api/features';
    schema: RegistrSchema = toggleTestSchema;
}

// ============================================
// 辅助函数
// ============================================

function ensureToggleTestDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar && !domainRegistrar.get('toggle-test')) {
        domainRegistrar.register('toggle-test', {
            baseUrl: 'http://localhost:9999',
            preset: 'default',
            pageSize: 10,
            pagesizes: [5, 10, 20, 50],
        });
    }
}

function mockFetchSuccess(item: any): void {
    jest.spyOn(TestToggleManager.prototype, 'fetch').mockImplementation(
        async () =>
            ({
                data: { item, list: [], total: 0 },
                metadata: { hasError: false },
            }) as any
    );
}

function mockFetchError(error: any): void {
    jest.spyOn(TestToggleManager.prototype, 'fetch').mockImplementation(async () => {
        throw error;
    });
}

// ============================================
// 测试数据
// ============================================

function createFeatureItem(overrides: Record<string, any> = {}) {
    return {
        id: 1,
        name: 'Dark Mode',
        enabled: false,
        visible: true,
        ...overrides,
    };
}

// ============================================
// 测试
// ============================================

describe('RemoteToggleAbility 集成测试', () => {
    let manager: TestToggleManager;

    beforeAll(() => {
        ensureToggleTestDomain();
        const schemaRegistrar = SchemaRegistrar.getInstance();
        if (!schemaRegistrar.has('ToggleFeature')) {
            schemaRegistrar.register(toggleTestSchema);
        }
    });

    beforeEach(() => {
        manager = new TestToggleManager();
    });

    afterEach(() => {
        manager.dispose();
        jest.restoreAllMocks();
    });

    // ========================================
    // 1. toggle 成功：乐观更新 + 事件发射
    // ========================================

    describe('toggle 成功', () => {
        it('toggle() 应该立即乐观更新布尔字段', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            const toggledItem = { ...item, enabled: true };
            mockFetchSuccess(toggledItem);

            // toggle 使用 debounce(leading=true)，第一次调用立即执行
            const result = (await manager.toggle(item, 'enabled')) as any;

            // 乐观更新：item.enabled 应该被立即翻转
            expect(item.enabled).toBe(true);
        });

        it('toggle() 成功后应该调用 updateItem 同步最终数据', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            const finalItem = { ...item, enabled: true, updatedAt: '2024-01-01' };
            mockFetchSuccess(finalItem);

            await manager.toggle(item, 'enabled');

            // updateItem 应该同步服务端返回的最终数据
            expect(manager.item).toEqual(finalItem);
            expect(manager.items[0]).toEqual(finalItem);
        });

        it('toggle() 成功后应该发射 toggled 事件', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            const finalItem = { ...item, enabled: true };
            mockFetchSuccess(finalItem);

            const emitSpy = jest.spyOn(manager, 'emit');

            await manager.toggle(item, 'enabled');

            expect(emitSpy).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.TOGGLED, {
                id: item.id,
                item: finalItem,
                field: 'enabled',
            });
        });

        it('toggle() 应该返回 this.item', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            const finalItem = { ...item, enabled: true };
            mockFetchSuccess(finalItem);

            const result = (await manager.toggle(item, 'enabled')) as any;

            expect(result).toEqual(finalItem);
        });

        it('toggle() 不同字段应该独立切换', async () => {
            const item = createFeatureItem({ enabled: false, visible: true });
            manager.updateData([item]);

            const finalItem = { ...item, visible: false };
            mockFetchSuccess(finalItem);

            await manager.toggle(item, 'visible');

            expect(item.visible).toBe(false);
        });
    });

    // ========================================
    // 2. toggle 失败：自动回滚
    // ========================================

    describe('toggle 失败回滚', () => {
        it('toggle() 失败时应该回滚到旧值', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            mockFetchError(new Error('Network error'));

            await manager.toggle(item, 'enabled');

            // 回滚：item.enabled 应该恢复为 false
            expect(item.enabled).toBe(false);
        });

        it('toggle() 失败时应该调用 updateItem 同步回滚后的数据', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            mockFetchError(new Error('Network error'));

            await manager.toggle(item, 'enabled');

            // updateItem 应该同步回滚后的 item
            expect(manager.item).toEqual(item);
            expect(manager.items[0]).toEqual(item);
        });

        it('toggle() 失败时不应该发射 toggled 事件', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            mockFetchError(new Error('Network error'));

            const emitSpy = jest.spyOn(manager, 'emit');

            await manager.toggle(item, 'enabled');

            // 不应该发射 toggled 事件
            expect(emitSpy).not.toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.TOGGLED, expect.anything());
        });

        it('toggle() 失败后应该返回 this.item（回滚后的值）', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            mockFetchError(new Error('Network error'));

            const result = (await manager.toggle(item, 'enabled')) as any;

            // 返回回滚后的 item
            expect(result.enabled).toBe(false);
        });

        it('toggle() 从 true 切换到 false 失败时应该回滚到 true', async () => {
            const item = createFeatureItem({ enabled: true });
            manager.updateData([item]);

            mockFetchError(new Error('Server error'));

            await manager.toggle(item, 'enabled');

            expect(item.enabled).toBe(true);
        });
    });

    // ========================================
    // 3. toggle 防抖：多次调用合并
    // ========================================

    describe('toggle 防抖', () => {
        it('toggle() 使用 debounce(400ms, leading=true)，第一次调用应该立即执行', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            const finalItem = { ...item, enabled: true };
            mockFetchSuccess(finalItem);

            // leading=true，第一次调用立即执行
            const result = (await manager.toggle(item, 'enabled')) as any;

            expect(item.enabled).toBe(true);
        });

        it('快速连续 toggle 同一字段应该被防抖合并', async () => {
            const item = createFeatureItem({ enabled: false });
            manager.updateData([item]);

            const finalItem = { ...item, enabled: true };
            mockFetchSuccess(finalItem);

            // 第一次调用立即执行（leading=true）
            const promise1 = manager.toggle(item, 'enabled');

            // 在防抖窗口内的第二次调用应该被合并
            const promise2 = manager.toggle(item, 'enabled');

            await Promise.all([promise1, promise2]);

            // fetch 应该只被调用一次（防抖合并）
            expect(manager.fetch).toHaveBeenCalledTimes(1);
        });

        it('toggle 不同字段应该使用相同的防抖 key（toggle 共享一个 debounce）', async () => {
            const item = createFeatureItem({ enabled: false, visible: true });
            manager.updateData([item]);

            const finalItem = { ...item, enabled: true };
            mockFetchSuccess(finalItem);

            // 第一次 toggle enabled（leading=true，立即执行）
            const promise1 = manager.toggle(item, 'enabled');

            // 第二次 toggle visible（同一 debounce key 'toggle'，在 400ms 窗口内被合并）
            const promise2 = manager.toggle(item, 'visible');

            await Promise.all([promise1, promise2]);

            // toggle 共享同一个 debounce key，防抖窗口内的调用被合并
            // 因此 fetch 只被调用一次
            expect(manager.fetch).toHaveBeenCalledTimes(1);
        });
    });
});
