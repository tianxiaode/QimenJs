import { BaseEntityManager } from './BaseEntityManager';
import type { ILocalSearchParams, IFlatSearchParams, ITreeSearchParams } from '@/entity/types';
import { FlatLocalEntityState } from '@/entity/state/FlatLocalEntityState';
import { FlatRemoteEntityState } from '@/entity/state/FlatRemoteEntityState';
import { TreeRemoteEntityState } from '@/entity/state/TreeRemoteEntityState';
import { LocalListAbility } from '@/entity/abilities/local/LocalListAbility';
import { LocalGetAbility } from '@/entity/abilities/local/LocalGetAbility';
import { FlatLocalMutationAbility } from '@/entity/abilities/local/FlatLocalMutationAbility';
import { FlatLocalDeleteAbility } from '@/entity/abilities/local/FlatLocalDeleteAbility';
import { FlatRemoteListAbility } from '@/entity/abilities/remote/FlatRemoteListAbility';
import { FlatRemoteGetAllAbility } from '@/entity/abilities/remote/FlatRemoteGetAllAbility';
import { RemoteGetAbility } from '@/entity/abilities/remote/RemoteGetAbility';
import { FlatRemoteQueryAbility } from '@/entity/abilities/remote/FlatRemoteQueryAbility';
import { RemoteCreateAbility } from '@/entity/abilities/remote/RemoteCreateAbility';
import { RemoteUpdateAbility } from '@/entity/abilities/remote/RemoteUpdateAbility';
import { RemoteDeleteAbility } from '@/entity/abilities/remote/RemoteDeleteAbility';
import { RemoteToggleAbility } from '@/entity/abilities/remote/RemoteToggleAbility';

/**
 * 本地只读实体管理器
 * 
 * 功能：
 * - list: 从远程获取数据填充本地 sourceData
 * - get: 本地查询单个实体
 */
export abstract class LocalReadonlyEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams
> extends BaseEntityManager<TSearch, FlatLocalEntityState<TSearch>> {
    static readonly abilities = [LocalListAbility, LocalGetAbility];
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
> extends BaseEntityManager<TSearch, FlatLocalEntityState<TSearch>> {
    static readonly abilities = [
        LocalListAbility,
        LocalGetAbility,
        FlatLocalMutationAbility,
        FlatLocalDeleteAbility,
    ];
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
> extends BaseEntityManager<TSearch, FlatRemoteEntityState<TSearch>> {
    static readonly abilities = [
        FlatRemoteListAbility,
        FlatRemoteGetAllAbility,
        RemoteGetAbility,
        FlatRemoteQueryAbility,
    ];
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
> extends BaseEntityManager<TSearch, FlatRemoteEntityState<TSearch>> {
    static readonly abilities = [
        FlatRemoteListAbility,
        FlatRemoteGetAllAbility,
        RemoteGetAbility,
        FlatRemoteQueryAbility,
        RemoteCreateAbility,
        RemoteUpdateAbility,
        RemoteDeleteAbility,
        RemoteToggleAbility,
    ];
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
> extends BaseEntityManager<TSearch, TreeRemoteEntityState<TSearch>> {
    static readonly abilities = [
        FlatRemoteListAbility,
        RemoteGetAbility,
        FlatRemoteQueryAbility,
        RemoteCreateAbility,
        RemoteUpdateAbility,
        RemoteDeleteAbility,
    ];
}
