import type { AbilityDefinition } from '@/composable';
import { CacheFactory } from '@/cache';
import type { ICacheProvider } from '@/cache';

/**
 * 简单哈希函数
 */
function _simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}

/**
 * CacheAbility - 缓存能力
 *
 * 为宿主提供缓存管理功能，通过 CacheFactory 创建缓存提供者。
 * this 指向宿主（Manager），this.schema 可直接访问。
 * 私有状态 _provider 通过 abilityState 管理，onCleanup 注册释放回调。
 */
export const CacheAbility = {
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

    /**
     * 更新 sourceData（本地 Manager 专用）
     */
    updateSourceData(result: any[]) {
        this.sourceData.clear();
        result.forEach((item: any) => {
            this.sourceData.set(item.id, item);
        });
    },

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

        return `${base}:q:${_simpleHash(queryStr)}`;
    },

    async _getCacheProvider(): Promise<ICacheProvider> {
        let providerPromise = this.abilityState('Cache:provider') as
            | Promise<ICacheProvider>
            | undefined;
        if (!providerPromise) {
            providerPromise = CacheFactory.create(
                (this.schema as any).cache?.type || 'memory'
            ).then(provider => {
                this.onCleanup(() => CacheFactory.release(provider.id, true));
                return provider;
            });
            this.setAbilityState('Cache:provider', providerPromise);
        }
        return providerPromise;
    },
} satisfies AbilityDefinition;
