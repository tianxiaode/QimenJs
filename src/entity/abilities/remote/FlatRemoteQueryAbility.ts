import type { AbilityDefinition } from '@/composable';

/**
 * FlatRemoteQueryAbility - 远程查询能力
 *
 * 提供过滤、排序、重置等查询操作（不含分页）。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const FlatRemoteQueryAbility = {
    async filter(text: string) {
        this.page = 1;
        (this.search as any).keyword = text;
        return await this._internalList(true);
    },

    async searchBy(search: any) {
        this.search = { ...this.search, ...search };
        return await this._internalList(true);
    },

    async sort(prop: string, order: 'asc' | 'desc' | null) {
        (this.search as any).sortBy = order ? prop : '';
        (this.search as any).sortOrder = order || 'asc';
        this.page = 1;
        return await this._internalList(false);
    },

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

    async reset() {
        this.page = 1;
        this.search = {} as any;
        return await this._internalList(true);
    },
} satisfies AbilityDefinition;
