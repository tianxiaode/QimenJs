import { ILogger } from '@orbitjs/logger';
import { ICacheProvider, IEntity, ITreeLifecycleAbility, ITreePathAbility, ITreeRemoteEntityState, ITreeSearchAbility, ITreeSearchParams, ITreeViewAbility, TreeSchema } from '../../types';
import { RemoteEntityState } from './RemoteEntityState';
export declare class TreeRemoteEntityState<T extends IEntity, TSearch extends ITreeSearchParams> extends RemoteEntityState<T, TSearch> implements ITreeRemoteEntityState<T, TSearch> {
    nodes: Map<string | number, T>;
    hierarchy: Map<string | number | null, (string | number)[]>;
    logger: ILogger;
    items: T[];
    constructor(schema: TreeSchema, cacheProvider?: ICacheProvider, cacheTTL?: number);
    toParams(): any;
    updateData(data: T | T[]): Promise<void>;
    updateItem(item: T): Promise<void>;
    delete(id: string | number | (string | number)[]): Promise<void>;
    isLoaded(id: string | number): boolean;
    setLoaded(id: string | number, loaded?: boolean): void;
    getCacheKey(): string;
    reset(): void;
    protected getDefaultSearch(): TSearch;
    private syncDataAndState;
    dispose(): void;
}
export interface TreeRemoteEntityState<T extends IEntity, TSearch extends ITreeSearchParams> extends ITreePathAbility<T>, ITreeLifecycleAbility<T>, ITreeSearchAbility<T>, ITreeViewAbility<T> {
}
//# sourceMappingURL=TreeRemoteEntityState.d.ts.map