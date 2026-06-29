import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import type { IBaseEntityState } from '@/entity/types';
import { array } from '@orbitjs/utils';

export class StateSearchAbility extends AbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            toParams: function(this: IBaseEntityState): Record<string, any> {
                const { schema } = this;
                const params: Record<string, any> = {};
                const search = this.search as Record<string, any>;

                Object.keys(search).forEach(key => {
                    const value = search[key];

                    if (value === undefined || value === null || value === '') {
                        return;
                    }

                    if (Array.isArray(value)) {
                        params[key] = value.join(',');
                        return;
                    }

                    params[key] = value;
                });

                if (!(schema as any).isTree) {
                    params.page = (this as any).page || 1;
                    params.pageSize = (this as any).pageSize || 20;
                } else {
                    params.parentId = params.parentId || (this as any).root || null;
                }

                return params;
            },

            filter: function(this: IBaseEntityState, text: string) {
                (this.search as any).keyword = text;
            },

            searchBy: function(this: IBaseEntityState, search: any) {
                this.search = { ...this.search, ...search };
            },

            matchKeyword: function(this: IBaseEntityState, item: any): boolean {
                const searchFields = this.schema.searchFields || [];
                const keyword = (this.search as any).keyword;
                if (!keyword) return true;

                const k = keyword.toLowerCase();
                return searchFields.some(field => {
                    const value = item[field];
                    return typeof value === 'string' && value.toLowerCase().includes(k);
                });
            },

            applySort: function(this: IBaseEntityState, list: any[]): any[] {
                const { sortBy, sortOrder } = this.search as any || {};

                if (!sortBy || !list || list.length <= 1) {
                    return list;
                }

                return array.orderBy(list, [
                    {
                        by: sortBy,
                        order: (sortOrder || 'asc') as 'asc' | 'desc',
                    },
                ]);
            },

            sort: function(this: IBaseEntityState, field: string, order: 'asc' | 'desc' = 'asc') {
                (this.search as any).sortBy = field;
                (this.search as any).sortOrder = order;
            },
        };
    }
}
