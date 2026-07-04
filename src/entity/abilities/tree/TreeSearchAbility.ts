import type { AbilityDefinition } from '@/composable';
import type { IEntity } from '@/schema';
import { array } from '@orbit-js/utils';

/**
 * TreeSearchAbility - 树搜索能力
 * 
 * 为宿主提供树形结构的搜索和排序功能。
 * this 指向宿主（TreeRemoteEntityState），this.nodes/hierarchy/searchFields/search 可直接访问。
 */
export const TreeSearchAbility: AbilityDefinition = {
    applySearchExpansion() {
        const expandedField = this.expandedField;
        const pidField = this.parentIdField;
        const keyword = this.search.keyword!.toLowerCase();

        const sortedNodes = Array.from(this.nodes.values()).sort(
            (a: any, b: any) => (b._depth || 0) - (a._depth || 0)
        );

        const parentIdsToExpand = new Set<string | number>();

        sortedNodes.forEach((node: any) => {
            const id = node.id;
            const pid = node[pidField];

            if (this.matchKeyword(node, keyword) || parentIdsToExpand.has(id)) {
                node[expandedField] = true;

                if (pid && pid !== this.root) {
                    parentIdsToExpand.add(pid);
                }
            }
        });
    },

    applySort(list: IEntity[]): IEntity[] {
        if (!this.search.sortBy || list.length <= 1) return list;

        return array.orderBy(list, [
            {
                by: this.search.sortBy as keyof IEntity,
                order: this.search.order as 'asc' | 'desc',
            },
        ]);
    },

    matchKeyword(node: IEntity, keyword: string): boolean {
        if (!keyword) return false;

        const k = keyword.toLowerCase();
        return this.searchFields.some((field: string) => {
            const value = (node as any)[field];
            return typeof value === 'string' && value.toLowerCase().includes(k);
        });
    },
};
