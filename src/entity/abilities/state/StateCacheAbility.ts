import { AbilityBase, type IExposeResult } from '@/composable';
import { CacheFactory } from '@/cache';
import type { IBaseEntityState } from '@/entity/types';
import type { ICacheProvider } from '@/cache';

export class StateCacheAbility extends AbilityBase {
    private _provider: ICacheProvider | null = null;

    protected expose(): IExposeResult {
        return {
            /**
             * 缓存键：Getter 模式
             * 逻辑：如果 schema 定义了名称，则使用 schema 名，否则回退
             */
            cacheKey: { get: () => this.getCacheKey() },

            /**
             * 尝试获取缓存
             */
            tryGetCache: async () => {
                const provider = await this.getProvider();
                return await provider.get(this.getCacheKey());
            },

            /**
             * 设置缓存
             */
            setCache: async (data: any) => {
                const provider = await this.getProvider();
                const host = this.host as IBaseEntityState;
                await provider.set(this.getCacheKey(), data, host.cacheTTL);
            },

            /**
             * 清理缓存
             */
            clearCache: async () => {
                const provider = await this.getProvider();
                await provider.remove(this.getCacheKey());
            },

            /**
             * 更新数据
             */
            updateData: (result: any[]) => {
                const host = this.host as any;
                host.sourceData.clear();
                result.forEach((item: any) => {
                    host.sourceData.set(item.id, item);
                });
            },
        };
    }

    protected getCacheKey(): string {
        const host: any = this.host;
        const { schema } = host;
        const domain = schema.domain || 'default';

        // 基础键直接使用 Schema 的名称（比如 'User', 'Project'）
        const base = `${domain}:${schema.name}`;

        // 1. 本地模式：直接返回名称，不需要任何参数后缀
        // 这样下次进入页面，tryGetCache('User') 就能直接拿到全量数据
        if (!host.isRemote) {
            return base;
        }

        // 2. 远程模式：需要区分不同的查询结果集
        const params = host.toParams ? host.toParams() : {};

        // 如果没有参数（如首屏默认请求），返回基础名
        if (Object.keys(params).length === 0) {
            return `${base}:root`;
        }

        // 否则根据参数生成摘要，防止 Key 过长
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
