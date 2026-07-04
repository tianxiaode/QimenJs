/**
 * Manager 能力接口定义
 *
 * 为 src\entity\manager\ 下的所有 Manager 类定义 export interface，
 * 将类通过 Ability 组合获得的公共方法以接口形式显式声明。
 */

import type {
    ICoreEntityManager,
    IBaseEntityManager,
    IEntity,
    SearchParams,
    ILocalSearchParams,
    IFlatSearchParams,
    ITreeSearchParams,
    ILocalChangeSet,
    IDeletionPlan,
} from '@/entity/types';

import type { IEventScope, EventHandler } from '@/events';

import type { DomainConfig, SystemConfig } from '@/registry';

// ============================================
// 核心层接口
// ============================================

/**
 * 核心实体管理器完整接口
 *
 * 包含 CoreEntityManager 自身定义的属性/方法，
 * 以及通过 EventAbility、DomainAbility、SystemAbility、SchemaAbility 注入的方法。
 */
export interface ICoreEntityManagerFull extends ICoreEntityManager {
    // ===== EventAbility 注入 =====
    readonly eventScope: IEventScope;
    on(event: string, handler: EventHandler): () => void;
    once(event: string, handler: EventHandler): void;
    emit(event: string, data?: any): void;

    // ===== DomainAbility 注入 =====
    readonly domainConfig: DomainConfig;

    // ===== SystemAbility 注入 =====
    systemConfig(): Partial<SystemConfig>;
    systemConfig<K extends keyof SystemConfig>(key: K): any;

    // ===== SchemaAbility 注入 =====
    readonly schemaKeys: Record<string, string>;
    readonly schemaTree: { isTree: boolean; isLazy: boolean; root: any };
    readonly schemaSort: { prop: string; order: string };
    readonly schemaFilters: string[];
    readonly schemaIdType: string;
}

// ============================================
// 基础层接口
// ============================================

/**
 * 基础实体管理器完整接口
 *
 * 包含 BaseEntityManager 自身定义的属性/方法，
 * 以及从 CoreEntityManager 继承的所有能力。
 */
export interface IBaseEntityManagerFull<TSearch extends SearchParams = SearchParams>
    extends ICoreEntityManagerFull, IBaseEntityManager<TSearch> {
}

// ============================================
// 本地 Manager 接口
// ============================================

/**
 * 本地只读实体管理器接口
 *
 * 对应 LocalReadonlyEntityManager 类的完整公共 API。
 * 组合能力：FlatLocalStateAbility + LocalListAbility + LocalGetAbility
 */
export interface ILocalReadonlyEntityManager<TSearch extends ILocalSearchParams = ILocalSearchParams>
    extends IBaseEntityManagerFull<TSearch> {

    // ===== 标识 =====
    isRemote: false;

    // ===== FlatLocalStateAbility (schemaGetters) =====
    readonly idField: string;
    readonly idType: string;
    readonly nameField: string;
    readonly defaultSort: string;
    readonly defaultOrder: string;
    readonly searchFields: string[];
    readonly isTree: boolean;
    readonly isLazy: boolean;
    readonly root: any;
    readonly parentIdField: string;
    readonly childrenField: string;
    readonly pathField: string;
    readonly leafField: string;
    readonly expandedField: string;
    readonly useFlat: boolean;

    // ===== FlatLocalStateAbility (cacheMethods) =====
    readonly cacheKey: string;
    tryGetCache(): Promise<any>;
    setCache(data: any): Promise<void>;
    clearCache(): Promise<void>;
    updateSourceData(result: any[]): void;

    // ===== FlatLocalStateAbility (dirtyMethods) =====
    isDirty(item?: any): boolean;
    startEdit(item: any): void;
    submitEdit(item: any): void;
    cancelEdit(item: any): void;
    rollbackAll(): void;

    // ===== FlatLocalStateAbility (mutationMethods) =====
    readonly hasChanges: boolean;
    readonly changes: ILocalChangeSet;
    readonly adds: any[];
    readonly updates: any[];
    addItem(item: any): Promise<void>;
    updateItem(item: any): Promise<void>;
    updateData(result: any[]): Promise<void>;
    softDelete(plan: IDeletionPlan): Promise<void>;
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan;
    confirmDelete(): Promise<void>;
    rollbackDelete(): Promise<void>;
    clearChanges(): void;

    // ===== FlatLocalStateAbility (stateMethods) =====
    readonly isEmpty: boolean;
    readonly total: number;
    refreshView(): Promise<void>;
    edit(item: any): void;
    rollback(): void;

    // ===== FlatLocalStateAbility (searchMethods) → 被 LocalListAbility 覆盖 =====
    toParams(): Record<string, any>;
    searchBy(search: any): void;
    matchKeyword(item: any): boolean;
    applySort(list: any[]): any[];

    // ===== LocalListAbility (覆盖 searchMethods 的 filter/sort) =====
    list(): Promise<any[]>;
    refresh(): Promise<void>;
    filter(keyword: string): any[];
    sort(sortBy: string, sortOrder: 'asc' | 'desc'): any[];

    // ===== LocalGetAbility =====
    get(id: string | number): any | undefined;
}

