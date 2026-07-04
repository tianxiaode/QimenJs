import { BaseEntityManager } from './BaseEntityManager';
import type {
    ILocalSearchParams,
    IFlatSearchParams,
    ITreeSearchParams,
    IStateSchemaAbility,
    IStateCacheAbility,
    IStateDirtyAbility,
    IStateLocalMutationAbility,
    IStateSearchAbility,
    IFlatLocalStateAbility,
    ILocalListAbility,
    ILocalGetAbility,
    IFlatLocalMutationAbility,
    IFlatLocalDeleteAbility,
    IFlatRemoteListAbility,
    IFlatRemoteGetAllAbility,
    IRemoteGetAbility,
    IRemoteCreateAbility,
    IRemoteUpdateAbility,
    IRemoteDeleteAbility,
    IRemoteToggleAbility,
    IFlatRemoteQueryAbility,
    IFlatRemoteStateAbility,
    ITreeRemoteStateAbility,
    ITreePathAbility,
    ITreeLifecycleAbility,
    ITreeSearchAbility,
    ITreeViewAbility,
} from '@/entity/types';
import type { IEntity } from '@/schema';
import { FlatLocalStateAbility } from '@/entity/abilities/local/FlatLocalStateAbility';
import { LocalListAbility } from '@/entity/abilities/local/LocalListAbility';
import { LocalGetAbility } from '@/entity/abilities/local/LocalGetAbility';
import { FlatLocalMutationAbility } from '@/entity/abilities/local/FlatLocalMutationAbility';
import { FlatLocalDeleteAbility } from '@/entity/abilities/local/FlatLocalDeleteAbility';
import { FlatRemoteStateAbility } from '@/entity/abilities/remote/FlatRemoteStateAbility';
import { FlatRemoteListAbility } from '@/entity/abilities/remote/FlatRemoteListAbility';
import { FlatRemoteGetAllAbility } from '@/entity/abilities/remote/FlatRemoteGetAllAbility';
import { RemoteGetAbility } from '@/entity/abilities/remote/RemoteGetAbility';
import { FlatRemoteQueryAbility } from '@/entity/abilities/remote/FlatRemoteQueryAbility';
import { RemoteCreateAbility } from '@/entity/abilities/remote/RemoteCreateAbility';
import { RemoteUpdateAbility } from '@/entity/abilities/remote/RemoteUpdateAbility';
import { RemoteDeleteAbility } from '@/entity/abilities/remote/RemoteDeleteAbility';
import { RemoteToggleAbility } from '@/entity/abilities/remote/RemoteToggleAbility';
import { TreeRemoteStateAbility } from '@/entity/abilities/remote/TreeRemoteStateAbility';
import { SchemaProxyAbility } from '@/entity/abilities/core/SchemaProxyAbility';
import { CacheAbility } from '@/entity/abilities/core/CacheAbility';
import { DirtyAbility } from '@/entity/abilities/core/DirtyAbility';
import { SearchAbility } from '@/entity/abilities/search/SearchAbility';
import { TreePathAbility } from '@/entity/abilities/tree/TreePathAbility';
import { TreeLifecycleAbility } from '@/entity/abilities/tree/TreeLifecycleAbility';
import { TreeSearchAbility } from '@/entity/abilities/tree/TreeSearchAbility';
import { TreeViewAbility } from '@/entity/abilities/tree/TreeViewAbility';
import type { AbilityDefinition } from '@/composable';

/**
 * DomainPagingAbility - 域分页配置能力
 *
 * 从 DomainConfig 中读取 pageSize 和 pagesizes 配置，
 * 覆盖 Manager 上的默认值。
 *
 * 使用 getter/setter + 惰性初始化模式：
 * - 首次读取时从 domainConfig 获取值并缓存到实例属性
 * - 后续读写直接操作实例属性
 * - 避免在构造函数中访问尚未初始化的子类属性（如 domain）
 */
