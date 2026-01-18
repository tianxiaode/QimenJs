export interface ICacheProvider<TKey = string, TData = any> {
    get(key: TKey): Promise<TData | null> | TData | null;
    set(key: TKey, data: TData, ttl?: number): Promise<void> | void;
    has(key: TKey): Promise<boolean> | boolean;
    remove(key: TKey): Promise<void> | void;
    clear(): Promise<void> | void;
}

export interface ICacheEntry<T> {
  data: T;
  timestamp: number; // 存储时的时间戳
  ttl: number;       // 有效期（毫秒），0 表示永久
}