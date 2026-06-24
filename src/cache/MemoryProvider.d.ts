import { ICacheEntry } from './types';
import { BaseCacheProvider } from './BaseCacheProvider';
export declare class MemoryProvider<TKey = string, TData = any> extends BaseCacheProvider<TKey, TData> {
    private storage;
    type: string;
    constructor();
    protected rawGet(key: string): Promise<ICacheEntry<TData> | null>;
    protected rawSet(key: string, entry: ICacheEntry<TData>): Promise<void>;
    has(key: TKey): Promise<boolean>;
    remove(key: TKey): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=MemoryProvider.d.ts.map