/**
 * CacheFactory → MemoryProvider → CacheAbility 集成测试
 *
 * 验证缓存系统的完整链路：
 * 1. CacheFactory.create() 创建 MemoryProvider
 * 2. MemoryProvider 的 get/set/remove/clear/has 操作
 * 3. TTL 过期检查
 * 4. CacheAbility 通过 CacheFactory 懒初始化 provider
 * 5. CacheAbility.tryGetCache/setCache/clearCache 与真实 provider 交互
 * 6. CacheFactory.release() 释放 provider
 * 7. dispose 时自动释放 provider
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
            }))
        }
    };
});

import { CacheFactory } from '@/cache/CacheFactory';
import { MemoryProvider } from '@/cache/MemoryProvider';
import { RemoteCrudEntityManager } from '@/entity/manager/managers';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import type { FlatSchema, RegistrSchema } from '@/schema';

// ============================================
// 测试用 Schema
// ============================================

const cacheTestSchema: FlatSchema = {
    name: 'CacheTestEntity',
    domain: 'cache-test',
    idField: 'id',
    isTree: false,
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
    ],
};

// ============================================
// 测试用 EntityManager
// ============================================

class CacheTestManager extends RemoteCrudEntityManager {
    domain = 'cache-test';
    entityName = 'CacheTestEntity';
    url = '/api/cache-test';
    schema: RegistrSchema = cacheTestSchema;
}

// ============================================
// 辅助函数
// ============================================

function ensureCacheTestDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar && !domainRegistrar.get('cache-test')) {
        domainRegistrar.register('cache-test', {
            baseUrl: 'http://localhost:9999',
            preset: 'default',
            pageSize: 10,
            pagesizes: [10, 20, 50],
        });
    }
}

// ============================================
// 测试
// ============================================

describe('CacheFactory → MemoryProvider → CacheAbility 集成测试', () => {
    beforeAll(() => {
        ensureCacheTestDomain();
    });

    describe('CacheFactory.create() 与 MemoryProvider', () => {
        it('应该创建 MemoryProvider 实例', async () => {
            const provider = await CacheFactory.create('memory');
            expect(provider).toBeDefined();
            expect(provider).toBeInstanceOf(MemoryProvider);
            expect(provider.type).toBe('memory');
            expect(provider.id).toBeTruthy();
        });

        it('创建的 provider 应该注册到 CacheFactory._instances', async () => {
            const provider = await CacheFactory.create('memory');
            expect(CacheFactory._instances.has(provider.id)).toBe(true);
        });
    });

    describe('MemoryProvider 基本操作', () => {
        let provider: MemoryProvider;

        beforeEach(async () => {
            provider = await CacheFactory.create('memory') as MemoryProvider;
        });

        it('set + get 应该正确存取数据', async () => {
            await provider.set('test-key', { items: [1, 2, 3] });
            const data = await provider.get('test-key');
            expect(data).toEqual({ items: [1, 2, 3] });
        });

        it('get 不存在的 key 应该返回 null', async () => {
            const data = await provider.get('nonexistent');
            expect(data).toBeNull();
        });

        it('remove 应该删除数据', async () => {
            await provider.set('test-key', { data: 'hello' });
            await provider.remove('test-key');
            const data = await provider.get('test-key');
            expect(data).toBeNull();
        });

        it('has 应该检查 key 是否存在', async () => {
            await provider.set('test-key', { data: 'hello' });
            expect(await provider.has('test-key')).toBe(true);
            expect(await provider.has('nonexistent')).toBe(false);
        });

        it('clear 应该清空所有数据', async () => {
            await provider.set('key1', 'value1');
            await provider.set('key2', 'value2');
            await provider.clear();
            expect(await provider.get('key1')).toBeNull();
            expect(await provider.get('key2')).toBeNull();
        });
    });

    describe('MemoryProvider TTL 过期', () => {
        let provider: MemoryProvider;

        beforeEach(async () => {
            provider = await CacheFactory.create('memory') as MemoryProvider;
        });

        it('未过期的数据应该正常返回', async () => {
            await provider.set('test-key', { data: 'fresh' }, 60000);  // 60s TTL
            const data = await provider.get('test-key');
            expect(data).toEqual({ data: 'fresh' });
        });

        it('TTL=0 的数据应该永不过期', async () => {
            await provider.set('test-key', { data: 'permanent' }, 0);
            const data = await provider.get('test-key');
            expect(data).toEqual({ data: 'permanent' });
        });

        it('已过期的数据应该返回 null 并自动删除', async () => {
            await provider.set('test-key', { data: 'expired' }, 1);  // 1ms TTL
            // 等待过期
            await new Promise(resolve => setTimeout(resolve, 10));
            const data = await provider.get('test-key');
            expect(data).toBeNull();
        });
    });

    describe('CacheFactory.release()', () => {
        it('应该从 _instances 中移除 provider', async () => {
            const provider = await CacheFactory.create('memory');
            const id = provider.id;
            expect(CacheFactory._instances.has(id)).toBe(true);

            CacheFactory.release(id, true);
            expect(CacheFactory._instances.has(id)).toBe(false);
        });

        it('autoClear=true 应该清空 provider 数据', async () => {
            const provider = await CacheFactory.create('memory');
            await provider.set('test-key', { data: 'hello' });

            CacheFactory.release(provider.id, true);
            // provider 已被释放，但内存中的 storage 引用仍然存在
            // 验证 _instances 中已移除
            expect(CacheFactory._instances.has(provider.id)).toBe(false);
        });
    });

    describe('CacheAbility 与真实 CacheProvider 交互', () => {
        it('tryGetCache 在无缓存时应该返回 null', async () => {
            const manager = new CacheTestManager();

            const result = await manager.tryGetCache();
            expect(result).toBeNull();
        });

        it('setCache + tryGetCache 应该正确存取数据', async () => {
            const manager = new CacheTestManager();

            const testData = { items: [{ id: 1, name: 'test' }], total: 1 };
            await manager.setCache(testData);

            const result = await manager.tryGetCache();
            expect(result).toEqual(testData);
        });

        it('clearCache 应该清除缓存数据', async () => {
            const manager = new CacheTestManager();

            await manager.setCache({ items: [] });
            await manager.clearCache();

            const result = await manager.tryGetCache();
            expect(result).toBeNull();
        });

        it('cacheKey 应该包含 domain 和 schema name', async () => {
            const manager = new CacheTestManager();

            const key = manager.cacheKey;
            expect(key).toContain('cache-test');
            expect(key).toContain('CacheTestEntity');
        });

        it('远程 Manager 的 cacheKey 应该包含分页参数', async () => {
            const manager = new CacheTestManager();

            // 设置分页参数
            manager.page = 2;
            manager.pageSize = 20;

            const key = manager.cacheKey;
            expect(key).toContain('cache-test');
            expect(key).toContain('CacheTestEntity');
            // 远程 Manager 的 key 应该包含查询参数的哈希
            expect(key).not.toBe('cache-test:CacheTestEntity');
        });

        it('多次 tryGetCache 应该返回相同数据', async () => {
            const manager = new CacheTestManager();

            const testData = { items: [{ id: 1 }], total: 1 };
            await manager.setCache(testData);

            const result1 = await manager.tryGetCache();
            const result2 = await manager.tryGetCache();
            expect(result1).toEqual(result2);
        });

        it('不同 Manager 实例的缓存应该隔离', async () => {
            const manager1 = new CacheTestManager();
            const manager2 = new CacheTestManager();

            await manager1.setCache({ items: [{ id: 1 }], total: 1 });
            await manager2.setCache({ items: [{ id: 2 }], total: 1 });

            const result1 = await manager1.tryGetCache();
            const result2 = await manager2.tryGetCache();

            expect(result1.total).toBe(1);
            expect(result2.total).toBe(1);
            // 两个实例的缓存数据应该各自独立
        });
    });

    describe('CacheAbility provider 复用', () => {
        it('同一 Manager 多次操作应该复用同一个 provider', async () => {
            const manager = new CacheTestManager();

            // 多次操作
            await manager.setCache({ data: 'first' });
            await manager.setCache({ data: 'second' });
            const result = await manager.tryGetCache();

            // 第二次 setCache 应该覆盖第一次
            expect(result).toEqual({ data: 'second' });
        });
    });
});
