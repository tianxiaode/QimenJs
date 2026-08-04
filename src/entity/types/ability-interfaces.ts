import type { Schema, SearchParams, ILocalSearchParams } from '@/schema';
import type { IDeletionPlan, ILocalChangeSet } from './change-set';

export interface ISchemaAbility {
    getSchema(): Schema;
    getSchemaRules(fieldName?: string): any;
    readonly schemaKeys: Record<string, string>;
    readonly schemaTree: { isTree: boolean; isLazy: boolean; root: any };
    readonly schemaSort: { prop: string; order: string };
    readonly schemaFilters: string[];
    readonly schemaIdType: string;
}

export interface ILocalListAbility<T = any> {
    list(): Promise<T[]>;
    refresh(): Promise<T[]>;
    filter(keyword: string): T[];
    sort(sortBy: string, sortOrder: 'asc' | 'desc'): T[];
}

export interface ILocalGetAbility<T = any> {
    get(id: string | number): T | undefined;
}

export interface IFlatLocalMutationAbility<T = any> {
    create(item: T): void;
    update(item: T): void;
    toggle(item: T, field?: string): void;
    save(isBatch?: boolean): Promise<void>;
}

export interface IFlatLocalDeleteAbility<T = any> {
    delete(ids: (string | number)[], immediate?: boolean): Promise<void>;
}

export interface IFlatLocalStateAbility<T = any> {
    readonly loading: boolean;
    readonly isEmpty: boolean;
    readonly total: number;
    readonly items: T[];
    readonly hasChanges: boolean;
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan<T>;
    readonly adds: T[];
    readonly updates: T[];
}

export interface IFlatRemoteListAbility<T = any> {
    list(): Promise<T[]>;
    refresh(): Promise<T[]>;
}

export interface IFlatRemoteGetAllAbility<T = any> {
    getAll(): Promise<T[]>;
}

export interface IRemoteGetAbility<T = any> {
    get(id: string | number): Promise<T>;
}

export interface IRemoteCreateAbility<T = any> {
    create(data: Partial<T>): Promise<T>;
}

export interface IRemoteUpdateAbility<T = any> {
    update(data: Partial<T>): Promise<T>;
}

export interface IRemoteDeleteAbility {
    delete(id: string | number | (string | number)[]): Promise<void>;
}

export interface IRemoteToggleAbility<T = any> {
    toggle(item: T, field?: string): Promise<void>;
}

export interface IFlatRemoteQueryAbility {
    prev(): Promise<void>;
    next(): Promise<void>;
    jump(page: number): Promise<void>;
    changeSize(size: number): Promise<void>;
    filter(text: string): Promise<void>;
    searchBy(search: any): Promise<void>;
    sort(prop: string, order: string): Promise<void>;
    reset(): Promise<void>;
}

export interface IFlatRemoteStateAbility<T = any> {
    readonly loading: boolean;
    readonly isEmpty: boolean;
    readonly hasMore: boolean;
    readonly total: number;
    readonly items: T[];
    readonly page: number;
    readonly pageSize: number;
    readonly pages: number;
    isDirty(currentItem?: T): boolean;
    edit(item: T): void;
    rollback(): void;
}

export interface ITreeRemoteStateAbility<T = any> {
    readonly loading: boolean;
    readonly isEmpty: boolean;
    readonly items: T[];
}

export interface ITreeManagerAbility<T = any> {
    expand(id: string | number): void;
    collapse(id: string | number): void;
    move(id: string | number, targetPid: string | number | null): void;
    refresh(pid?: string | number): Promise<void>;
    getSubTree(pid?: string | number): T[];
    isDirty(currentItem?: T): boolean;
    edit(item: T): void;
    rollback(): void;
}

export interface IStateSchemaAbility {
    readonly idField: string;
    readonly idType: string;
    readonly nameField: string;
    readonly defaultSort: string;
    readonly defaultOrder: string;
    readonly searchFields: string[];
    readonly isTree: boolean;
    readonly isLazy: boolean;
    readonly root: any;
    readonly parentIdField: string;
    readonly childrenField: string;
    readonly pathField: string;
    readonly leafField: string;
    readonly expandedField: string;
    readonly useFlat: boolean;
}

export interface IStateCacheAbility {
    readonly cacheKey: string;
    tryGetCache(): Promise<any>;
    setCache(data: any): Promise<void>;
    clearCache(): Promise<void>;
}

export interface IStateDirtyAbility<T = any> {
    isDirty(item?: T): boolean;
    startEdit(item: T): void;
    submitEdit(item: T): void;
    cancelEdit(item: T): void;
    rollbackAll(): void;
}

export interface IStateLocalMutationAbility<T = any> {
    readonly hasChanges: boolean;
    readonly changes: ILocalChangeSet<T>;
    addItem(item: T): Promise<void>;
    updateItem(item: T): Promise<void>;
    updateData(result: any[]): Promise<void>;
    softDelete(plan: IDeletionPlan<T>): Promise<void>;
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan<T>;
    confirmDelete(): Promise<void>;
    rollbackDelete(): Promise<void>;
    clearChanges(): void;
}

export interface IStateSearchAbility<T = any, TSearch extends SearchParams = SearchParams> {
    toParams(): any;
    filter(text: string): void;
    searchBy(search: Partial<TSearch>): void;
    matchKeyword(item: T): boolean;
    applySort(list: T[]): T[];
    sort(field: string, order: string): void;
}

export interface ITreePathAbility<T = any> {
    ingest(data: T | T[], manualParentId?: string | number | null): void;
    rebuildDescendantsPaths(pid: any, parentPath: string, nextDepth: number): void;
    toggleExpand(id: string | number | T, expanded?: boolean): void;
    toggleLeaf(id: string | number | T, leaf?: boolean): void;
}

export interface ITreeLifecycleAbility<T = any> {
    removeNode(id: string | number): void;
    moveNode(id: string | number, targetPid: string | number | null): void;
    syncChildren(pid: string | number | null, newData: T[]): void;
    getChildren(pid?: any, predicate?: (node: T) => boolean): T[];
}

export interface ITreeSearchAbility<T = any> {
    applySearchExpansion(): void;
    applySort(list: T[]): T[];
    matchKeyword(node: T, keyword: string): boolean;
}

export interface ITreeViewAbility {
    refreshView(): void;
}