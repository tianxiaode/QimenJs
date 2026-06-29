import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import { CacheFactory } from '@/cache';
import type { IBaseEntityState } from '@/entity/types';
import type { ICacheProvider } from '@/cache';

export class StateCacheAbility extends AbilityBase {
    private _provider: ICacheProvider | null = null;

    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            cacheKey: { get: () => proxy.self.getCacheKey() },

            tryGetCache: async () => {
                const provider = await proxy.self.getProvider();
                return await provider.get(proxy.self.getCacheKey());
            },

            setCache: async (data: any) => {
                const provider = await proxy.self.getProvider();
                const host = proxy.host as IBaseEntityState;
                await provider.set(proxy.self.getCacheKey(), data, host.cacheTTL);
            },

            clearCache: async () => {
                const provider = await proxy.self.getProvider();
                await provider.remove(proxy.self.getCacheKey());
            },

            updateData: function(this: IBaseEntityState, result: any[]) {
                (this as any).sourceData.clear();
                result.forEach((item: any) => {
                    (this as any).sourceData.set(item.id, item);
                });
            },
        };
    }

    protected getCacheKey(): string {
        const host: any = this.host;
        const { schema } = host;
        const domain = schema.domain || 'default';

        const base = `${domain}:${schema.name}`;

        if (!host.isRemote) {
            return base;
        }

        const params = host.toParams ? host.toParams() : {};

        if (Object.keys(params).length === 0) {
            return `${base}:root`;
        }

        const queryStr = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');

        return `${base}:q:${this.simpleHash(queryStr)}`;
    }

    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }

    private async getProvider(): Promise<ICacheProvider> {
        const host = this.host as IBaseEntityState;
        const { schema } = host;
        if (this._provider) return this._provider;
        this._provider = await CacheFactory.create((schema as any).cache?.type || 'memory');
        return this._provider!;
    }

    protected onDispose(): void {
        if(this._provider){
            CacheFactory.release(this._provider?.id, true);
        }
        
        this._provider = null;
    }
}
