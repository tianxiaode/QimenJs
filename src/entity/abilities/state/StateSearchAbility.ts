import { AbilityBase, type IExposeResult } from '@/composable';
import type { IBaseEntityState } from '@/entity/types';
import { array } from '@orbitjs/utils';

export class StateSearchAbility extends AbilityBase {
    protected expose(): IExposeResult {
        return {
            toParams: () => this.toParams(),

            filter: (text: string) => {
                const host = this.host as IBaseEntityState;
                (host.search as any).keyword = text;
            },

            searchBy: (search: any) => {
                const host = this.host as IBaseEntityState;
                host.search = { ...host.search, ...search };
            },

            matchKeyword: (item: any) => this.matchKeyword(item),
            applySort: (list: any[]) => this.applySort(list),

            sort: (field: string, order: 'asc' | 'desc' = 'asc') => {
                const host = this.host as IBaseEntityState;
                (host.search as any).sortBy = field;
                (host.search as any).sortOrder = order;
            },
        };
    }

    protected getDefaultSearch(): any {
        const host = this.host as IBaseEntityState;
        const { schema } = host;
        const parentIdField = (schema as any).parentIdField || 'parentId';
        const search: any = {
            keyword: '',
            sortBy: (schema as any).defaultSortBy || '',
            order: (schema as any).defaultSortOrder || 'asc',
        };
        if ((schema as any).isRemote && !(schema as any).isTree) {
            search.page = 1;
        }
        if ((schema as any).isTree) {
            search[parentIdField] = null;
            search.depth = 1;
        }

        return search;
    }

    private toParams(): Record<string, any> {
        const host = this.host as IBaseEntityState;
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

        if (!(schema as any).isTree) {
            params.page = (host as any).page || 1;
            params.pageSize = (host as any).pageSize || 20;
        } else {
            params.parentId = params.parentId || (host as any).root || null;
        }

        return params;
    }

    private matchKeyword(node: any): boolean {
        const host = this.host as IBaseEntityState;
        const searchFields = host.schema.searchFields || [];
        const keyword = (host.search as any).keyword;
        if (!keyword) return false;

        const k = keyword.toLowerCase();
        // 使用 some：只要有一个字段匹配就返回 true
        return searchFields.some(field => {
            const value = node[field];
            return typeof value === 'string' && value.toLowerCase().includes(k);
        });
    }

    private applySort(list: any[]): any[] {
        const host = this.host as IBaseEntityState;
        // 确保 search 对象已初始化且存在排序字段
        const { sortBy, sortOrder } = host.search as any || {};

        if (!sortBy || !list || list.length <= 1) {
            return list;
        }

        return array.orderBy(list, [
            {
                by: sortBy,
                order: (sortOrder || 'asc') as 'asc' | 'desc',
            },
        ]);
    }
}
