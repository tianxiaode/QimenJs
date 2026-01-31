import { IBaseEntityState, ICacheProvider, IEntity, Schema, SearchParams } from '../../types';

export abstract class BaseEntityState<T extends IEntity, TSearch extends SearchParams> implements IBaseEntityState<T, TSearch> {
    loading: boolean = false;
    items: T[] = [];
    item: T | null = null;
    search: TSearch = {} as TSearch;
    cacheTTL: number = 300000; // 默认缓存5分钟
    idField: string = 'id';
    nameField: string = 'name';    
    parentIdField: string = 'parentId';
    root: string | number = 'root';
    leafField: string = 'leaf';
    expandedField: string = 'expanded';
    isLazy: boolean = false;
    searchFields: string[] = [];
    schema: Schema;

    constructor(
        schema: Schema,
        private cacheProvider?: ICacheProvider,
        cacheTTL: number = 300000
    ) {
        this.cacheTTL = cacheTTL;
        this.schema = schema;
        this.idField = this.schema.idField || 'id';
        this.nameField = this.schema.nameField || 'name';
        this.searchFields = this.schema.searchFields || [];
        if(this.schema.isTree){
            this.parentIdField = this.schema.parentIdField || 'parentId';
            this.root = this.schema.root || 'root';
            this.leafField = this.schema.leafField || 'leaf';
            this.expandedField = this.schema.expandedField || 'expanded';
            this.isLazy = this.schema.isLazy || false;
        }
    }


    /** * 获取当前搜索条件对应的缓存 Key
     * Flat 模式下可能是 page+pageSize+keyword
     * Tree 模式下可能是 parentId+keyword
     */
    abstract getCacheKey(): string;

    async delete(id: string | number | (string | number)[]): Promise<void>{};

    async tryGetCache() {
        if (!this.cacheProvider) return null;
        return await this.cacheProvider.get(this.getCacheKey());
    }

    async setCache(data: any) {
        await this.cacheProvider?.set(this.getCacheKey(), data, this.cacheTTL);
    }

    async clearCache(): Promise<void> {
        await this.cacheProvider?.clear();
    }

    abstract updateData(...args: any[]): Promise<void>;
    abstract reset(): void;

    async updateItem(item: T): Promise<void> {
        this.item = item;
    }

    /**
     * 将搜索对象转换为 API 请求参数
     */
    toParams(): Record<string, any> {
        const params: Record<string, any> = {};
        const search = this.search as Record<string, any>;

        Object.keys(search).forEach(key => {
            const value = search[key];

            // 1. 过滤掉无意义的参数
            if (value === undefined || value === null || value === '') {
                return;
            }

            // 2. 特殊处理：数组通常需要转换为逗号分隔或特定的格式
            if (Array.isArray(value)) {
                params[key] = value.join(',');
                return;
            }

            // 3. 默认赋值
            params[key] = value;
        });

        return params;
    }

    dispose(): void {
        this.search = null as any; // 统一搜索对象
        this.item = null;
        this.loading = false;
        this.cacheProvider = undefined;
    }
}
