import type {
    IEntity,
    Schema,
    SearchParams,
    ILocalSearchParams,
    IFlatSearchParams,
    ITreeSearchParams,
} from '@/schema';
import type { ILocalChangeSet, IDeletionPlan } from './change-set';

export interface IBaseEntityState<TSearch extends SearchParams = SearchParams> {
    loading: boolean;
    items: IEntity[];
    item: IEntity | null;
    search: TSearch;
    schema: Schema;
    cacheTTL: number;
    isRemote: boolean;
    refreshView(): void;
    dispose(): void;
}

export interface ILocalEntityState<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends IBaseEntityState<TSearch> {
    sourceData: Map<string | number, IEntity>;
    updateData(result: any[]): void;
}

export interface IFlatLocalEntityState<
    TSearch extends ILocalSearchParams = ILocalSearchParams,
> extends ILocalEntityState<TSearch> {
    hasChanges: boolean;
    changes: ILocalChangeSet;
    addItem(item: IEntity): Promise<void>;
    updateItem(item: IEntity): Promise<void>;
    softDelete(plan: IDeletionPlan): Promise<void>;
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan;
    confirmDelete(): Promise<void>;
    rollbackDelete(): Promise<void>;
    clearChanges(): Promise<void>;
}

export interface IRemoteEntityState<
    TSearch extends SearchParams = SearchParams,
> extends IBaseEntityState<TSearch> {
    total: number;
}

export interface IFlatRemoteEntityState<
    TSearch extends IFlatSearchParams = IFlatSearchParams,
> extends IRemoteEntityState<TSearch> {
    page: number;
    pageSize: number;
    pages: number;
    hasMore: boolean;
    isDirty(currentItem?: IEntity): boolean;
    edit(item: IEntity): void;
    rollback(): void;
}

export interface ITreeRemoteEntityState<
    TSearch extends ITreeSearchParams = ITreeSearchParams,
> extends IRemoteEntityState<TSearch> {
    expandedIds: Set<string | number>;
}

export type EntityState<TSearch extends SearchParams = SearchParams> =
    | ILocalEntityState<TSearch>
    | IRemoteEntityState<TSearch>;
