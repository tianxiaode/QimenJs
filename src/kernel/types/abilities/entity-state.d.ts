import { IDeletionPlan, IEntity, ILocalChangeSet, SearchParams } from '../entities';
export interface IStateCacheAbility {
    cacheKey: string;
    tryGetCache(): Promise<any>;
    setCache(data: any): Promise<void>;
    clearCache(): Promise<void>;
}
export interface IStateSchemaAbility {
    idField: string;
    idType: string;
    nameField: string;
    defaultSort: string;
    defaultOrder: string;
    searchFields: string[];
    isTree: boolean;
    isLazy: boolean;
    root: any;
    parentIdField: string;
    childrenField: string;
    pathField: string;
    leafField: string;
    expandedField: string;
    useFlat: boolean;
}
export interface IStateSearchAbility<T extends IEntity, TSearch extends SearchParams> {
    toParams(): any;
    filter(text: string): void;
    searchBy(search: TSearch): void;
    matchKeyword(item: T): boolean;
    applySort(list: T[] | any[]): T[];
    sort(field: string, order: 'asc' | 'desc'): void;
}
export interface IStateDirtyAbility<T extends IEntity> {
    isDirty(item: T): boolean;
    startEdit(item: T): void;
    submitEdit(item: T): void;
    cancelEdit(item: T): void;
    rollbackAll(): void;
}
export interface IStateLocalMutationAbility<T extends IEntity> {
    hasChanges: boolean;
    changes: ILocalChangeSet<T>;
    updateData(result: T[]): Promise<void>;
    addItem(item: T): Promise<void>;
    updateItem(item: T): Promise<void>;
    softDelete(plan: IDeletionPlan): Promise<void>;
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan;
    confirmDelete(): Promise<void>;
    rollbackDelete(): Promise<void>;
    clearChanges(): void;
}
//# sourceMappingURL=entity-state.d.ts.map