export const DomainPagingAbility: AbilityDefinition = {
    pageSize: {
        get(): number {
            const config = this.domainConfig;
            const value = config?.pageSize ?? 20;
            // 替换 getter 为普通数据属性，后续读写直接操作
            Object.defineProperty(this, 'pageSize', {
                value,
                writable: true,
                configurable: true,
                enumerable: true,
            });
            return value;
        },
        set(v: number) {
            Object.defineProperty(this, 'pageSize', {
                value: v,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        },
        configurable: true,
        enumerable: true,
    },
    pageSizes: {
        get(): number[] {
            const config = this.domainConfig;
            const value = config?.pagesizes ?? [10, 20, 50];
            Object.defineProperty(this, 'pageSizes', {
                value,
                writable: true,
                configurable: true,
                enumerable: true,
            });
            return value;
        },
        set(v: number[]) {
            Object.defineProperty(this, 'pageSizes', {
                value: v,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        },
        configurable: true,
        enumerable: true,
    },
};

/**
 * 本地只读实体管理器
 * 
 * 功能：
 * - list: 从远程获取数据填充本地 sourceData
 * - get: 本地查询单个实体
 */
/**
 * LocalReadonlyEntityManager 能力接口
 *
 * 组合能力：FlatLocalStateAbility + LocalListAbility + LocalGetAbility
 *
 * 注意：LocalListAbility 的 filter/sort 覆盖了 IStateSearchAbility 的同名方法，
 * 返回值从 void 变为 any[]，因此不能同时 extends 两者，需手动声明覆盖后的签名。
 */
export interface LocalReadonlyEntityManager<TSearch extends ILocalSearchParams = ILocalSearchParams>
    extends BaseEntityManager<TSearch>,
        IStateSchemaAbility,
        IStateCacheAbility,
        IStateDirtyAbility,
        IStateLocalMutationAbility,
        IFlatLocalStateAbility,
        ILocalGetAbility {
    isRemote: false;
    // LocalListAbility 覆盖 IStateSearchAbility 的方法
    list(): Promise<any[]>;
    refresh(): Promise<any[]>;
    filter(keyword: string): any[];
    sort(sortBy: string, sortOrder: 'asc' | 'desc'): any[];
    // IStateSearchAbility 中未被覆盖的方法
    toParams(): any;
    searchBy(search: any): void;
    matchKeyword(item: any): boolean;
    applySort(list: any[]): any[];
}

export abstract class LocalReadonlyEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams
> extends BaseEntityManager<TSearch> {
    static readonly abilities = [FlatLocalStateAbility, LocalListAbility, LocalGetAbility];

    // 数据字段（原 FlatLocalEntityState 的属性，直接在 Manager 上定义）
    isRemote: false = false;
    sourceData = new Map<string | number, IEntity>();
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
}

/**
 * 本地 CRUD 实体管理器
 * 
 * 功能：
 * - list: 从远程获取数据填充本地 sourceData
 * - get: 本地查询单个实体
 * - create: 本地添加（可选批量提交）
 * - update: 本地更新（可选批量提交）
 * - delete: 本地软删除
 */
/**
 * LocalCrudEntityManager 能力接口
 *
 * 在 LocalReadonlyEntityManager 基础上增加：
 * FlatLocalMutationAbility + FlatLocalDeleteAbility
 */
export interface LocalCrudEntityManager<TSearch extends ILocalSearchParams = ILocalSearchParams>
    extends LocalReadonlyEntityManager<TSearch>,
        IFlatLocalMutationAbility,
        IFlatLocalDeleteAbility {
}

export abstract class LocalCrudEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams
> extends BaseEntityManager<TSearch> {
    static readonly abilities = [
        FlatLocalStateAbility,
        LocalListAbility,
        LocalGetAbility,
        FlatLocalMutationAbility,
        FlatLocalDeleteAbility,
    ];

    // 数据字段（原 FlatLocalEntityState 的属性，直接在 Manager 上定义）
    isRemote: false = false;
    sourceData = new Map<string | number, IEntity>();
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
}

/**
 * 远程只读实体管理器
 * 
 * 功能：
 * - list: 远程分页查询
 * - getAll: 远程获取所有数据
 * - get: 远程查询单个实体
 * - query: 远程条件查询
 */
/**
 * RemoteReadonlyEntityManager 能力接口
 *
 * 组合能力：SchemaProxyAbility + CacheAbility + DirtyAbility + SearchAbility +
 *          DomainPagingAbility + FlatRemoteStateAbility + FlatRemoteListAbility +
 *          FlatRemoteGetAllAbility + RemoteGetAbility + FlatRemoteQueryAbility
 *
 * 注意：FlatRemoteQueryAbility 的 filter/searchBy/sort 覆盖了 IStateSearchAbility 的同名方法，
 * 返回值从 void 变为 Promise<any[]>，因此不能同时 extends 两者，需手动声明覆盖后的签名。
 */
export interface RemoteReadonlyEntityManager<TSearch extends IFlatSearchParams = IFlatSearchParams>
    extends BaseEntityManager<TSearch>,
        IStateSchemaAbility,
        IStateCacheAbility,
        IStateDirtyAbility,
        IFlatRemoteStateAbility,
        IFlatRemoteListAbility,
        IFlatRemoteGetAllAbility,
        IRemoteGetAbility {
    isRemote: true;
    pageSize: number;
    pageSizes: number[];
    // FlatRemoteQueryAbility 覆盖 IStateSearchAbility 的方法
    prev(): Promise<any[]>;
    next(): Promise<any[]>;
    jump(page: number): Promise<any[]>;
    changeSize(size: number): Promise<any[]>;
    filter(text: string): Promise<any[]>;
    searchBy(search: any): Promise<any[]>;
    sort(prop: string, order: 'asc' | 'desc' | null): Promise<any[]>;
    reset(): Promise<any[]>;
    // IStateSearchAbility 中未被覆盖的方法
    toParams(): any;
    matchKeyword(item: any): boolean;
    applySort(list: any[]): any[];
}

export abstract class RemoteReadonlyEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams
> extends BaseEntityManager<TSearch> {
    static readonly abilities = [
        SchemaProxyAbility,
        CacheAbility,
        DirtyAbility,
        SearchAbility,
        DomainPagingAbility,
        FlatRemoteStateAbility,
        FlatRemoteListAbility,
        FlatRemoteGetAllAbility,
        RemoteGetAbility,
        FlatRemoteQueryAbility,
    ];

    // 数据字段（原 FlatRemoteEntityState 的属性，直接在 Manager 上定义）
    isRemote: true = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
    total: number = 0;
    page: number = 1;
    // pageSize 和 pageSizes 由 DomainPagingAbility 提供（从 domainConfig 初始化）
    pages: number = 0;
    hasMore: boolean = false;
}

/**
 * 远程 CRUD 实体管理器
 * 
 * 功能：
 * - list: 远程分页查询
 * - getAll: 远程获取所有数据
 * - get: 远程查询单个实体
 * - query: 远程条件查询
 * - create: 远程创建
 * - update: 远程更新
 * - delete: 远程删除
 * - toggle: 远程切换状态
 */
/**
 * RemoteCrudEntityManager 能力接口
 *
 * 在 RemoteReadonlyEntityManager 基础上增加：
 * RemoteCreateAbility + RemoteUpdateAbility + RemoteDeleteAbility + RemoteToggleAbility
 */
export interface RemoteCrudEntityManager<TSearch extends IFlatSearchParams = IFlatSearchParams>
    extends RemoteReadonlyEntityManager<TSearch>,
        IRemoteCreateAbility,
        IRemoteUpdateAbility,
        IRemoteDeleteAbility,
        IRemoteToggleAbility {
}

export abstract class RemoteCrudEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams
> extends BaseEntityManager<TSearch> {
    static readonly abilities = [
        SchemaProxyAbility,
        CacheAbility,
        DirtyAbility,
        SearchAbility,
        DomainPagingAbility,
        FlatRemoteStateAbility,
        FlatRemoteListAbility,
        FlatRemoteGetAllAbility,
        RemoteGetAbility,
        FlatRemoteQueryAbility,
        RemoteCreateAbility,
        RemoteUpdateAbility,
        RemoteDeleteAbility,
        RemoteToggleAbility,
    ];

    // 数据字段（原 FlatRemoteEntityState 的属性，直接在 Manager 上定义）
    isRemote: true = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
    total: number = 0;
    page: number = 1;
    // pageSize 和 pageSizes 由 DomainPagingAbility 提供（从 domainConfig 初始化）
    pages: number = 0;
    hasMore: boolean = false;
}

/**
 * 远程树实体管理器
 * 
 * 功能：
 * - list: 远程树查询
 * - get: 远程查询单个节点
 * - query: 远程条件查询
 * - create: 远程创建节点（必须远程）
 * - update: 远程更新节点
 * - delete: 远程删除节点（必须远程）
 * - move: 远程移动节点（必须远程）
 * - toggleExpand: 切换展开状态
 * - toggleLeaf: 切换叶子节点状态
 */
/**
 * RemoteTreeEntityManager 能力接口
 *
 * 组合能力：SchemaProxyAbility + CacheAbility + DirtyAbility + SearchAbility +
 *          TreePathAbility + TreeLifecycleAbility + TreeSearchAbility + TreeViewAbility +
 *          TreeRemoteStateAbility + FlatRemoteListAbility + RemoteGetAbility +
 *          FlatRemoteQueryAbility + RemoteCreateAbility + RemoteUpdateAbility + RemoteDeleteAbility
 *
 * 注意：
 * - FlatRemoteQueryAbility 的 filter/searchBy/sort 覆盖了 IStateSearchAbility 的同名方法
 * - ITreeSearchAbility 的 matchKeyword 签名与 IStateSearchAbility 不同（多一个 keyword 参数）
 * - 因此不能同时 extends 冲突的接口，需手动声明覆盖后的签名
 */
export interface RemoteTreeEntityManager<TSearch extends ITreeSearchParams = ITreeSearchParams>
    extends BaseEntityManager<TSearch>,
        IStateSchemaAbility,
        IStateCacheAbility,
        IStateDirtyAbility,
        ITreePathAbility,
        ITreeLifecycleAbility,
        ITreeViewAbility,
        ITreeRemoteStateAbility,
        IFlatRemoteListAbility,
        IRemoteGetAbility,
        IRemoteCreateAbility,
        IRemoteUpdateAbility,
        IRemoteDeleteAbility {
    isRemote: true;
    // TreeSearchAbility 覆盖 IStateSearchAbility 的方法
    applySearchExpansion(): void;
    applySort(list: any[]): any[];
    matchKeyword(node: any, keyword: string): boolean;
    // FlatRemoteQueryAbility 覆盖 IStateSearchAbility 的方法
    prev(): Promise<any[]>;
    next(): Promise<any[]>;
    jump(page: number): Promise<any[]>;
    changeSize(size: number): Promise<any[]>;
    filter(text: string): Promise<any[]>;
    searchBy(search: any): Promise<any[]>;
    sort(prop: string, order: 'asc' | 'desc' | null): Promise<any[]>;
    reset(): Promise<any[]>;
    // IStateSearchAbility 中未被覆盖的方法
    toParams(): any;
}

export abstract class RemoteTreeEntityManager<
    TSearch extends ITreeSearchParams = ITreeSearchParams
> extends BaseEntityManager<TSearch> {
    static readonly abilities = [
        SchemaProxyAbility,
        CacheAbility,
        DirtyAbility,
        SearchAbility,
        TreePathAbility,
        TreeLifecycleAbility,
        TreeSearchAbility,
        TreeViewAbility,
        TreeRemoteStateAbility,
        FlatRemoteListAbility,
        RemoteGetAbility,
        FlatRemoteQueryAbility,
        RemoteCreateAbility,
        RemoteUpdateAbility,
        RemoteDeleteAbility,
    ];

    // 数据字段（原 TreeRemoteEntityState 的属性，直接在 Manager 上定义）
    isRemote: true = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
    total: number = 0;
    expandedIds: Set<string | number> = new Set();
}
