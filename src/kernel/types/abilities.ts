import { DomainConfig, SystemConfig } from "@orbitjs/registry";
import { GestureSemantic } from "./events";
import { IDeletionPlan, IEntity, IFlatLocalEntityState, ILocalSearchParams, Schema } from "./entities";


export interface IEventAbilitiy {
    on(event: string, listener: Function): () => void;
    once(event: string, listener: Function): void;
    emit(event: string, payload?: any): void;
}

export interface IDomEventsAbility extends IEventAbilitiy{
    bind: (target: EventTarget, semantic: GestureSemantic, options?: any) => void;
}

export interface IDomainAbility {
    domainConfig: DomainConfig;
}

export interface ISystemAbility {
    systemConfig<K extends keyof SystemConfig>(key?: K): Partial<SystemConfig> | any;
}

export interface FlatLocalStateAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
>{
    loading: boolean;
    isEmpty: boolean;
    total: number;
    items: T[];
    hasChanges: boolean;
    getDeletionPlan(ids: (string | number)[]):IDeletionPlan;
    adds(items: T[]): void;
    updates(items: Partial<T>[]): void;
}

export interface IlatLocalMutationAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
>{
    create(item: T): T;
    update(item: Partial<T>):T;
    toggle(item: T, field: keyof T): void;
    save(isBatch: boolean): Promise<void>;

}

export interface ICollectionAbility<T, TC> {
    loading: boolean;
    isEmpty: boolean;
    hasMore: boolean;
    total: number;
    items: T[];
    pageIndex: number;
    pageSize: number;
    pageCount: number;
}

export interface ILocalListAbility<T,TC> {
    list(forceRefresh: boolean): Promise<T[]>;
    filter(text:string):Promise<T[]>;
    search(criteria: Partial<TC>): Promise<T[]>;
    sort(key: string, order: any): Promise<T[]>;
    applyLocalProcess(): T[];
}

export interface ISchemaAbility {
    getSchema(): Schema;
    getSchemaRules(fieldName?: string): Record<string, any> | any[];
    
    // 属性部分
    readonly schemaKeys: { id: string; label: string; createdAt: string; updatedAt: string };
    readonly schemaSort: { prop: string; order: string };
    readonly schemaTree: { isTree: boolean; isLazy: boolean; root: any };
    readonly schemaFilters: string[];
    readonly schemaIdType: 'number' |'string';
}

export interface IRemoteListAbility<T>{
    list(forceRefresh: boolean): Promise<T[]>;
}

export interface IRemoteGetAbility<T> {
    get(id: any): Promise<T>;
}

export interface IRemoteGetAllAbility<T> {
    getAll(): Promise<T[]>;
}

export interface IRemoteCreateAbility<T> {
    create(data: T): Promise<T>;
}

export interface ILocalCreateAbility<T> {
    create(data: T): T;
}

export interface IRemoteUpdateAbility<T> {
    update(data: Partial<T>): Promise<T>;
}

export interface ILocalUpdateAbility<T> {
    update(data: Partial<T>): T;
    getDirty(): Array<{ id: any; changes: Partial<T>; original: T }>;
    undoLocalUpdate(id: any): void;
    clearDirtyStatus(): void;
}

export interface IRemoteDeleteAbility {
    delete(id: any): Promise<void>;
}

export interface ILocalDeleteAbility {
    delete(id: any): void;
    getDeletedIds(): any[];
    clearDeletedStatus(): void;
}

export interface IRemoteToggleAbility<T> { 
    toggle(id: any, field: keyof T): void;
}

export interface ILocalToggleAbility<T> { 
    toggle(id: any, field: keyof T): void;
}

export interface IRemoteQueryAbility<T, TC> {
    prev(): Promise<T[]> | any[];
    next(): Promise<T[]> | any[];
    jump(page: number): Promise<T[]> | void;
    changeSize(size: number): Promise<T[]> | void;
    filter(text: string): Promise<T[]>;
    search(criteria: Partial<TC>): Promise<T[]>;
    sort(prop: string, order: 'asc' | 'desc' | null): Promise<T[]>;
    refresh(): Promise<T[]>;
    reset(): Promise<T[]>;
}