/**
 * 本地 CRUD 实体管理器接口
 *
 * 对应 LocalCrudEntityManager 类的完整公共 API。
 * 在 LocalReadonlyEntityManager 基础上增加：
 * FlatLocalMutationAbility + FlatLocalDeleteAbility
 */
export interface ILocalCrudEntityManager<TSearch extends ILocalSearchParams = ILocalSearchParams>
    extends ILocalReadonlyEntityManager<TSearch> {

    // ===== FlatLocalMutationAbility =====
    create(item: any): any;
    update(item: any): any;
    toggle(item: any, field: string): void;
    save(isBatch?: boolean): void;

    // ===== FlatLocalDeleteAbility =====
    delete(ids: (string | number)[], immediate?: boolean): Promise<IDeletionPlan>;
}

// ============================================
// 远程 Manager 接口
// ============================================

/**
 * 远程只读实体管理器接口
 *
 * 对应 RemoteReadonlyEntityManager 类的完整公共 API。
 * 组合能力：SchemaProxyAbility + CacheAbility + DirtyAbility + SearchAbility +
 *          DomainPagingAbility + FlatRemoteStateAbility + FlatRemoteListAbility +
 *          FlatRemoteGetAllAbility + RemoteGetAbility + FlatRemoteQueryAbility
 */
export interface IRemoteReadonlyEntityManager<TSearch extends IFlatSearchParams = IFlatSearchParams>
    extends IBaseEntityManagerFull<TSearch> {

    // ===== 标识 =====
    isRemote: true;

    // ===== 分页状态 =====
    total: number;
    page: number;
    pages: number;
    hasMore: boolean;

    // ===== DomainPagingAbility =====
    pageSize: number;
    pageSizes: number[];

    // ===== SchemaProxyAbility =====
    readonly idField: string;
    readonly idType: string;
    readonly nameField: string;
    readonly defaultSort: string;
    readonly defaultOrder: string;
    readonly searchFields: string[];
    readonly isTree: boolean;
    readonly isLazy: boolean;
    readonly root: any;
    readonly parentIdField: string;
    readonly childrenField: string;
    readonly pathField: string;
    readonly leafField: string;
    readonly expandedField: string;
    readonly useFlat: boolean;

    // ===== CacheAbility =====
    readonly cacheKey: string;
    tryGetCache(): Promise<any>;
    setCache(data: any): Promise<void>;
    clearCache(): Promise<void>;
    updateSourceData(result: any[]): void;

    // ===== DirtyAbility =====
    isDirty(item?: any): boolean;
    startEdit(item: any): void;
    submitEdit(item: any): void;
    cancelEdit(item: any): void;
    rollbackAll(): void;

    // ===== SearchAbility → 被 FlatRemoteQueryAbility 覆盖 =====
    toParams(): Record<string, any>;
    matchKeyword(item: any): boolean;
    applySort(list: any[]): any[];

    // ===== FlatRemoteStateAbility =====
    readonly isEmpty: boolean;
    updateData(list: any[], total?: number): void;
    updateItem(item: any): void;
    isValidPage(page: number): boolean;
    deleteFromItems(id: string | number | (string | number)[]): void;
    refreshView(): void;
    edit(item: any): void;
    rollback(): void;

    // ===== FlatRemoteListAbility =====
    list(): Promise<any[]>;
    refresh(): Promise<any[]>;

    // ===== FlatRemoteGetAllAbility =====
    getAll(): Promise<any[]>;

    // ===== RemoteGetAbility =====
    get(id: string | number): Promise<any>;

    // ===== FlatRemoteQueryAbility (覆盖 SearchAbility 的 filter/searchBy/sort) =====
    prev(): Promise<any[]>;
    next(): Promise<any[]>;
    jump(page: number): Promise<any[]>;
    changeSize(size: number): Promise<any[]>;
    filter(text: string): Promise<any[]>;
    searchBy(search: any): Promise<any[]>;
    sort(prop: string, order: 'asc' | 'desc' | null): Promise<any[]>;
    reset(): Promise<any[]>;
}

/**
 * 远程 CRUD 实体管理器接口
 *
 * 对应 RemoteCrudEntityManager 类的完整公共 API。
 * 在 RemoteReadonlyEntityManager 基础上增加：
 * RemoteCreateAbility + RemoteUpdateAbility + RemoteDeleteAbility + RemoteToggleAbility
 */
