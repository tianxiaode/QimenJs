import { ILogger } from '@/logger';
import {
    IEntity,
    IFlatSearchParams,
    ILocalSearchParams,
    ITreeSearchParams,
    SearchParams,
    Schema
} from './schema';

export interface ILocalChangeSet<T> {
    added: T[];
    updated: Map<string | number, T>;
}

export interface IDeletionPlan {
    localOnly: (string | number)[]; // 仅在新增缓冲区（added）的 ID，直接删了就行
    persistent: (string | number)[]; // 已经在数据库里的 ID，需要调用远程接口
}

export interface IBaseEntityState<T extends IEntity, TSearch extends SearchParams> {
    search: TSearch;
    loading: boolean;
    item: T | null;
    cacheTTL: number;
    idField: string;
    searchFields: string[];
    schema: Schema;

    /** * 获取当前搜索条件对应的缓存 Key
     * Flat 模式下可能是 page+pageSize+keyword
     * Tree 模式下可能是 parentId+keyword
     */
    getCacheKey(): string;

    /** 尝试从 Provider 中获取当前 search 对应的缓存 */
    tryGetCache(): Promise<any | null>;

    /** 将数据存入 Provider */
    setCache(data: any): Promise<void>;

    /** 清除所有缓存 */
    clearCache(): Promise<void>;

    // 基础操作
    updateData(...args: any[]): Promise<void>;
    updateItem(item: T): Promise<void>;
    delete(id: string | number | (string | number)[]): Promise<void>;
    toParams(): Record<string, any>;
    reset(): void;
    dispose(): void;
}

export interface IRemoteEntityState<
    T extends IEntity,
    TSearch extends SearchParams,
> extends IBaseEntityState<T, TSearch> {
    snapshot: T | null; // 原始数据备份，用于还原
    isDirty(currentItem: T): boolean;
    edit(item: T): void; // 进入编辑状态
    rollback(): T | null; // 撤销当前未保存的修改
}

export interface ILocalEntityState<
    T extends IEntity,
    TSearch extends SearchParams,
> extends IBaseEntityState<T, TSearch> {
    sourceData: T[]; // 基础数据源
    changes: ILocalChangeSet<T>;
    readonly hasChanges: boolean;
    items: T[]; // 合并了 changes 后的当前数据列表
    add(item: T): void;
    update(item: Partial<T>): void;    
    addedItems: T[];
    updatedItems: T[];
    pendingItems: T[];
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan;
    confimDelete(plan: IDeletionPlan): void;
    matchKeyword(item: T, keyword: string): boolean;
}

export interface IFlatRemoteEntityState<
    T extends IEntity,
    TSearch extends IFlatSearchParams,
> extends IRemoteEntityState<T, TSearch> {
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

    //修改IFlatSearchParams的page参数，需要防止超出范围
    updateData(items: T[], total: number): Promise<void>;
    //先调用该方法判断是否有效页，不是就发page-error事件
    isValidPage(page: number): boolean;
    //先调用该方法判断是否有效页大小，不是就发pageSize-error事件
    isValidPageSize(pageSize: number): boolean;
}

export interface IFlatLocalEntityState<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
> extends ILocalEntityState<T, TSearch> {}

export interface ITreeRemoteEntityState<
    T extends IEntity,
    TSearch extends ITreeSearchParams,
> extends IRemoteEntityState<T, TSearch> {
    nodes: Map<string | number, T>;
    hierarchy: Map<string | number | null, (string | number)[]>;
    logger: ILogger;
    idField: string;
    parentIdField: string;
    root: string | number | null;
    expandedField: string;
    leafField: string;
    items: T[]; // 当前层级的子节点列表
    isLoaded(id: string | number): boolean;
    setLoaded(id: string | number, loaded: boolean): void
}

export type EntityState<T extends IEntity, TSearch extends SearchParams> =
    | IFlatRemoteEntityState<T, TSearch>
    | IFlatLocalEntityState<T, TSearch>
    | ITreeRemoteEntityState<T, TSearch>;

export interface ITreePathAbility<T extends IEntity> {
    ingest(data: T | T[], manualParentId?: string | number | null): void;
    rebuildDescendantsPaths(pid: any, parentPath: string, nextDepth: number): void;
    toggleExpand(id: string | number | T, expanded?: boolean): void;
    toggleLeaf(id: string | number | T, leaf?: boolean): void;
}

export interface ITreeLifecycleAbility<T extends IEntity> {
    removeNode(id: string | number):void;
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

export type ITreeRemoteEntityStateExtenstion<
    T extends IEntity,
    TSearch extends ITreeSearchParams,
> = ITreeRemoteEntityState<T, TSearch> &
    ITreePathAbility<T> &
    ITreeLifecycleAbility<T> &
    ITreeSearchAbility<T> &
    ITreeViewAbility<T>;
