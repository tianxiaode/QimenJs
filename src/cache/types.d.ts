/**
 * 缓存类型定义
 * 支持多种缓存介质：localStorage、IndexedDB、内存、sessionStorage等
 */
export type CacheType = 'local' | 'indexdb' | 'memory' | 'session' | string;
/**
 * 缓存提供者接口
 * 定义了缓存操作的标准接口
 * @template TKey - 缓存键类型，默认为string
 * @template TData - 缓存数据类型，默认为any
 */
export interface ICacheProvider<TKey = string, TData = any> {
    /** 缓存实例的唯一标识 */
    readonly id: string;
    /** 缓存类型 */
    readonly type: CacheType;
    /**
     * 获取缓存数据
     * @param key - 缓存键
     * @returns 缓存数据，不存在或已过期返回null
     */
    get(key: TKey): Promise<TData | null>;
    /**
     * 设置缓存数据
     * @param key - 缓存键
     * @param data - 缓存数据
     * @param ttl - 有效期（毫秒），0表示永久有效
     */
    set(key: TKey, data: TData, ttl?: number): Promise<void>;
    /**
     * 检查缓存是否存在
     * @param key - 缓存键
     * @returns 是否存在
     */
    has(key: TKey): Promise<boolean>;
    /**
     * 删除指定缓存
     * @param key - 缓存键
     */
    remove(key: TKey): Promise<void>;
    /**
     * 清空所有缓存
     */
    clear(): Promise<void> | void;
}
/**
 * 缓存条目接口
 * @template T - 缓存数据类型
 */
export interface ICacheEntry<T> {
    /** 缓存数据 */
    data: T;
    /** 存储时的时间戳（毫秒） */
    timestamp: number;
    /** 有效期（毫秒），0 表示永久有效 */
    ttl: number;
}
//# sourceMappingURL=types.d.ts.map