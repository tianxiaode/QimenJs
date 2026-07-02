import { BaseEntityManager } from './BaseEntityManager';
import type { ILocalSearchParams, IFlatSearchParams, ITreeSearchParams } from '@/entity/types';
import { FlatLocalEntityState } from '@/entity/state/FlatLocalEntityState';
import { FlatRemoteEntityState } from '@/entity/state/FlatRemoteEntityState';
import { TreeRemoteEntityState } from '@/entity/state/TreeRemoteEntityState';
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

    private _state!: FlatLocalEntityState<TSearch>;

    get state(): FlatLocalEntityState<TSearch> {
        if (!this._state) {
            this._state = new FlatLocalEntityState(this.compiledSchema, this.cacheTTL);
        }
        return this._state;
    }

    set state(value: FlatLocalEntityState<TSearch>) {
        this._state = value;
    }
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

    private _state!: FlatLocalEntityState<TSearch>;

    get state(): FlatLocalEntityState<TSearch> {
        if (!this._state) {
            this._state = new FlatLocalEntityState(this.compiledSchema, this.cacheTTL);
        }
        return this._state;
    }

    set state(value: FlatLocalEntityState<TSearch>) {
        this._state = value;
    }
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
        FlatRemoteStateAbility,
        FlatRemoteListAbility,
        FlatRemoteGetAllAbility,
        RemoteGetAbility,
        FlatRemoteQueryAbility,
    ];

    private _state!: FlatRemoteEntityState<TSearch>;

    get state(): FlatRemoteEntityState<TSearch> {
        if (!this._state) {
            this._state = new FlatRemoteEntityState(this.compiledSchema, this.cacheTTL);
        }
        return this._state;
    }

    set state(value: FlatRemoteEntityState<TSearch>) {
        this._state = value;
    }
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

    private _state!: FlatRemoteEntityState<TSearch>;

    get state(): FlatRemoteEntityState<TSearch> {
        if (!this._state) {
            this._state = new FlatRemoteEntityState(this.compiledSchema, this.cacheTTL);
        }
        return this._state;
    }

    set state(value: FlatRemoteEntityState<TSearch>) {
        this._state = value;
    }
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
        TreeRemoteStateAbility,
        FlatRemoteListAbility,
        RemoteGetAbility,
        FlatRemoteQueryAbility,
        RemoteCreateAbility,
        RemoteUpdateAbility,
        RemoteDeleteAbility,
    ];

    private _state!: TreeRemoteEntityState<TSearch>;

    get state(): TreeRemoteEntityState<TSearch> {
        if (!this._state) {
            this._state = new TreeRemoteEntityState(this.compiledSchema, this.cacheTTL);
        }
        return this._state;
    }

    set state(value: TreeRemoteEntityState<TSearch>) {
        this._state = value;
    }
}
