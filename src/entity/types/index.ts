/**
 * Entity 包类型定义
 * 
 * 包含实体管理器、状态、能力相关的类型和常量
 */

// ============================================
// 从其他包重新导出
// ============================================

export type {
    IEntity,
    SearchParams,
    ILocalSearchParams,
    IFlatSearchParams,
    ITreeSearchParams,
    Schema,
    FlatSchema,
    TreeSchema,
    BaseSchema,
    FieldDefinition,
    SchemaCache,
} from '@/schema';

export type { IExposeResult, AbilityConstructor } from '@/composable';
export { AbilityBase } from '@/composable';
export { ComposableBase } from '@/composable';

export type { RequestContext, RequestTask, PaginationInfo } from '@/context';

export type {
    HttpRequestOptions,
    HttpRequestTask,
    HttpContext,
} from '@/http';

export type { ICacheProvider } from '@/cache';

export { KernelError, KernelErrorCode } from '@/error';

// ============================================
// Symbol 常量
// ============================================

/** Schema 缓存 Symbol */
export const SCHEMA_CACHE_SYMBOL = Symbol('schema-cache');

// ============================================
// 实体动作枚举
// ============================================

/** 实体操作类型 */
export enum ENTITY_ACTION {
    LIST = 'list',
    GET = 'get',
    GET_ALL = 'getAll',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    TOGGLE = 'toggle',
    SAVE = 'save',
    BATCH_DELETE = 'batchDelete',
}

// ============================================
// 变更集类型
// ============================================

/** 本地变更集 */
export interface ILocalChangeSet<T = any> {
    /** 新增项 */
    added: T[];
    /** 更新项 */
    updated: T[];
    /** 删除项 ID */
    deleted: (string | number)[];
}

/** 删除计划 */
export interface IDeletionPlan<T = any> {
    /** 仅本地存在的项（未同步到远程，可直接删除） */
    localOnly: T[];
    /** 已持久化的项（需要远程删除） */
    persistent: T[];
}

// ============================================
// 实体状态接口
// ============================================

import type {
    IEntity,
    SearchParams,
    ILocalSearchParams,
    IFlatSearchParams,
    ITreeSearchParams,
    Schema,
    SchemaCache,
} from '@/schema';

/** 基础实体状态接口 */
export interface IBaseEntityState<T extends IEntity = IEntity, TSearch extends SearchParams = SearchParams> {
    loading: boolean;
    items: T[];
    item: T | null;
    search: TSearch;
    schema: Schema;
    cacheTTL: number;
    isRemote: boolean;
    refreshView(): void;
    dispose(): void;
}

/** 本地实体状态接口 */
export interface ILocalEntityState<T extends IEntity = IEntity, TSearch extends ILocalSearchParams = ILocalSearchParams>
    extends IBaseEntityState<T, TSearch> {
    sourceData: T[];
    updateData(result: any[]): void;
}

/** 平铺本地实体状态接口 */
export interface IFlatLocalEntityState<T extends IEntity = IEntity, TSearch extends ILocalSearchParams = ILocalSearchParams>
    extends ILocalEntityState<T, TSearch> {
    hasChanges: boolean;
    changes: ILocalChangeSet<T>;
    addItem(item: T): void;
    updateItem(item: T): void;
    softDelete(plan: IDeletionPlan<T>): void;
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan<T>;
    confirmDelete(): void;
    rollbackDelete(): void;
    clearChanges(): void;
}

/** 远程实体状态接口 */
export interface IRemoteEntityState<T extends IEntity = IEntity, TSearch extends SearchParams = SearchParams>
    extends IBaseEntityState<T, TSearch> {
    total: number;
}

/** 平铺远程实体状态接口 */
export interface IFlatRemoteEntityState<T extends IEntity = IEntity, TSearch extends IFlatSearchParams = IFlatSearchParams>
    extends IRemoteEntityState<T, TSearch> {
    page: number;
    pageSize: number;
    pages: number;
    hasMore: boolean;
    isDirty(currentItem?: T): boolean;
    edit(item: T): void;
    rollback(): void;
}

/** 树形远程实体状态接口 */
export interface ITreeRemoteEntityState<T extends IEntity = IEntity, TSearch extends ITreeSearchParams = ITreeSearchParams>
    extends IRemoteEntityState<T, TSearch> {
    expandedIds: Set<string | number>;
}

/** 实体状态联合类型 */
export type EntityState<T extends IEntity = IEntity, TSearch extends SearchParams = SearchParams> =
    | ILocalEntityState<T, TSearch>
    | IRemoteEntityState<T, TSearch>;

// ============================================
// 实体管理器接口
// ============================================

/** 核心实体管理器接口 */
export interface ICoreEntityManager {
    domain: string;
    entityName: string;
    url: string;
    schema?: Schema;
    getSchema(): SchemaCache;
    getSchemaRules(fieldName?: string): any;
    request(action: ENTITY_ACTION, options: HttpRequestOptions): HttpRequestTask;
    cancelAll(): void;
    dispose(): void;
}

/** 基础实体管理器接口 */
export interface IBaseEntityManager<
    T extends IEntity = IEntity,
    TSearch extends SearchParams = SearchParams,
    TState extends IBaseEntityState<T, TSearch> = IBaseEntityState<T, TSearch>,
> extends ICoreEntityManager {
    state: TState;
    fetch(action: ENTITY_ACTION, options: HttpRequestOptions): Promise<RequestContext>;
    buildOptions(
        action: ENTITY_ACTION,
        params?: any,
        body?: any,
        extra?: Partial<HttpRequestOptions>
    ): Promise<HttpRequestOptions>;
}

