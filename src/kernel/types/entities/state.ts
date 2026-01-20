import {
    IEntity,
    IFlatSearchParams,
    ILocalSearchParams,
    ITreeSearchParams,
    SearchParams,
} from './schema';

export interface ILocalChangeSet<T> {
    added: T[];
    updated: Map<string | number, T>;
    deletedIds: Set<string | number>;
}

export interface IBaseEntityState<T = IEntity> {
    loading: boolean;
    item: T | null;
    cacheTTL: number;

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
    updateData(...args: any[]): void;
    toParams(): Record<string, any>;
    reset(): void;
    dispose(): void;
}

export interface IRemoteEntityState<T = IEntity> extends IBaseEntityState<T> {
    snapshot: T | null; // 原始数据备份，用于还原
    isDirty(currentItem: T): boolean;
    edit(item: T): void ; // 进入编辑状态
    rollback(): T | null; // 撤销当前未保存的修改
}

export interface ILocalEntityState<T = IEntity> extends IBaseEntityState<T> {
    changes: ILocalChangeSet<T>;
    readonly hasChanges: boolean;
    commit(): void; // 本地确认变更
}

export interface IFlatRemoteEntityState<T = IEntity> extends IRemoteEntityState<T> {
    items: T[];
    search: IFlatSearchParams;
    total: number;
    pages: number;
    pageSizes: number[];
    page: number;
    pageSize: number;
    sortBy: string;;
    order: 'asc' | 'desc';

    //修改IFlatSearchParams的page参数，需要防止超出范围
    updateData(items: T[], total: number): void;
    //先调用该方法判断是否有效页，不是就发page-error事件
    isValidPage(page: number): boolean;
    //先调用该方法判断是否有效页大小，不是就发pageSize-error事件
    isValidPageSize(pageSize: number): boolean;
}

export interface IFlatLocalEntityState<T = IEntity> extends ILocalEntityState<T> {
    search: ILocalSearchParams;
    filteredItems: T[]; // 经过 keyword 过滤后的数据
    applyFilter(): Promise<T[]>;
}

export interface ITreeRemoteEntityState<T = IEntity> extends IRemoteEntityState<T> {
    search: ITreeSearchParams;
    nodes: Map<string | number, T>;
    hierarchy: Map<string | number | null, (string | number)[]>;
    // 核心：把后端返回的一段子项挂载到 parentId 下
    updateNodes(parentId: string | number | null, children: T[]): void;
}

export interface ITreeLocalEntityState<T = IEntity> extends ILocalEntityState<T> {
    search: ITreeSearchParams;
    matchKeys: Set<string | number>; // 命中的节点，用于 UI 高亮或过滤展示
    searchLocal(): Promise<T[]>;
}

export type EntityState<T = IEntity> =
    | IFlatRemoteEntityState<T>
    | IFlatLocalEntityState<T>
    | ITreeRemoteEntityState<T>
    | ITreeLocalEntityState<T>;
