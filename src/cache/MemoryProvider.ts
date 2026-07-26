import { ICacheEntry } from './types';
import { BaseCacheProvider } from './BaseCacheProvider';

/**
 * 内存缓存提供者
 * 基于 Map 实现的内存缓存，适用于临时数据存储
 *
 * @template TKey - 缓存键类型，默认为string
 * @template TData - 缓存数据类型，默认为any
 */
export class MemoryProvider<TKey = string, TData = any> extends BaseCacheProvider<TKey, TData> {
    private storage = new Map<string, ICacheEntry<TData>>();
    type: string = 'memory';

    constructor() {
        super();
    }

    protected async rawGet(key: string) {
        return this.storage.get(key) || null;
    }

    protected async rawSet(key: string, entry: ICacheEntry<TData>) {
        this.storage.set(key, entry);
    }

    async has(key: TKey) {
        return this.storage.has(this.resolveKey(key));
    }

    async remove(key: TKey) {
        this.storage.delete(this.resolveKey(key));
    }

    async clear() {
        this.storage.clear();
    }
}
