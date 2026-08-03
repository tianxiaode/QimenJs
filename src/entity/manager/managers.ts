import { BaseEntityManager } from './BaseEntityManager';
import { withAbilities } from '@/composable';
import type { InferAbilities } from '@/composable';
import type { ILocalSearchParams, IFlatSearchParams, ITreeSearchParams } from '../types';
import type { IEntity } from '@/schema';
import {
    FlatLocalStateAbility,
    LocalListAbility,
    LocalGetAbility,
    FlatLocalMutationAbility,
    FlatLocalDeleteAbility,
    FlatRemoteStateAbility,
    FlatRemoteListAbility,
    FlatRemoteGetAllAbility,
    RemoteGetAbility,
    FlatRemoteQueryAbility,
    RemoteCreateAbility,
    RemoteUpdateAbility,
    RemoteDeleteAbility,
    RemoteToggleAbility,
    TreeRemoteStateAbility,
    SchemaProxyAbility,
    CacheAbility,
    DirtyAbility,
    DomainPagingAbility,
    SearchAbility,
    TreePathAbility,
    TreeLifecycleAbility,
    TreeSearchAbility,
    TreeViewAbility,
} from '../abilities';

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

BaseEntityManager.use(LOCAL_READONLY_ABILITIES);

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

LocalCrudEntityManager.use(LOCAL_CRUD_ABILITIES);

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

RemoteReadonlyEntityManager.use(REMOTE_READONLY_ABILITIES);

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

RemoteCrudEntityManager.use(REMOTE_CRUD_ABILITIES);

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

RemoteTreeEntityManager.use(REMOTE_TREE_ABILITIES);

export interface RemoteTreeEntityManager extends InferAbilities<typeof REMOTE_TREE_ABILITIES> {}
