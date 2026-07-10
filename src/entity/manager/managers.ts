import { BaseEntityManager } from './BaseEntityManager';
import type {
    ILocalSearchParams,
    IFlatSearchParams,
    ITreeSearchParams,
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
import { DomainPagingAbility } from '@/entity/abilities/core/DomainPagingAbility';
import { SearchAbility } from '@/entity/abilities/search/SearchAbility';
import { TreePathAbility } from '@/entity/abilities/tree/TreePathAbility';
import { TreeLifecycleAbility } from '@/entity/abilities/tree/TreeLifecycleAbility';
import { TreeSearchAbility } from '@/entity/abilities/tree/TreeSearchAbility';
import { TreeViewAbility } from '@/entity/abilities/tree/TreeViewAbility';

// ============================================
// LocalReadonlyEntityManager
// ============================================

export abstract class LocalReadonlyEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends BaseEntityManager.with([FlatLocalStateAbility, LocalListAbility, LocalGetAbility]) {
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

export abstract class LocalCrudEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends BaseEntityManager.with([
    FlatLocalStateAbility, LocalListAbility, LocalGetAbility,
    FlatLocalMutationAbility, FlatLocalDeleteAbility,
]) {
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

export abstract class RemoteReadonlyEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams,
> extends BaseEntityManager.with([
    SchemaProxyAbility, CacheAbility, DirtyAbility, SearchAbility,
    DomainPagingAbility, FlatRemoteStateAbility, FlatRemoteListAbility,
    FlatRemoteGetAllAbility, RemoteGetAbility, FlatRemoteQueryAbility,
]) {
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

export abstract class RemoteCrudEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams,
> extends BaseEntityManager.with([
    SchemaProxyAbility, CacheAbility, DirtyAbility, SearchAbility,
    DomainPagingAbility, FlatRemoteStateAbility, FlatRemoteListAbility,
    FlatRemoteGetAllAbility, RemoteGetAbility, FlatRemoteQueryAbility,
    RemoteCreateAbility, RemoteUpdateAbility, RemoteDeleteAbility, RemoteToggleAbility,
]) {
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

export abstract class RemoteTreeEntityManager<
    TSearch extends ITreeSearchParams = ITreeSearchParams,
> extends BaseEntityManager.with([
    SchemaProxyAbility, CacheAbility, DirtyAbility, SearchAbility,
    TreePathAbility, TreeLifecycleAbility, TreeSearchAbility, TreeViewAbility,
    TreeRemoteStateAbility, FlatRemoteListAbility, RemoteGetAbility,
    FlatRemoteQueryAbility, RemoteCreateAbility, RemoteUpdateAbility, RemoteDeleteAbility,
]) {
    isRemote: true = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as ITreeSearchParams as TSearch;
    total: number = 0;
    expandedIds: Set<string | number> = new Set();
}
