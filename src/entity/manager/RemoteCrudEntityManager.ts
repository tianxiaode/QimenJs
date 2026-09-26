import { BaseEntityManager } from './BaseEntityManager';
import type { InferAbilities, Definitions } from '@/composable';
import type { IFlatSearchParams, IEntity, RegistrSchema } from '@/schema';
import { ENTITY_COMMAND_EVENTS as CMD } from '@/events/entity-events';
import {
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
} from '../abilities';

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

    _onPageSizeOptionChange(value: number): void {
        this.pageSize = value;
    }
}

RemoteCrudEntityManager.use(REMOTE_CRUD_ABILITIES);
RemoteCrudEntityManager.define(RemoteCrudDefs);
RemoteCrudEntityManager.register();
export interface RemoteCrudEntityManager extends InferAbilities<typeof REMOTE_CRUD_ABILITIES> {}
