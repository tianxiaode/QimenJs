import { BaseEntityManager } from './BaseEntityManager';
import type { InferAbilities, Definitions } from '@/composable';
import type { ITreeSearchParams, IEntity, RegistrSchema } from '@/schema';
import { ENTITY_COMMAND_EVENTS as CMD } from '@/events/entity-events';
import {
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
} from '../abilities';

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
    options: {},
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
}

RemoteTreeEntityManager.use(REMOTE_TREE_ABILITIES);
RemoteTreeEntityManager.define(RemoteTreeDefs);
RemoteTreeEntityManager.register();
export interface RemoteTreeEntityManager extends InferAbilities<typeof REMOTE_TREE_ABILITIES> {}
