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

// ============================================
// DomainPagingAbility — 域分页配置能力
// ============================================

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

// ============================================
// LocalReadonlyEntityManager
// ============================================

/**
 * 第一步：合并能力
 */
const ForgedLocalReadonly = BaseEntityManager.forge(
    [FlatLocalStateAbility, LocalListAbility, LocalGetAbility],
);

/**
 * 在中间类上声明能力接口
 *
 * 不需要 extends BaseEntityManager，因为派生类通过 class extends 已获得其类型。
 * 只需声明 forge 注入的能力接口即可。
 */
export interface ForgedLocalReadonly<TSearch extends ILocalSearchParams = ILocalSearchParams>
    extends
        IStateSchemaAbility,
        IStateCacheAbility,
        IStateDirtyAbility,
        IStateLocalMutationAbility,
        IFlatLocalStateAbility,
        ILocalGetAbility {
    isRemote: false;
    list(): Promise<any[]>;
    refresh(): Promise<any[]>;
    filter(keyword: string): any[];
    sort(sortBy: string, sortOrder: 'asc' | 'desc'): any[];
    toParams(): any;
    searchBy(search: any): void;
    matchKeyword(item: any): boolean;
    applySort(list: any[]): any[];
}

/**
 * 第二步：从中间类 extends
 */
export abstract class LocalReadonlyEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends ForgedLocalReadonly {
    static override readonly abilities = [FlatLocalStateAbility, LocalListAbility, LocalGetAbility];

    isRemote: false = false;
    sourceData = new Map<string | number, IEntity>();
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
}

// ============================================
// LocalCrudEntityManager
// ============================================

/**
 * 第一步：合并能力
 */
const ForgedLocalCrud = BaseEntityManager.forge(
    [FlatLocalStateAbility, LocalListAbility, LocalGetAbility, FlatLocalMutationAbility, FlatLocalDeleteAbility],
);

/**
 * 在中间类上声明能力接口
 */
export interface ForgedLocalCrud<TSearch extends ILocalSearchParams = ILocalSearchParams>
    extends
        ForgedLocalReadonly<TSearch>,
        IFlatLocalMutationAbility,
        IFlatLocalDeleteAbility {}

/**
 * 第二步：从中间类 extends
 */
export abstract class LocalCrudEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends ForgedLocalCrud {
    static override readonly abilities = [
        FlatLocalStateAbility, LocalListAbility, LocalGetAbility,
        FlatLocalMutationAbility, FlatLocalDeleteAbility,
    ];

    isRemote: false = false;
    sourceData = new Map<string | number, IEntity>();
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
}

// ============================================
// RemoteReadonlyEntityManager
// ============================================

/**
 * 第一步：合并能力
 */
const ForgedRemoteReadonly = BaseEntityManager.forge([
    SchemaProxyAbility, CacheAbility, DirtyAbility, SearchAbility,
    DomainPagingAbility, FlatRemoteStateAbility, FlatRemoteListAbility,
    FlatRemoteGetAllAbility, RemoteGetAbility, FlatRemoteQueryAbility,
]);

/**
 * 在中间类上声明能力接口
 *
 * 不需要 extends BaseEntityManager，因为派生类通过 class extends 已获得其类型。
 * 只需声明 forge 注入的能力接口即可。
 */
export interface ForgedRemoteReadonly<TSearch extends IFlatSearchParams = IFlatSearchParams>
    extends
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
    prev(): Promise<any[]>;
    next(): Promise<any[]>;
    jump(page: number): Promise<any[]>;
    changeSize(size: number): Promise<any[]>;
    filter(text: string): Promise<any[]>;
    searchBy(search: any): Promise<any[]>;
    sort(prop: string, order: 'asc' | 'desc' | null): Promise<any[]>;
    reset(): Promise<any[]>;
    toParams(): any;
    matchKeyword(item: any): boolean;
    applySort(list: any[]): any[];
}

/**
 * 第二步：从中间类 extends
 */
export abstract class RemoteReadonlyEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams,
> extends ForgedRemoteReadonly {
    static override readonly abilities = [
        SchemaProxyAbility, CacheAbility, DirtyAbility, SearchAbility,
        DomainPagingAbility, FlatRemoteStateAbility, FlatRemoteListAbility,
        FlatRemoteGetAllAbility, RemoteGetAbility, FlatRemoteQueryAbility,
    ];

    isRemote: true = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as IFlatSearchParams as TSearch;
    total: number = 0;
    page: number = 1;
    pages: number = 0;
    hasMore: boolean = false;
}

