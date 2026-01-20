import {
    FlatSchema,
    ICacheProvider,
    IEntity,
    IFlatRemoteEntityState,
    IFlatSearchParams,
} from '../../types';
import { RemoteEntityState } from './RemoteEntityState';

export class FlatRemoteEntityState<T extends IEntity, TSearch extends IFlatSearchParams>
    extends RemoteEntityState<T, TSearch>
    implements IFlatRemoteEntityState<T, TSearch>
{
    items: T[] = [];
    total: number = 0;
    pages: number = 0;
    pageSizes: number[];

    constructor(
        schema: FlatSchema,
        cacheProvider?: ICacheProvider,
        chcheTTL: number = 300000,
        pageSize?: number,
        pageSizes?: number[]
    ) {
        super(schema, cacheProvider, chcheTTL);
        this.pageSizes = pageSizes || [10, 20, 50, 100];
        const initialPageSize = pageSize || this.pageSizes[0];
        this.search = this.getDefaultSearch(initialPageSize);
    }

    get page() {
        return this.search.page!;
    }
    set page(page: number) {
        this.search.page = page;
    }
    get pageSize() {
        return this.search.pageSize!;
    }
    set pageSize(pageSize: number) {
        this.search.pageSize = pageSize;
    }

    get sortBy() {
        return this.search.sortBy!;
    }
    set sortBy(sortBy: string) {
        this.search.sortBy = sortBy;
    }
    get order() {
        return this.search.sortOrder!;
    }
    set order(order: 'asc' | 'desc') {
        this.search.sortOrder = order;
    }

    get filterBy() {
        return this.search.keyword!;
    }
    set filterBy(filterBy: string) {
        this.search.keyword = filterBy;
    }

    get searchBy() {
        const result = { ...this.search };
        delete result.page;
        delete result.pageSize;
        delete result.sortBy;
        delete result.sortOrder;
        delete result.keyword;
        return result;
    }

    set searchBy(searchBy: Partial<TSearch>) {
        this.search = {
            ...this.search,
            ...searchBy,
        };
    }

    isValidPage(page: number): boolean {
        return page >= 1 && (this.pages === 0 || page <= this.pages);
    }

    isValidPageSize(pageSize: number): boolean {
        return this.pageSizes.includes(pageSize);
    }

    toParams() {
        const base = super.toParams();
        return {
            ...base,
            _page: this.page || 1,
            _limit: this.pageSize || 20,
        };
    }

    getCacheKey(): string {
        const params: any = this.toParams();
        // 将所有参数按 key 排序后序列化，确保缓存键的唯一性和稳定性
        const queryStr = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${this.schema.name}:${queryStr}`;
    }

    updateData(items: T[], total: number): void {
        this.items = items;
        this.total = total;
        this.pages = Math.ceil(total / this.pageSize);
    }

    reset(): void {
        this.item = null;
        this.snapshot = null;
        this.items = [];
        this.total = 0;
        this.search = this.getDefaultSearch(this.pageSize);
    }

    protected getDefaultSearch(customPageSize: number): TSearch {
        return {
            page: 1,
            pageSize: customPageSize || this.pageSizes[0],
            keyword: '',
            sortBy: this.schema.defaultSort || '',
            order: this.schema.defaultOrder || 'asc',
        } as IFlatSearchParams as TSearch;
    }

    dispose(): void {
        this.reset();
        this.items = [];
        this.pageSizes = [];
        super.dispose();
    }
}
