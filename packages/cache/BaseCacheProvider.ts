import { string } from '@orbitjs/utils';
import { CacheType, ICacheEntry, ICacheProvider } from '../types';

/**
 * 缓存提供者基类
 * 实现了缓存的核心逻辑，包括过期检查、键解析等
 * 具体的存储介质由子类实现
 * @template TKey - 缓存键类型，默认为string
 * @template TData - 缓存数据类型，默认为any
 */
export abstract class BaseCacheProvider<TKey = string, TData = any> implements ICacheProvider<TKey, TData> {
    /** 缓存实例的唯一标识 */
    id: string = '';
    /** 缓存类型 */
    type: CacheType = '';

    /**
     * 从底层存储获取缓存条目
     * @param key - 完整的缓存键
     * @returns 缓存条目，不存在返回null
     */
    protected abstract rawGet(key: string): Promise<ICacheEntry<TData> | null>;
    
    /**
     * 向底层存储设置缓存条目
     * @param key - 完整的缓存键
     * @param entry - 缓存条目
     */
    protected abstract rawSet(key: string, entry: ICacheEntry<TData>): Promise<void>;
    
    /**
     * 删除指定缓存
     * @param key - 缓存键
     */
    abstract remove(key: TKey): Promise<void>;
    
    /**
     * 清空所有缓存
     */
    abstract clear(): Promise<void>;
    
    /**
     * 检查缓存是否存在
     * @param key - 缓存键
     * @returns 是否存在
     */
    abstract has(key: TKey): Promise<boolean>;

    /**
     * 构造函数
     * 自动生成唯一标识
     */
    constructor(){
        this.id = string.getId(this.type + '-cache');
    }

    /**
     * 获取缓存数据（含过期检查）
     * @param key - 缓存键
     * @returns 缓存数据，不存在或已过期返回null
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
     * 设置缓存数据
     * @param key - 缓存键
     * @param data - 缓存数据
     * @param ttl - 有效期（毫秒），默认为0表示永久有效
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

    /**
     * 解析缓存键，生成完整的缓存键
     * @param key - 原始缓存键
     * @returns 完整的缓存键，格式为：{type}-cache:{key}
     */
    protected resolveKey(key: TKey): string {
        return `${this.type}-cache:${String(key)}`;
    }
}