export interface IRemoteCrudEntityManager<TSearch extends IFlatSearchParams = IFlatSearchParams>
    extends IRemoteReadonlyEntityManager<TSearch> {

    // ===== RemoteCreateAbility =====
    create(data: any): Promise<any>;

    // ===== RemoteUpdateAbility =====
    update(data: any): Promise<any>;

    // ===== RemoteDeleteAbility =====
    delete(id: string | number | (string | number)[]): Promise<void>;

    // ===== RemoteToggleAbility =====
    toggle(item: any, field: string): Promise<any>;
}

/**
 * 远程树实体管理器接口
 *
 * 对应 RemoteTreeEntityManager 类的完整公共 API。
 * 组合能力：SchemaProxyAbility + CacheAbility + DirtyAbility + SearchAbility +
 *          TreePathAbility + TreeLifecycleAbility + TreeSearchAbility + TreeViewAbility +
 *          TreeRemoteStateAbility + FlatRemoteListAbility + RemoteGetAbility +
 *          FlatRemoteQueryAbility + RemoteCreateAbility + RemoteUpdateAbility + RemoteDeleteAbility
 */
export interface IRemoteTreeEntityManager<TSearch extends ITreeSearchParams = ITreeSearchParams>
    extends IBaseEntityManagerFull<TSearch> {

    // ===== 标识 =====
    isRemote: true;

    // ===== 分页状态 =====
    total: number;

    // ===== 树特有状态 =====
    expandedIds: Set<string | number>;

    // ===== SchemaProxyAbility =====
    readonly idField: string;
    readonly idType: string;
    readonly nameField: string;
    readonly defaultSort: string;
    readonly defaultOrder: string;
    readonly searchFields: string[];
    readonly isTree: boolean;
    readonly isLazy: boolean;
    readonly root: any;
    readonly parentIdField: string;
    readonly childrenField: string;
    readonly pathField: string;
    readonly leafField: string;
    readonly expandedField: string;
    readonly useFlat: boolean;

    // ===== CacheAbility =====
    readonly cacheKey: string;
    tryGetCache(): Promise<any>;
    setCache(data: any): Promise<void>;
    clearCache(): Promise<void>;
    updateSourceData(result: any[]): void;

    // ===== DirtyAbility =====
    isDirty(item?: any): boolean;
    startEdit(item: any): void;
    submitEdit(item: any): void;
    cancelEdit(item: any): void;
    rollbackAll(): void;

    // ===== SearchAbility → 被 FlatRemoteQueryAbility/TreeSearchAbility 覆盖 =====
    toParams(): Record<string, any>;

    // ===== TreePathAbility =====
    ingest(data: IEntity | IEntity[], manualParentId?: string | number | null): void;
    rebuildDescendantsPaths(pid: any, parentPath: string, nextDepth: number): void;
    toggleExpand(id: string | number | IEntity, expanded?: boolean): void;
    toggleLeaf(id: string | number | IEntity, leaf?: boolean): void;

    // ===== TreeLifecycleAbility =====
    removeNode(id: string | number): void;
    moveNode(id: string | number, targetPid: string | number | null): void;
    syncChildren(pid: string | number | null, newData: IEntity[]): void;
    getChildren(pid?: string | number | null, predicate?: (node: IEntity) => boolean): IEntity[];

    // ===== TreeSearchAbility (覆盖 SearchAbility 的 applySort/matchKeyword) =====
    applySearchExpansion(): void;
    applySort(list: IEntity[]): IEntity[];
    matchKeyword(node: IEntity, keyword: string): boolean;

    // ===== TreeRemoteStateAbility =====
    readonly isEmpty: boolean;
    updateData(list: any[], total?: number): void;

    // ===== TreeViewAbility (覆盖 TreeRemoteStateAbility 的 refreshView) =====
    refreshView(): void;

    // ===== FlatRemoteListAbility =====
    list(): Promise<any[]>;
    refresh(): Promise<any[]>;

    // ===== RemoteGetAbility =====
    get(id: string | number): Promise<any>;

    // ===== FlatRemoteQueryAbility (覆盖 SearchAbility 的 filter/searchBy/sort) =====
    prev(): Promise<any[]>;
    next(): Promise<any[]>;
    jump(page: number): Promise<any[]>;
    changeSize(size: number): Promise<any[]>;
    filter(text: string): Promise<any[]>;
    searchBy(search: any): Promise<any[]>;
    sort(prop: string, order: 'asc' | 'desc' | null): Promise<any[]>;
    reset(): Promise<any[]>;

    // ===== RemoteCreateAbility =====
    create(data: any): Promise<any>;

    // ===== RemoteUpdateAbility =====
    update(data: any): Promise<any>;

    // ===== RemoteDeleteAbility =====
    delete(id: string | number | (string | number)[]): Promise<void>;
}
