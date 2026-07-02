import { BaseEntityManager } from './BaseEntityManager';
import type { ILocalSearchParams, IFlatSearchParams, ITreeSearchParams } from '@/entity/types';
import type { IEntity } from '@/schema';
import { FlatLocalStateAbility } from '@/entity/abilities/manager/local/FlatLocalStateAbility';
import { LocalListAbility } from '@/entity/abilities/manager/local/LocalListAbility';
import { LocalGetAbility } from '@/entity/abilities/manager/local/LocalGetAbility';
import { FlatLocalMutationAbility } from '@/entity/abilities/manager/local/FlatLocalMutationAbility';
import { FlatLocalDeleteAbility } from '@/entity/abilities/manager/local/FlatLocalDeleteAbility';
import { FlatRemoteStateAbility } from '@/entity/abilities/manager/remote/FlatRemoteStateAbility';
import { FlatRemoteListAbility } from '@/entity/abilities/manager/remote/FlatRemoteListAbility';
import { FlatRemoteGetAllAbility } from '@/entity/abilities/manager/remote/FlatRemoteGetAllAbility';
import { RemoteGetAbility } from '@/entity/abilities/manager/remote/RemoteGetAbility';
import { FlatRemoteQueryAbility } from '@/entity/abilities/manager/remote/FlatRemoteQueryAbility';
import { RemoteCreateAbility } from '@/entity/abilities/manager/remote/RemoteCreateAbility';
import { RemoteUpdateAbility } from '@/entity/abilities/manager/remote/RemoteUpdateAbility';
import { RemoteDeleteAbility } from '@/entity/abilities/manager/remote/RemoteDeleteAbility';
import { RemoteToggleAbility } from '@/entity/abilities/manager/remote/RemoteToggleAbility';
import { TreeRemoteStateAbility } from '@/entity/abilities/manager/remote/TreeRemoteStateAbility';
import { StateSchemaAbility } from '@/entity/abilities/state/base/StateSchemaAbility';
import { StateCacheAbility } from '@/entity/abilities/state/base/StateCacheAbility';
import { StateDirtyAbility } from '@/entity/abilities/state/base/StateDirtyAbility';
import { StateSearchAbility } from '@/entity/abilities/state/search/StateSearchAbility';
import { TreePathAbility } from '@/entity/abilities/state/tree/TreePathAbility';
import { TreeLifecycleAbility } from '@/entity/abilities/state/tree/TreeLifecycleAbility';
import { TreeSearchAbility } from '@/entity/abilities/state/tree/TreeSearchAbility';
import { TreeViewAbility } from '@/entity/abilities/state/tree/TreeViewAbility';

/**
 * 本地只读实体管理器
 * 
 * 功能：
 * - list: 从远程获取数据填充本地 sourceData
 * - get: 本地查询单个实体
 */
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
export abstract class RemoteReadonlyEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams
> extends BaseEntityManager<TSearch> {
    static readonly abilities = [
        StateSchemaAbility,
        StateCacheAbility,
        StateDirtyAbility,
        StateSearchAbility,
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
    pageSize: number = 20;
    pages: number = 0;
    hasMore: boolean = false;
    pageSizes: number[] = [10, 20, 50];
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
export abstract class RemoteCrudEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams
> extends BaseEntityManager<TSearch> {
    static readonly abilities = [
        StateSchemaAbility,
        StateCacheAbility,
        StateDirtyAbility,
        StateSearchAbility,
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
    pageSize: number = 20;
    pages: number = 0;
    hasMore: boolean = false;
    pageSizes: number[] = [10, 20, 50];
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
export abstract class RemoteTreeEntityManager<
    TSearch extends ITreeSearchParams = ITreeSearchParams
> extends BaseEntityManager<TSearch> {
    static readonly abilities = [
        StateSchemaAbility,
        StateCacheAbility,
        StateDirtyAbility,
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
