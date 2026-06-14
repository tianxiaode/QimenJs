import { FlatSchema, ICacheProvider, IEntity, IFlatRemoteEntityState, IFlatSearchParams } from '../../types';
import { RemoteEntityState } from './RemoteEntityState';
export declare class FlatRemoteEntityState<T extends IEntity, TSearch extends IFlatSearchParams> extends RemoteEntityState<T, TSearch> implements IFlatRemoteEntityState<T, TSearch> {
    items: T[];
    total: number;
    pages: number;
    pageSizes: number[];
    constructor(schema: FlatSchema, cacheProvider?: ICacheProvider, chcheTTL?: number, pageSize?: number, pageSizes?: number[]);
    get page(): number;
    set page(page: number);
    get pageSize(): number;
    set pageSize(pageSize: number);
    get sortBy(): string;
    set sortBy(sortBy: string);
    get order(): "asc" | "desc";
    set order(order: 'asc' | 'desc');
    get filterBy(): string;
    set filterBy(filterBy: string);
    get searchBy(): Partial<TSearch>;
    set searchBy(searchBy: Partial<TSearch>);
    isValidPage(page: number): boolean;
    isValidPageSize(pageSize: number): boolean;
    toParams(): any;
    getCacheKey(): string;
    updateData(items: T[], total: number): Promise<void>;
    updateItem(item: T): Promise<void>;
    delete(id: string | number | (string | number)[]): Promise<void>;
    reset(): void;
    protected getDefaultSearch(customPageSize: number): TSearch;
    dispose(): void;
}
//# sourceMappingURL=FlatRemoteEntityState.d.ts.map