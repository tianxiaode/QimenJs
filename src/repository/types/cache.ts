export interface CacheItem {
    data: any;
    expire: number;
}

export interface ICacheManager {
    get(namespace: string, action: string, payload: any): Promise<any | null>;
    set(
        namespace: string,
        action: string,
        payload: any,
        data: any,
        customTTL?: number // 允许覆盖默认时间
    ): Promise<void>;
    startCleanupInterval(ms: number): void;
    clear(namespace: string): Promise<void>;
}
