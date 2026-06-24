import { CacheType, ICacheProvider } from './types';
export declare class CacheFactory {
    static _instances: Map<string, ICacheProvider<string, any>>;
    static create(type: CacheType, _offline?: boolean): Promise<ICacheProvider>;
    static release(id: string, autoClear?: boolean): void;
}
//# sourceMappingURL=CacheFactory.d.ts.map