// ============================================
// RemoteCrudEntityManager
// ============================================

/**
 * 第一步：合并能力
 */
const ForgedRemoteCrud = BaseEntityManager.forge([
    SchemaProxyAbility, CacheAbility, DirtyAbility, SearchAbility,
    DomainPagingAbility, FlatRemoteStateAbility, FlatRemoteListAbility,
    FlatRemoteGetAllAbility, RemoteGetAbility, FlatRemoteQueryAbility,
    RemoteCreateAbility, RemoteUpdateAbility, RemoteDeleteAbility, RemoteToggleAbility,
]);

/**
 * 在中间类上声明能力接口
 */
export interface ForgedRemoteCrud<TSearch extends IFlatSearchParams = IFlatSearchParams>
    extends
        ForgedRemoteReadonly<TSearch>,
        IRemoteCreateAbility,
        IRemoteUpdateAbility,
        IRemoteDeleteAbility,
        IRemoteToggleAbility {}

/**
 * 第二步：从中间类 extends
 */
export abstract class RemoteCrudEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams,
> extends ForgedRemoteCrud {
    static override readonly abilities = [
        SchemaProxyAbility, CacheAbility, DirtyAbility, SearchAbility,
        DomainPagingAbility, FlatRemoteStateAbility, FlatRemoteListAbility,
        FlatRemoteGetAllAbility, RemoteGetAbility, FlatRemoteQueryAbility,
        RemoteCreateAbility, RemoteUpdateAbility, RemoteDeleteAbility, RemoteToggleAbility,
    ];

    isRemote: true = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as IFlatSearchParams as TSearch;
    total: number = 0;
    page: number = 1;
    pages: number = 0;
    hasMore: boolean = false;
}

// ============================================
// RemoteTreeEntityManager
// ============================================

/**
 * 第一步：合并能力
 */
const ForgedRemoteTree = BaseEntityManager.forge([
    SchemaProxyAbility, CacheAbility, DirtyAbility, SearchAbility,
    TreePathAbility, TreeLifecycleAbility, TreeSearchAbility, TreeViewAbility,
    TreeRemoteStateAbility, FlatRemoteListAbility, RemoteGetAbility,
    FlatRemoteQueryAbility, RemoteCreateAbility, RemoteUpdateAbility, RemoteDeleteAbility,
]);

/**
 * 在中间类上声明能力接口
 *
 * 不需要 extends BaseEntityManager，因为派生类通过 class extends 已获得其类型。
 * 只需声明 forge 注入的能力接口即可。
 */
export interface ForgedRemoteTree<TSearch extends ITreeSearchParams = ITreeSearchParams>
    extends
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
    applySearchExpansion(): void;
    applySort(list: any[]): any[];
    matchKeyword(node: any, keyword: string): boolean;
    prev(): Promise<any[]>;
    next(): Promise<any[]>;
    jump(page: number): Promise<any[]>;
    changeSize(size: number): Promise<any[]>;
    filter(text: string): Promise<any[]>;
    searchBy(search: any): Promise<any[]>;
    sort(prop: string, order: 'asc' | 'desc' | null): Promise<any[]>;
    reset(): Promise<any[]>;
    toParams(): any;
}

/**
 * 第二步：从中间类 extends
 */
export abstract class RemoteTreeEntityManager<
    TSearch extends ITreeSearchParams = ITreeSearchParams,
> extends ForgedRemoteTree {
    static override readonly abilities = [
        SchemaProxyAbility, CacheAbility, DirtyAbility, SearchAbility,
        TreePathAbility, TreeLifecycleAbility, TreeSearchAbility, TreeViewAbility,
        TreeRemoteStateAbility, FlatRemoteListAbility, RemoteGetAbility,
        FlatRemoteQueryAbility, RemoteCreateAbility, RemoteUpdateAbility, RemoteDeleteAbility,
    ];

    isRemote: true = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as ITreeSearchParams as TSearch;
    total: number = 0;
    expandedIds: Set<string | number> = new Set();
}
