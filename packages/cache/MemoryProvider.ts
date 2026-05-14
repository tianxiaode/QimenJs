import { ICacheEntry } from '../types';
import { BaseCacheProvider } from './BaseCacheProvider';

/**
 * 内存缓存提供者
 * 使用Map作为底层存储，数据存储在内存中
 * 适用于临时缓存或测试场景
 * @template TKey - 缓存键类型，默认为string
 * @template TData - 缓存数据类型，默认为any
 */
export class MemoryProvider<TKey = string, TData = any> extends BaseCacheProvider<TKey, TData> {
    /** 内存存储 */
    private storage = new Map<string, ICacheEntry<TData>>();
    /** 缓存类型 */
    type: string = 'memory';

    /**
     * 构造函数
     */
    constructor() {
        super();
    }

    /**
     * 从内存存储获取缓存条目
     * @param key - 完整的缓存键
     * @returns 缓存条目，不存在返回null
     */
    protected async rawGet(key: string) {
        return this.storage.get(key) || null;
    }

    /**
     * 向内存存储设置缓存条目
     * @param key - 完整的缓存键
     * @param entry - 缓存条目
     */
    protected async rawSet(key: string, entry: ICacheEntry<TData>) {
        this.storage.set(key, entry);
    }

    /**
     * 检查缓存是否存在
     * @param key - 缓存键
     * @returns 是否存在
     */
    async has(key: TKey) {
        return this.storage.has(this.resolveKey(key));
    }

    /**
     * 删除指定缓存
     * @param key - 缓存键
     */
    async remove(key: TKey) {
        this.storage.delete(this.resolveKey(key));
    }

    /**
     * 清空所有缓存
     */
    async clear() {
        this.storage.clear();
    }
}
