export type CacheType = 'local' | 'indexdb' | 'memory' | 'session' | string;
export interface ICacheProvider<TKey = string, TData = any> {
    readonly id: string;
    readonly type: CacheType;
    get(key: TKey): Promise<TData | null>;
    set(key: TKey, data: TData, ttl?: number): Promise<void>;
    has(key: TKey): Promise<boolean>;
    remove(key: TKey): Promise<void>;
    clear(): Promise<void> | void;
}
export interface ICacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}
//# sourceMappingURL=cache.d.ts.map