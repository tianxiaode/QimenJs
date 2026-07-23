import { BaseEntityManager } from './BaseEntityManager';
import { withAbilities } from '@/composable';
import type { InferAbilities } from '@/composable';
import type { ILocalSearchParams, IFlatSearchParams, ITreeSearchParams } from '@/entity/types';
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
import { DomainPagingAbility } from '@/entity/abilities/core/DomainPagingAbility';
import { SearchAbility } from '@/entity/abilities/search/SearchAbility';
import { TreePathAbility } from '@/entity/abilities/tree/TreePathAbility';
import { TreeLifecycleAbility } from '@/entity/abilities/tree/TreeLifecycleAbility';
import { TreeSearchAbility } from '@/entity/abilities/tree/TreeSearchAbility';
import { TreeViewAbility } from '@/entity/abilities/tree/TreeViewAbility';

// ============================================
// LocalReadonlyEntityManager
// ============================================

const LOCAL_READONLY_ABILITIES = [
    FlatLocalStateAbility,
    LocalListAbility,
    LocalGetAbility,
] as const;

export abstract class LocalReadonlyEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends BaseEntityManager {
    isRemote: boolean = false;
    sourceData = new Map<string | number, IEntity>();
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
}

withAbilities(LocalReadonlyEntityManager, LOCAL_READONLY_ABILITIES);

export interface LocalReadonlyEntityManager extends InferAbilities<
    typeof LOCAL_READONLY_ABILITIES
> {}

// ============================================
// LocalCrudEntityManager
// ============================================

const LOCAL_CRUD_ABILITIES = [
    FlatLocalStateAbility,
    LocalListAbility,
    LocalGetAbility,
    FlatLocalMutationAbility,
    FlatLocalDeleteAbility,
] as const;

export abstract class LocalCrudEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends BaseEntityManager {
    isRemote: boolean = false;
    sourceData = new Map<string | number, IEntity>();
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
}

withAbilities(LocalCrudEntityManager, LOCAL_CRUD_ABILITIES);

export interface LocalCrudEntityManager extends InferAbilities<typeof LOCAL_CRUD_ABILITIES> {}

// ============================================
// RemoteReadonlyEntityManager
// ============================================

const REMOTE_READONLY_ABILITIES = [
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
] as const;

export abstract class RemoteReadonlyEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams,
> extends BaseEntityManager {
    isRemote: boolean = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as IFlatSearchParams as TSearch;
    total: number = 0;
    page: number = 1;
    pages: number = 0;
    hasMore: boolean = false;
}

withAbilities(RemoteReadonlyEntityManager, REMOTE_READONLY_ABILITIES);

export interface RemoteReadonlyEntityManager extends InferAbilities<
    typeof REMOTE_READONLY_ABILITIES
> {}

// ============================================
// RemoteCrudEntityManager
// ============================================

const REMOTE_CRUD_ABILITIES = [
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
] as const;

export abstract class RemoteCrudEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams,
> extends BaseEntityManager {
    isRemote: boolean = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as IFlatSearchParams as TSearch;
    total: number = 0;
    page: number = 1;
    pages: number = 0;
    hasMore: boolean = false;
}

withAbilities(RemoteCrudEntityManager, REMOTE_CRUD_ABILITIES);

export interface RemoteCrudEntityManager extends InferAbilities<typeof REMOTE_CRUD_ABILITIES> {}

// ============================================
// RemoteTreeEntityManager
// ============================================

const REMOTE_TREE_ABILITIES = [
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
] as const;

export abstract class RemoteTreeEntityManager<
    TSearch extends ITreeSearchParams = ITreeSearchParams,
> extends BaseEntityManager {
    isRemote: boolean = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as ITreeSearchParams as TSearch;
    total: number = 0;
    expandedIds: Set<string | number> = new Set();
}

withAbilities(RemoteTreeEntityManager, REMOTE_TREE_ABILITIES);

export interface RemoteTreeEntityManager extends InferAbilities<typeof REMOTE_TREE_ABILITIES> {}
