import { DomainConfig, SystemConfig } from "@orbitjs/registry";
import { GestureSemantic } from "./events";
import { Schema } from "./entities";


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
    readonly schemaFilters: string[];
    readonly schemaIdType: 'number' |'string';
}

export interface IRemoteListAbility{
    list(forceRefresh: boolean): Promise<any[]>;
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


