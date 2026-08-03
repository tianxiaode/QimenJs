import { BaseEntityManager } from './BaseEntityManager';
import { withAbilities } from '@/composable';
import type { InferAbilities } from '@/composable';
import { FlatLocalStateAbility } from '../abilities/local/FlatLocalStateAbility';
import type { ILocalSearchParams } from '../types';
import type { IEntity } from '@/schema';
import type { RegistrSchema } from '@/schema';

export interface DictionaryManagerConfig {
    valueField?: string;
    labelField?: string;
    idType?: 'number' | 'string';
    searchFields?: string[];
    defaultSort?: string;
    defaultOrder?: 'asc' | 'desc';
}

const DICTIONARY_ABILITIES = [FlatLocalStateAbility] as const;

export class DictionaryManager extends BaseEntityManager<ILocalSearchParams> {
    static entityType: string = '_dictionary';

    isRemote: boolean = false;
    sourceData = new Map<string | number, IEntity>();
    items: IEntity[] = [];
    item: IEntity | null = null;

    url: string = '';

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
        const dictConfig = config?.dictConfig as DictionaryManagerConfig | undefined;
        if (dictConfig) {
            Object.assign(this.schema, {
                idField: dictConfig.valueField ?? 'value',
                idType: dictConfig.idType ?? 'string',
                nameField: dictConfig.labelField ?? 'label',
                searchFields: dictConfig.searchFields ?? [],
                defaultSort: dictConfig.defaultSort ?? '',
                defaultOrder: dictConfig.defaultOrder ?? 'asc',
            });
        }
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

withAbilities(DictionaryManager, DICTIONARY_ABILITIES);

export interface DictionaryManager extends InferAbilities<typeof DICTIONARY_ABILITIES> {}
