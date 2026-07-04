import { string } from '@orbit-js/utils';
import { CacheType, ICacheEntry, ICacheProvider } from './types';

export abstract class BaseCacheProvider<TKey = string, TData = any> implements ICacheProvider<TKey, TData> {
    id: string = '';
    type: CacheType = '';

    // 抽象方法：交给具体介质实现
    protected abstract rawGet(key: string): Promise<ICacheEntry<TData> | null>;
    protected abstract rawSet(key: string, entry: ICacheEntry<TData>): Promise<void>;
    abstract remove(key: TKey): Promise<void>;
    abstract clear(): Promise<void>;
    abstract has(key: TKey): Promise<boolean>;

    constructor(){
        this.id = string.getId(this.type + '-cache');
    }

    /**
     * 统一的获取逻辑（含过期检查）
     */
    async get(key: TKey): Promise<TData | null> {
        const fullKey = this.resolveKey(key);
        const entry = await this.rawGet(fullKey);

        if (!entry) return null;

        // 检查是否过期
        if (entry.ttl > 0 && Date.now() - entry.timestamp > entry.ttl) {
            await this.remove(key);
            return null;
        }

        return entry.data;
    }

    /**
     * 统一的存储逻辑
     */
    async set(key: TKey, data: TData, ttl: number = 0): Promise<void> {
        const fullKey = this.resolveKey(key);
        const entry: ICacheEntry<TData> = {
            data,
            timestamp: Date.now(),
            ttl,
        };
        await this.rawSet(fullKey, entry);
    }

    protected resolveKey(key: TKey): string {
        return `${this.type}-cache:${String(key)}`;
    }
}
