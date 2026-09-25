import { BaseEntityManager } from './BaseEntityManager';
import type { InferAbilities, Definitions } from '@/composable';
import type { ILocalSearchParams, IFlatSearchParams, ITreeSearchParams, IEntity, RegistrSchema } from '@/schema';
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

const LocalReadonlyDefs: Definitions = {
    options: {
        schema: null,
        url: '',
        data: [],
    },
} as const;

export class LocalReadonlyEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends BaseEntityManager {
    static entityType: string = 'local-readonly';

    isRemote: boolean = false;
    sourceData = new Map<string | number, IEntity>();
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;

    url: string = '';
    schema: RegistrSchema = {
        name: '',
        idField: 'id',
        idType: 'string',
        nameField: 'name',
        domain: 'local',
        isTree: false,
    };

    eventMap: Record<string, string> = {
        [CMD.LIST]: 'list',
        [CMD.REFRESH]: 'refresh',
        [CMD.FILTER]: 'filter',
        [CMD.SORT]: 'sort',
        [CMD.GET]: 'get',
    };

    constructor(config?: Record<string, any>) {
        super(config);
        this.initOptions();
    }

    _onSchemaOptionChange(value: RegistrSchema): void {
        if (value) this.schema = value;
    }

    _onUrlOptionChange(value: string): void {
        this.url = value;
    }

    _onDataOptionChange(value: IEntity[]): void {
        if (!Array.isArray(value)) return;
        const idField = this.schema.idField || 'id';
        this.sourceData.clear();
        for (const item of value) {
            const id = item[idField];
            if (id !== undefined && id !== null) {
                this.sourceData.set(id, item);
            }
        }
        this.refreshView();
    }
}

LocalReadonlyEntityManager.use(LOCAL_READONLY_ABILITIES);
LocalReadonlyEntityManager.define(LocalReadonlyDefs);
LocalReadonlyEntityManager.register();
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

const LocalCrudDefs: Definitions = {
    options: {
        schema: null,
        url: '',
        data: [],
    },
} as const;

export class LocalCrudEntityManager<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends BaseEntityManager {
    static entityType: string = 'local-crud';

    isRemote: boolean = false;
    sourceData = new Map<string | number, IEntity>();
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;

    url: string = '';
    schema: RegistrSchema = {
        name: '',
        idField: 'id',
        idType: 'string',
        nameField: 'name',
        domain: 'local',
        isTree: false,
    };

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

    constructor(config?: Record<string, any>) {
        super(config);
        this.initOptions();
    }

    _onSchemaOptionChange(value: RegistrSchema): void {
        if (value) this.schema = value;
    }

    _onUrlOptionChange(value: string): void {
        this.url = value;
    }

    _onDataOptionChange(value: IEntity[]): void {
        if (!Array.isArray(value)) return;
        const idField = this.schema.idField || 'id';
        this.sourceData.clear();
        for (const item of value) {
            const id = item[idField];
            if (id !== undefined && id !== null) {
                this.sourceData.set(id, item);
            }
        }
        this.refreshView();
    }
}

LocalCrudEntityManager.use(LOCAL_CRUD_ABILITIES);
LocalCrudEntityManager.define(LocalCrudDefs);
LocalCrudEntityManager.register();
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

const RemoteReadonlyDefs: Definitions = {
    options: {
        schema: null,
        url: '',
        pageSize: 20,
    },
} as const;

export class RemoteReadonlyEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams,
> extends BaseEntityManager {
    static entityType: string = 'remote-readonly';

    isRemote: boolean = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as IFlatSearchParams as TSearch;
    total: number = 0;
    page: number = 1;
    pages: number = 0;
    hasMore: boolean = false;

    url: string = '';
    schema: RegistrSchema = {
        name: '',
        idField: 'id',
        idType: 'number',
        nameField: 'name',
        domain: 'remote',
        isTree: false,
    };

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

    constructor(config?: Record<string, any>) {
        super(config);
        this.initOptions();
    }

    _onSchemaOptionChange(value: RegistrSchema): void {
        if (value) this.schema = value;
    }

    _onUrlOptionChange(value: string): void {
        this.url = value;
    }

    _onPageSizeOptionChange(value: number): void {
        this.pageSize = value;
    }
}

RemoteReadonlyEntityManager.use(REMOTE_READONLY_ABILITIES);
RemoteReadonlyEntityManager.define(RemoteReadonlyDefs);
RemoteReadonlyEntityManager.register();
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

const RemoteCrudDefs: Definitions = {
    options: {
        schema: null,
        url: '',
        pageSize: 20,
    },
} as const;

export class RemoteCrudEntityManager<
    TSearch extends IFlatSearchParams = IFlatSearchParams,
> extends BaseEntityManager {
    static entityType: string = 'remote-crud';

    isRemote: boolean = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as IFlatSearchParams as TSearch;
    total: number = 0;
    page: number = 1;
    pages: number = 0;
    hasMore: boolean = false;

    url: string = '';
    schema: RegistrSchema = {
        name: '',
        idField: 'id',
        idType: 'number',
        nameField: 'name',
        domain: 'remote',
        isTree: false,
    };

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

    constructor(config?: Record<string, any>) {
        super(config);
        this.initOptions();
    }

    _onSchemaOptionChange(value: RegistrSchema): void {
        if (value) this.schema = value;
    }

    _onUrlOptionChange(value: string): void {
        this.url = value;
    }

    _onPageSizeOptionChange(value: number): void {
        this.pageSize = value;
    }
}

RemoteCrudEntityManager.use(REMOTE_CRUD_ABILITIES);
RemoteCrudEntityManager.define(RemoteCrudDefs);
RemoteCrudEntityManager.register();
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

const RemoteTreeDefs: Definitions = {
    options: {
        schema: null,
        url: '',
    },
} as const;

export class RemoteTreeEntityManager<
    TSearch extends ITreeSearchParams = ITreeSearchParams,
> extends BaseEntityManager {
    static entityType: string = 'remote-tree';

    isRemote: boolean = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as ITreeSearchParams as TSearch;
    total: number = 0;
    expandedIds: Set<string | number> = new Set();

    url: string = '';
    schema: RegistrSchema = {
        name: '',
        idField: 'id',
        idType: 'number',
        nameField: 'name',
        domain: 'remote',
        isTree: true,
        isLazy: false,
        root: null,
    };

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

    constructor(config?: Record<string, any>) {
        super(config);
        this.initOptions();
    }

    _onSchemaOptionChange(value: RegistrSchema): void {
        if (value) this.schema = value;
    }

    _onUrlOptionChange(value: string): void {
        this.url = value;
    }
}

RemoteTreeEntityManager.use(REMOTE_TREE_ABILITIES);
RemoteTreeEntityManager.define(RemoteTreeDefs);
RemoteTreeEntityManager.register();
export interface RemoteTreeEntityManager extends InferAbilities<typeof REMOTE_TREE_ABILITIES> {}
