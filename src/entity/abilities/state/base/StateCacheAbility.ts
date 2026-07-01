import type { AbilityDefinition } from '@/composable';
import { CacheFactory } from '@/cache';
import type { ICacheProvider } from '@/cache';

/**
 * StateCacheAbility - 缓存能力
 * 
 * 为宿主提供缓存管理功能，通过 CacheFactory 创建缓存提供者。
 * this 指向宿主（BaseEntityState），this.schema 可直接访问。
 * 私有状态 _provider 通过 abilityState 管理，onCleanup 注册释放回调。
 */
export const StateCacheAbility: AbilityDefinition = {
    cacheKey: {
        get() {
            return this._getCacheKey();
        },
    },

    async tryGetCache() {
        const provider = await this._getCacheProvider();
        return await provider.get(this._getCacheKey());
    },

    async setCache(data: any) {
        const provider = await this._getCacheProvider();
        await provider.set(this._getCacheKey(), data, this.cacheTTL);
    },

    async clearCache() {
        const provider = await this._getCacheProvider();
        await provider.remove(this._getCacheKey());
    },

    updateData(result: any[]) {
        this.sourceData.clear();
        result.forEach((item: any) => {
            this.sourceData.set(item.id, item);
        });
    },

    /**
     * 获取缓存键
     */
    _getCacheKey(): string {
        const { schema } = this;
        const domain = schema.domain || 'default';
        const base = `${domain}:${schema.name}`;

        if (!this.isRemote) {
            return base;
        }

        const params = this.toParams ? this.toParams() : {};

        if (Object.keys(params).length === 0) {
            return `${base}:root`;
        }

        const queryStr = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');

        return `${base}:q:${StateCacheAbility._simpleHash(queryStr)}`;
    },

    /**
     * 获取或创建缓存提供者
     * 
     * 注意：CacheFactory.create 是异步的，这里用 abilityState 存储 Promise，
     * 后续调用直接 await 同一个 Promise，避免重复创建。
     */
    async _getCacheProvider(): Promise<ICacheProvider> {
        let providerPromise = this.abilityState('StateCache:provider') as Promise<ICacheProvider> | undefined;
        if (!providerPromise) {
            providerPromise = CacheFactory.create((this.schema as any).cache?.type || 'memory').then(provider => {
                this.onCleanup(() => CacheFactory.release(provider.id, true));
                return provider;
            });
            this.setAbilityState('StateCache:provider', providerPromise);
        }
        return providerPromise;
    },
};

/**
 * 简单哈希函数（静态工具）
 */
StateCacheAbility._simpleHash = function(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
};
