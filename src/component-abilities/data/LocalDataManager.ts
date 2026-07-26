import { ComposableBase, withAbilities } from '@/composable';
import type { InferAbilities } from '@/composable';
import { FlatLocalStateAbility } from '@/entity/abilities/local/FlatLocalStateAbility';
import type { ILocalSearchParams } from '@/schema';

export interface LocalDataManagerConfig {
    idField?: string;
    idType?: 'number' | 'string';
    nameField?: string;
    searchFields?: string[];
    defaultSort?: string;
    defaultOrder?: 'asc' | 'desc';
}

export interface ILocalDataManager {
    isRemote: boolean;
    sourceData: Map<string | number, any>;
    loading: boolean;
    items: any[];
    item: any;
    search: ILocalSearchParams;
    cacheTTL: number;
    schema: {
        name: string;
        idField: string;
        idType: 'number' | 'string';
        nameField: string;
        searchFields: string[];
        defaultSort: string;
        defaultOrder: 'asc' | 'desc';
        domain: string;
        isTree: boolean;
        [key: string]: any;
    };

    updateData(result: any[]): Promise<void>;
    filter(text: string): void;
    sort(field: string, order: 'asc' | 'desc'): void;
    refreshView(): Promise<void>;
    matchKeyword(item: any): boolean;
    applySort(list: any[]): any[];
    get(id: string | number): any | null;
    dispose(): void;

    hasChanges: boolean;
    isEmpty: boolean;
    total: number;
}

const LOCAL_DATA_MANAGER_ABILITIES = [FlatLocalStateAbility] as const;

export class LocalDataManager extends ComposableBase {
    isRemote: boolean = false;
    sourceData: Map<string | number, any> = new Map();
    loading: boolean = false;
    items: any[] = [];
    item: any = null;
    search: ILocalSearchParams = {};
    cacheTTL: number = 0;

    schema: {
        name: string;
        idField: string;
        idType: 'number' | 'string';
        nameField: string;
        searchFields: string[];
        defaultSort: string;
        defaultOrder: 'asc' | 'desc';
        domain: string;
        isTree: boolean;
        [key: string]: any;
    };

    constructor(config?: LocalDataManagerConfig) {
        super();
        this.schema = {
            name: '_localData',
            idField: config?.idField || 'id',
            idType: config?.idType || 'number',
            nameField: config?.nameField || 'name',
            searchFields: config?.searchFields || [],
            defaultSort: config?.defaultSort || '',
            defaultOrder: config?.defaultOrder || 'asc',
            domain: 'local',
            isTree: false,
        };
    }

    get(id: string | number): any | null {
        const idField = this.schema.idField;
        let result = this.sourceData.get(id) ?? null;
        if (result === null && idField !== 'id') {
            result =
                Array.from(this.sourceData.values()).find((item: any) => item[idField] === id) ??
                null;
        }
        this.item = result;
        return result;
    }
}

withAbilities(LocalDataManager, LOCAL_DATA_MANAGER_ABILITIES);

export interface LocalDataManager extends InferAbilities<typeof LOCAL_DATA_MANAGER_ABILITIES> {}
