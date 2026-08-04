import { BaseEntityManager } from './BaseEntityManager';
import type { InferAbilities } from '@/composable';
import type { ILocalSearchParams, IFlatSearchParams, ITreeSearchParams, IEntity } from '@/schema';
import { ENTITY_COMMAND_EVENTS as CMD } from '@/events/entity-events';
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
    RemotePagingAbility,
    RemoteCreateAbility,
    RemoteUpdateAbility,
    RemoteDeleteAbility,
    RemoteToggleAbility,
    TreeRemoteStateAbility,
    SchemaProxyAbility,
    CacheAbility,
    DirtyAbility,
    DomainPagingAbility,
    TreeManagerAbility,
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

    eventMap: Record<string, string> = {
        [CMD.LIST]: 'list',
        [CMD.REFRESH]: 'refresh',
        [CMD.FILTER]: 'filter',
        [CMD.SORT]: 'sort',
        [CMD.GET]: 'get',
    };
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

    eventMap: Record<string, string> = {
        [CMD.LIST]: 'list',
        [CMD.REFRESH]: 'refresh',
        [CMD.FILTER]: 'filter',
        [CMD.SORT]: 'sort',
        [CMD.GET]: 'get',
        [CMD.CREATE]: 'create',
        [CMD.UPDATE]: 'update',
        [CMD.TOGGLE]: 'toggle',
        [CMD.SAVE]: 'save',
        [CMD.DELETE]: 'delete',
    };
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
    DomainPagingAbility,
    FlatRemoteStateAbility,
    FlatRemoteListAbility,
    FlatRemoteGetAllAbility,
    RemoteGetAbility,
    FlatRemoteQueryAbility,
    RemotePagingAbility,
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

    eventMap: Record<string, string> = {
        [CMD.LIST]: 'list',
        [CMD.REFRESH]: 'refresh',
        [CMD.GET_ALL]: 'getAll',
        [CMD.GET]: 'get',
        [CMD.FILTER]: 'filter',
        [CMD.SEARCH_BY]: 'searchBy',
        [CMD.SORT]: 'sort',
        [CMD.RESET]: 'reset',
        [CMD.PREV]: 'prev',
        [CMD.NEXT]: 'next',
        [CMD.JUMP]: 'jump',
        [CMD.CHANGE_SIZE]: 'changeSize',
        [CMD.START_EDIT]: 'startEdit',
        [CMD.SUBMIT_EDIT]: 'submitEdit',
        [CMD.CANCEL_EDIT]: 'cancelEdit',
        [CMD.ROLLBACK_ALL]: 'rollbackAll',
    };
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
    DomainPagingAbility,
    FlatRemoteStateAbility,
    FlatRemoteListAbility,
    FlatRemoteGetAllAbility,
    RemoteGetAbility,
    FlatRemoteQueryAbility,
    RemotePagingAbility,
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

    eventMap: Record<string, string> = {
        [CMD.LIST]: 'list',
        [CMD.REFRESH]: 'refresh',
        [CMD.GET_ALL]: 'getAll',
        [CMD.GET]: 'get',
        [CMD.FILTER]: 'filter',
        [CMD.SEARCH_BY]: 'searchBy',
        [CMD.SORT]: 'sort',
        [CMD.RESET]: 'reset',
        [CMD.PREV]: 'prev',
        [CMD.NEXT]: 'next',
        [CMD.JUMP]: 'jump',
        [CMD.CHANGE_SIZE]: 'changeSize',
        [CMD.CREATE]: 'create',
        [CMD.UPDATE]: 'update',
        [CMD.DELETE]: 'delete',
        [CMD.TOGGLE]: 'toggle',
        [CMD.START_EDIT]: 'startEdit',
        [CMD.SUBMIT_EDIT]: 'submitEdit',
        [CMD.CANCEL_EDIT]: 'cancelEdit',
        [CMD.ROLLBACK_ALL]: 'rollbackAll',
    };
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
    TreeManagerAbility,
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

    eventMap: Record<string, string> = {
        [CMD.LIST]: 'list',
        [CMD.REFRESH]: 'refresh',
        [CMD.GET]: 'get',
        [CMD.FILTER]: 'filter',
        [CMD.SEARCH_BY]: 'searchBy',
        [CMD.SORT]: 'sort',
        [CMD.RESET]: 'reset',
        [CMD.CREATE]: 'create',
        [CMD.UPDATE]: 'update',
        [CMD.DELETE]: 'delete',
        [CMD.EXPAND]: 'expand',
        [CMD.COLLAPSE]: 'collapse',
        [CMD.START_EDIT]: 'startEdit',
        [CMD.SUBMIT_EDIT]: 'submitEdit',
        [CMD.CANCEL_EDIT]: 'cancelEdit',
        [CMD.ROLLBACK_ALL]: 'rollbackAll',
    };
}

RemoteTreeEntityManager.use(REMOTE_TREE_ABILITIES);

export interface RemoteTreeEntityManager extends InferAbilities<typeof REMOTE_TREE_ABILITIES> {}
