import { BaseEntityManager } from './BaseEntityManager';
import type { InferAbilities, Definitions } from '@/composable';
import { FlatLocalStateAbility } from '../abilities';
import { DICTIONARY_MANAGER_ENTITY_TYPE } from '../types';
import type { IEntity, ILocalSearchParams } from '@/schema';
import type { RegistrSchema } from '@/schema';
import { ENTITY_COMMAND_EVENTS as CMD } from '@/events/entity-events';

const DICTIONARY_ABILITIES = [FlatLocalStateAbility] as const;

const DictionaryManagerDefs: Definitions = {
    options: {
        valueField: 'value',
        labelField: 'label',
        idType: 'string',
        searchFields: [],
        defaultSort: '',
        defaultOrder: 'asc',
        data: [],
    },
} as const;

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
        [CMD.GROUP_BY]: 'groupBy',
        [CMD.REFRESH_VIEW]: 'refreshView',
        [CMD.REFRESH]: 'refreshView',
        [CMD.LIST]: 'refreshView',
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

    constructor(config?: Record<string, any>) {
        super(config);
        this.initOptions();
    }

    _onValueFieldOptionChange(value: string): void {
        this.schema.idField = value;
    }

    _onLabelFieldOptionChange(value: string): void {
        this.schema.nameField = value;
    }

    _onIdTypeOptionChange(value: 'number' | 'string'): void {
        this.schema.idType = value;
    }

    _onSearchFieldsOptionChange(value: string[]): void {
        this.schema.searchFields = value;
    }

    _onDefaultSortOptionChange(value: string): void {
        this.schema.defaultSort = value;
    }

    _onDefaultOrderOptionChange(value: 'asc' | 'desc'): void {
        this.schema.defaultOrder = value;
    }

    _onDataOptionChange(value: any[]): void {
        this.loadDictionary(value);
    }

    loadDictionary(data: any[]): void {
        const idField = this.schema.idField || 'id';
        this.sourceData.clear();
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (idField in item) {
                const id = item[idField];
                if (id === undefined || id === null) continue;
                this.sourceData.set(id, item);
            } else {
                this.sourceData.set(`__auto_${i}`, item);
            }
        }
        this.refreshView();
    }
}

DictionaryManager.use(DICTIONARY_ABILITIES);
DictionaryManager.define(DictionaryManagerDefs);
DictionaryManager.register();
export interface DictionaryManager extends InferAbilities<typeof DICTIONARY_ABILITIES> {}