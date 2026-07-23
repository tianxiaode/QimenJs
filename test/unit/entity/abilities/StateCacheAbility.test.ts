/**
 * CacheAbility 独立单元测试
 *
 * 验证缓存能力的核心行为：
 * 1. cacheKey 生成（本地/远程/带参数）
 * 2. tryGetCache / setCache / clearCache
 * 3. updateData
 * 4. 多宿主隔离（abilityStates）
 * 5. dispose 后释放 provider
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

const mockProvider = {
    id: 'test-provider-id',
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/cache', () => ({
    CacheFactory: {
        create: jest.fn().mockResolvedValue(mockProvider),
        release: jest.fn(),
    },
}));

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { CacheAbility } from '@/entity/abilities/core/CacheAbility';
import { CacheFactory } from '@/cache';

// ============================================
// 辅助
// ============================================

interface TestHostSchema {
    name: string;
    domain?: string;
    cache?: { type: string };
}

function createCacheHost(schema: TestHostSchema, isRemote = false, toParams?: () => any) {
    class CacheHost extends ComposableBase {

        schema = schema;
        isRemote = isRemote;
        cacheTTL = 300000;
        sourceData = new Map<string, any>();
        toParams = toParams;
    }
    return new CacheHost() as any;
}

// ============================================
// 测试
// ============================================

describe('CacheAbility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('cacheKey', () => {
        it('本地状态应生成 domain:name 格式', () => {
            const host = createCacheHost({ name: 'User', domain: 'default' });
            expect(host.cacheKey).toBe('default:User');
            host.dispose();
        });

        it('本地状态无 domain 应使用 default', () => {
            const host = createCacheHost({ name: 'User' });
            expect(host.cacheKey).toBe('default:User');
            host.dispose();
        });

        it('远程状态无参数应生成 domain:name:root', () => {
            const host = createCacheHost({ name: 'User', domain: 'api' }, true, () => ({}));
            expect(host.cacheKey).toBe('api:User:root');
            host.dispose();
        });

        it('远程状态带参数应生成 domain:name:q:hash', () => {
            const host = createCacheHost({ name: 'User', domain: 'api' }, true, () => ({
                keyword: 'test',
                page: 1,
            }));
            const key = host.cacheKey;
            expect(key).toMatch(/^api:User:q:[a-z0-9]+$/);
            host.dispose();
        });

        it('相同参数应生成相同的 cacheKey', () => {
            const host1 = createCacheHost({ name: 'User', domain: 'api' }, true, () => ({
                keyword: 'test',
            }));
            const host2 = createCacheHost({ name: 'User', domain: 'api' }, true, () => ({
                keyword: 'test',
            }));
            expect(host1.cacheKey).toBe(host2.cacheKey);
            host1.dispose();
            host2.dispose();
        });

        it('不同参数顺序应生成相同的 cacheKey（参数排序）', () => {
            const host1 = createCacheHost({ name: 'User', domain: 'api' }, true, () => ({
                a: '1',
                b: '2',
            }));
            const host2 = createCacheHost({ name: 'User', domain: 'api' }, true, () => ({
                b: '2',
                a: '1',
            }));
            expect(host1.cacheKey).toBe(host2.cacheKey);
            host1.dispose();
            host2.dispose();
        });
    });

    describe('tryGetCache / setCache / clearCache', () => {
        it('setCache 应调用 provider.set', async () => {
            const host = createCacheHost({ name: 'User', domain: 'default' });
            const data = new Map([['1', { id: '1', name: 'test' }]]);
            await host.setCache(data);
            expect(CacheFactory.create).toHaveBeenCalled();
            expect(mockProvider.set).toHaveBeenCalledWith('default:User', data, 300000);
            host.dispose();
        });

        it('tryGetCache 应调用 provider.get', async () => {
            mockProvider.get.mockResolvedValueOnce({ data: 'cached' });
            const host = createCacheHost({ name: 'User', domain: 'default' });
            const result = await host.tryGetCache();
            expect(mockProvider.get).toHaveBeenCalledWith('default:User');
            host.dispose();
        });

        it('clearCache 应调用 provider.remove', async () => {
            const host = createCacheHost({ name: 'User', domain: 'default' });
            await host.clearCache();
            expect(mockProvider.remove).toHaveBeenCalledWith('default:User');
            host.dispose();
        });

        it('provider 应缓存复用（同一宿主不重复创建）', async () => {
            const host = createCacheHost({ name: 'User', domain: 'default' });
            await host.setCache(new Map());
            await host.tryGetCache();
            expect(CacheFactory.create).toHaveBeenCalledTimes(1);
            host.dispose();
        });
    });

    describe('updateSourceData', () => {
        it('应替换 sourceData 内容', () => {
            const host = createCacheHost({ name: 'User', domain: 'default' });
            host.sourceData.set('old', { id: 'old' });
            host.updateSourceData([
                { id: '1', name: 'a' },
                { id: '2', name: 'b' },
            ]);
            expect(host.sourceData.size).toBe(2);
            expect(host.sourceData.get('1')).toEqual({ id: '1', name: 'a' });
            expect(host.sourceData.get('2')).toEqual({ id: '2', name: 'b' });
            host.dispose();
        });
    });

    describe('多宿主隔离', () => {
        it('两个宿主应有独立的 provider', async () => {
            const host1 = createCacheHost({ name: 'User', domain: 'default' });
            const host2 = createCacheHost({ name: 'User', domain: 'default' });

            await host1.setCache(new Map());
            await host2.setCache(new Map());

            // CacheFactory.create 被调用两次（不同宿主各自创建）
            expect(CacheFactory.create).toHaveBeenCalledTimes(2);

            host1.dispose();
            host2.dispose();
        });
    });

    describe('dispose', () => {
        it('dispose 应释放 provider', async () => {
            const host = createCacheHost({ name: 'User', domain: 'default' });
            await host.setCache(new Map());
            host.dispose();
            expect(CacheFactory.release).toHaveBeenCalledWith('test-provider-id', true);
        });

        it('未使用 provider 时 dispose 不应报错', () => {
            const host = createCacheHost({ name: 'User', domain: 'default' });
            expect(() => host.dispose()).not.toThrow();
        });
    });
});
