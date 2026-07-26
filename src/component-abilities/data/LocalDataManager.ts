import { ComposableBase, withAbilities } from '@/composable';
import type { InferAbilities } from '@/composable';
import { FlatLocalStateAbility } from '@/entity/abilities/local/FlatLocalStateAbility';
import type { ILocalSearchParams } from '@/schema';

/** 本地数据管理器配置 */
export interface LocalDataManagerConfig {
    /** 主键字段名，默认 'id' */
    idField?: string;
    /** 主键类型，默认 'number' */
    idType?: 'number' | 'string';
    /** 名称字段名，默认 'name' */
    nameField?: string;
    /** 搜索字段列表 */
    searchFields?: string[];
    /** 默认排序字段 */
    defaultSort?: string;
    /** 默认排序方向 */
    defaultOrder?: 'asc' | 'desc';
}

/** 本地数据管理器接口 */
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

/**
 * 本地数据管理器
 * 基于 ComposableBase + FlatLocalStateAbility，提供本地数据的 CRUD、搜索、排序等操作
 */
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

    /** 根据主键获取数据项，支持自定义 idField 查找 */
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
