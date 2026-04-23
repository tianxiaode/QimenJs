import { IBaseEntityState, IEntity, IExposeResult, SearchParams } from '../../types';
import { AbilityBase } from '../../composable';
import { array } from '@orbitjs/utils';

export class StateSearchAbility<
    T extends IEntity,
    TSearch extends SearchParams,
> extends AbilityBase<IBaseEntityState<T, TSearch>> {
    protected expose(): IExposeResult {
        const host: any = this.host;
        if (!host.search || Object.keys(host.search).length === 0) {
            host.search = this.getDefaultSearch();
        }
        return {
            toParams: () => this.toParams(),

            filter: (text: string) => (host.search.keyword = text),

            searchBy: (search: Partial<TSearch>) => (host.search = { ...host.search, ...search }),
            matchKeyword: (item: T) => this.matchKeyword(item),
            applySort: (list: T[] | any[]) => this.applySort(list),
            sort: (field: string, order: 'asc' | 'desc'= 'asc') => (
                (host.search.sortBy = field),
                (host.search.sortOrder = order)
            ),
        };
    }

    protected getDefaultSearch(): TSearch {
        const host: any = this.host;
        const { schema } = host;
        const parentIdField = schema.parentIdField || 'parentId';
        const search: any = {
            keyword: '',
            sortBy: schema.defaultSortBy || '',
            order: schema.defaultSortOrder || 'asc',
        };
        if (schema.isRemote && !schema.isTree) {
            search.page = 1;
        }
        if (schema.isTree) {
            search[parentIdField] = null;
            search.depth = 1;
        }

        return search;
    }
    private toParams(): Record<string, any> {
        const host: any = this.host;
        const { schema } = host;
        const params: Record<string, any> = {};
        const search = host.search as Record<string, any>;

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

        if (!schema.isTree) {
            params.page = host.page || 1;
            params.pageSize = host.pageSize || 20;
        } else {
            params.parentId = params.parentId || host.root || null;
        }

        return params;
    }

    private matchKeyword(node: T): boolean {
        const host = this.host;
        const { schema } = host;
        const searchFields = schema.searchFields || [];
        const keyword = host.search.keyword;
        if (!keyword) return false;

        const k = keyword.toLowerCase();
        // 使用 some：只要有一个字段匹配就返回 true
        return searchFields.some(field => {
            const value = (node as any)[field];
            return typeof value === 'string' && value.toLowerCase().includes(k);
        });
    }

    private applySort(list: T[]): T[] {
        const host = this.host;
        // 确保 search 对象已初始化且存在排序字段
        const { sortBy, sortOrder } = host.search || {};

        if (!sortBy || !list || list.length <= 1) {
            return list;
        }

        return array.orderBy(list, [
            {
                by: sortBy as keyof T,
                order: (sortOrder || 'asc') as 'asc' | 'desc',
            },
        ]);
    }
}
