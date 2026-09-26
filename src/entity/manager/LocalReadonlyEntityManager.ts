import { BaseEntityManager } from './BaseEntityManager';
import type { InferAbilities, Definitions } from '@/composable';
import type { ILocalSearchParams, IEntity, RegistrSchema } from '@/schema';
import { ENTITY_COMMAND_EVENTS as CMD } from '@/events/entity-events';
import {
    FlatLocalStateAbility,
    LocalListAbility,
    LocalGetAbility,
} from '../abilities';

const LOCAL_READONLY_ABILITIES = [
    FlatLocalStateAbility,
    LocalListAbility,
    LocalGetAbility,
] as const;

const LocalReadonlyDefs: Definitions = {
    options: {
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
