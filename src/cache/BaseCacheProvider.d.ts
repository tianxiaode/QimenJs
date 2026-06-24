import { CacheType, ICacheEntry, ICacheProvider } from './types';
export declare abstract class BaseCacheProvider<TKey = string, TData = any> implements ICacheProvider<TKey, TData> {
    id: string;
    type: CacheType;
    protected abstract rawGet(key: string): Promise<ICacheEntry<TData> | null>;
    protected abstract rawSet(key: string, entry: ICacheEntry<TData>): Promise<void>;
    abstract remove(key: TKey): Promise<void>;
    abstract clear(): Promise<void>;
    abstract has(key: TKey): Promise<boolean>;
    constructor();
    /**
     * 统一的获取逻辑（含过期检查）
     */
    get(key: TKey): Promise<TData | null>;
    /**
     * 统一的存储逻辑
     */
    set(key: TKey, data: TData, ttl?: number): Promise<void>;
    protected resolveKey(key: TKey): string;
}
//# sourceMappingURL=BaseCacheProvider.d.ts.map