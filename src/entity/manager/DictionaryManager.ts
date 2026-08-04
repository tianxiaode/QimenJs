import { BaseEntityManager } from './BaseEntityManager';
import type { InferAbilities } from '@/composable';
import { FlatLocalStateAbility } from '../abilities';
import type { DictionaryManagerConfig } from '../types';
import { DICTIONARY_MANAGER_ENTITY_TYPE } from '../types';
import type { IEntity, ILocalSearchParams } from '@/schema';
import type { RegistrSchema } from '@/schema';
import { ENTITY_COMMAND_EVENTS as CMD } from '@/events/entity-events';

const DICTIONARY_ABILITIES = [FlatLocalStateAbility] as const;

export class DictionaryManager extends BaseEntityManager<ILocalSearchParams> {
    static entityType: string = DICTIONARY_MANAGER_ENTITY_TYPE;

    isRemote: boolean = false;
    sourceData = new Map<string | number, IEntity>();
    items: IEntity[] = [];
    item: IEntity | null = null;

    url: string = '';

    eventMap: Record<string, string> = {
        [CMD.LOAD_DICTIONARY]: 'loadDictionary',
        [CMD.FILTER]: 'filter',
        [CMD.SORT]: 'sort',
        [CMD.REFRESH_VIEW]: 'refreshView',
    };

    schema: RegistrSchema = {
        name: '_dictionary',
        idField: 'value',
        idType: 'string',
        nameField: 'label',
        searchFields: [],
        defaultSort: '',
        defaultOrder: 'asc',
        domain: 'local',
        isTree: false,
    };

    constructor(config: DictionaryManagerConfig) {
        super(config);
        Object.assign(this.schema, {
            idField: config.valueField ?? 'value',
            idType: config.idType ?? 'string',
            nameField: config.labelField ?? 'label',
            searchFields: config.searchFields ?? [],
            defaultSort: config.defaultSort ?? '',
            defaultOrder: config.defaultOrder ?? 'asc',
        });

        this.loadDictionary(config.data);
    }

    loadDictionary(data: any[]): void {
        const idField = this.schema.idField || 'id';
        this.sourceData.clear();
        for (const item of data) {
            const id = item[idField];
            if (id !== undefined && id !== null) {
                this.sourceData.set(id, item);
            }
        }
    }
}

DictionaryManager.use(DICTIONARY_ABILITIES);
DictionaryManager.register();
export interface DictionaryManager extends InferAbilities<typeof DICTIONARY_ABILITIES> {}
