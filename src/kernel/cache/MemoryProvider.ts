import { ICacheEntry } from '../types';
import { BaseCacheProvider } from './BaseCacheProvider';

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