// ============================================
// 能力接口
// ============================================

/** Schema 能力接口 */
export interface ISchemaAbility {
    getSchema(): SchemaCache;
    getSchemaRules(fieldName?: string): any;
    readonly schemaKeys: Record<string, string>;
    readonly schemaTree: { isTree: boolean; isLazy: boolean; root: any };
    readonly schemaSort: { prop: string; order: string };
    readonly schemaFilters: string[];
    readonly schemaIdType: string;
}

/** 本地列表能力接口 */
export interface ILocalListAbility<T = any> {
    list(): Promise<T[]>;
    refresh(): Promise<T[]>;
    filter(keyword: string): T[];
    sort(sortBy: string, sortOrder: 'asc' | 'desc'): T[];
}

/** 本地获取能力接口 */
export interface ILocalGetAbility<T = any> {
    get(id: string | number): T | undefined;
}

/** 平铺本地变更能力接口 */
export interface IFlatLocalMutationAbility<T = any> {
    create(item: T): void;
    update(item: T): void;
    toggle(item: T, field?: string): void;
    save(isBatch?: boolean): Promise<void>;
}

/** 平铺本地删除能力接口 */
export interface IFlatLocalDeleteAbility<T = any> {
    delete(ids: (string | number)[], immediate?: boolean): Promise<void>;
}

/** 平铺本地状态能力接口 */
export interface IFlatLocalStateAbility<T = any> {
    readonly loading: boolean;
    readonly isEmpty: boolean;
    readonly total: number;
    readonly items: T[];
    readonly hasChanges: boolean;
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan<T>;
    readonly adds: T[];
    readonly updates: T[];
}

/** 平铺远程列表能力接口 */
export interface IFlatRemoteListAbility<T = any> {
    list(): Promise<T[]>;
    refresh(): Promise<T[]>;
}

/** 平铺远程获取全部能力接口 */
export interface IFlatRemoteGetAllAbility<T = any> {
    getAll(): Promise<T[]>;
}

/** 远程获取能力接口 */
export interface IRemoteGetAbility<T = any> {
    get(id: string | number): Promise<T>;
}

/** 远程创建能力接口 */
export interface IRemoteCreateAbility<T = any> {
    create(data: Partial<T>): Promise<T>;
}

/** 远程更新能力接口 */
export interface IRemoteUpdateAbility<T = any> {
    update(data: Partial<T>): Promise<T>;
}

/** 远程删除能力接口 */
export interface IRemoteDeleteAbility {
    delete(id: string | number | (string | number)[]): Promise<void>;
}

/** 远程切换能力接口 */
export interface IRemoteToggleAbility<T = any> {
    toggle(item: T, field?: string): Promise<void>;
}

/** 平铺远程查询能力接口 */
export interface IFlatRemoteQueryAbility {
    prev(): Promise<void>;
    next(): Promise<void>;
    jump(page: number): Promise<void>;
    changeSize(size: number): Promise<void>;
    filter(text: string): Promise<void>;
    search(search: any): Promise<void>;
    sort(prop: string, order: string): Promise<void>;
    reset(): Promise<void>;
}

/** 平铺远程状态能力接口 */
export interface IFlatRemoteStateAbility<T = any> {
    readonly loading: boolean;
    readonly isEmpty: boolean;
    readonly hasMore: boolean;
    readonly total: number;
    readonly items: T[];
    readonly page: number;
    readonly pageSize: number;
    readonly pages: number;
    isDirty(currentItem?: T): boolean;
    edit(item: T): void;
    rollback(): void;
}

/** 树形远程状态能力接口 */
export interface ITreeRemoteStateAbility<T = any> {
    readonly loading: boolean;
    readonly isEmpty: boolean;
    readonly items: T[];
}

/** 树管理能力接口 */
export interface ITreeManagerAbility<T = any> {
    expand(id: string | number): void;
    collapse(id: string | number): void;
    move(id: string | number, targetPid: string | number | null): void;
    refresh(pid?: string | number): Promise<void>;
    getSubTree(pid?: string | number): T[];
    isDirty(currentItem?: T): boolean;
    edit(item: T): void;
    rollback(): void;
}

/** 状态 Schema 能力接口 */
export interface IStateSchemaAbility {
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
}

/** 状态缓存能力接口 */
export interface IStateCacheAbility {
    readonly cacheKey: string;
    tryGetCache(): Promise<any>;
    setCache(data: any): Promise<void>;
    clearCache(): Promise<void>;
}

/** 状态脏检查能力接口 */
export interface IStateDirtyAbility<T = any> {
    isDirty(item?: T): boolean;
    startEdit(item: T): void;
    submitEdit(item: T): void;
    cancelEdit(item: T): void;
    rollbackAll(): void;
}

/** 状态本地变更能力接口 */
export interface IStateLocalMutationAbility<T = any> {
    readonly hasChanges: boolean;
    readonly changes: ILocalChangeSet<T>;
    addItem(item: T): Promise<void>;
    updateItem(item: T): Promise<void>;
    updateData(result: any[]): Promise<void>;
    softDelete(plan: IDeletionPlan<T>): Promise<void>;
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan<T>;
    confirmDelete(): Promise<void>;
    rollbackDelete(): Promise<void>;
    clearChanges(): void;
}

/** 状态搜索能力接口 */
export interface IStateSearchAbility<T = any, TSearch extends SearchParams = SearchParams> {
    toParams(): any;
    filter(text: string): void;
    searchBy(search: Partial<TSearch>): void;
    matchKeyword(item: T): boolean;
    applySort(list: T[]): T[];
    sort(field: string, order: string): void;
}
