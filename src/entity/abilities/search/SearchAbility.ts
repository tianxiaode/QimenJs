import type { AbilityDefinition } from '@/composable';
import { array } from '@qimenjs/utils';

/**
 * SearchAbility - 搜索过滤能力
 *
 * 为宿主提供搜索、过滤、排序功能。
 * this 指向宿主（Manager），this.schema/search 可直接访问。
 */
export const SearchAbility: AbilityDefinition = {
    toParams(): Record<string, any> {
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
            params.page = this.page || 1;
            params.pageSize = this.pageSize || 20;
        } else {
            params.parentId = params.parentId || this.root || null;
        }

        return params;
    },

    filter(text: string) {
        (this.search as any).keyword = text;
    },

    searchBy(search: any) {
        this.search = { ...this.search, ...search };
    },

    matchKeyword(item: any): boolean {
        const searchFields = this.schema.searchFields || [];
        const keyword = (this.search as any).keyword;
        if (!keyword) return true;

        const k = keyword.toLowerCase();
        return searchFields.some((field: any) => {
            const value = item[field];
            return typeof value === 'string' && value.toLowerCase().includes(k);
        });
    },

    applySort(list: any[]): any[] {
        const { sortBy, sortOrder } = (this.search as any) || {};

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

    sort(field: string, order: 'asc' | 'desc' = 'asc') {
        (this.search as any).sortBy = field;
        (this.search as any).sortOrder = order;
    },
};
