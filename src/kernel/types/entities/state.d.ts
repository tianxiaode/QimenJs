import { ILogger } from '@/logger';
import { IEntity, IFlatSearchParams, ILocalSearchParams, ITreeSearchParams, SearchParams, Schema } from './schema';
export interface ILocalChangeSet<T> {
    added: T[];
    updated: Map<string | number, T>;
}
export interface IDeletionPlan {
    localOnly: (string | number)[];
    persistent: (string | number)[];
}
export interface IBaseEntityState<T extends IEntity, TSearch extends SearchParams> {
    logger: ILogger;
    search: TSearch;
    loading: boolean;
    items: T[];
    item: T | null;
    schema: Schema;
    cacheTTL: number;
    isRemote: boolean;
    hasChange: boolean;
}
export interface IRemoteEntityState<T extends IEntity, TSearch extends SearchParams> extends IBaseEntityState<T, TSearch> {
    isRemote: true;
    snapshot: T | null;
    isDirty(currentItem: T): boolean;
    edit(item: T): void;
    rollback(): T | null;
}
export interface IFlatRemoteEntityState<T extends IEntity, TSearch extends IFlatSearchParams> extends IRemoteEntityState<T, TSearch> {
    items: T[];
    total: number;
    pages: number;
    pageSizes: number[];
    page: number;
    pageSize: number;
    sortBy: string;
    order: 'asc' | 'desc';
    filterBy: string;
    searchBy: Partial<TSearch>;
    updateData(items: T[], total: number): Promise<void>;
    isValidPage(page: number): boolean;
    isValidPageSize(pageSize: number): boolean;
}
export interface IFlatLocalEntityState<T extends IEntity, TSearch extends ILocalSearchParams> extends IBaseEntityState<T, TSearch> {
    isRemote: false;
}
export interface ITreeRemoteEntityState<T extends IEntity, TSearch extends ITreeSearchParams> extends IRemoteEntityState<T, TSearch> {
    nodes: Map<string | number, T>;
    hierarchy: Map<string | number | null, (string | number)[]>;
    logger: ILogger;
    idField: string;
    parentIdField: string;
    root: string | number | null;
    expandedField: string;
    leafField: string;
    items: T[];
    isLoaded(id: string | number): boolean;
    setLoaded(id: string | number, loaded: boolean): void;
}
export type EntityState<T extends IEntity, TSearch extends SearchParams> = IFlatRemoteEntityState<T, TSearch> | IFlatLocalEntityState<T, TSearch> | ITreeRemoteEntityState<T, TSearch>;
export interface ITreePathAbility<T extends IEntity> {
    ingest(data: T | T[], manualParentId?: string | number | null): void;
    rebuildDescendantsPaths(pid: any, parentPath: string, nextDepth: number): void;
    toggleExpand(id: string | number | T, expanded?: boolean): void;
    toggleLeaf(id: string | number | T, leaf?: boolean): void;
}
export interface ITreeLifecycleAbility<T extends IEntity> {
    removeNode(id: string | number): void;
    moveNode(id: string | number, targetPid: string | number | null): void;
    syncChildren(pid: string | number | null, newData: T[]): void;
    getChildren(pid?: any, predicate?: any): T[];
}
export interface ITreeSearchAbility<T extends IEntity> {
    applySearchExpansion(): void;
    applySort(list: T[]): T[];
    matchKeyword(node: T, keyword: string): boolean;
}
export interface ITreeViewAbility<T extends IEntity> {
    refreshView(): void;
}
export type ITreeRemoteEntityStateExtenstion<T extends IEntity, TSearch extends ITreeSearchParams> = ITreeRemoteEntityState<T, TSearch> & ITreePathAbility<T> & ITreeLifecycleAbility<T> & ITreeSearchAbility<T> & ITreeViewAbility<T>;
//# sourceMappingURL=state.d.ts.map