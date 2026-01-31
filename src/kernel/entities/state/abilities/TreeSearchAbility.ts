import { AbilityBase } from '../../../composable';
import { IEntity, IExposeResult, ITreeSearchParams, ITreeRemoteEntityState } from '../../../types';
import { array } from '@orbitjs/utils';

export class TreeSearchAbility<
    T extends IEntity,
    TSearch extends ITreeSearchParams,
> extends AbilityBase<ITreeRemoteEntityState<T, TSearch>> {
    protected expose(): IExposeResult {
        return {
            applySearchExpansion: () => this.applySearchExpansion(),
            applySort: (list: T[]) => this.applySort(list),
            matchKeyword: (node: T, keyword: string) => this.matchKeyword(node, keyword),
        };
    }

    protected applySearchExpansion(): void {
        const host = this.host;
        const expandedField = host.expandedField;
        const pidField = host.parentIdField;
        const keyword = host.search.keyword!.toLowerCase();

        // 关键：必须按深度降序（从深到浅）
        const sortedNodes = Array.from(host.nodes.values()).sort(
            (a: any, b: any) => (b._depth || 0) - (a._depth || 0)
        );

        const parentIdsToExpand = new Set<string | number>();

        sortedNodes.forEach((node: any) => {
            const id = node.id;
            const pid = node[pidField];

            // 如果我命中了，或者我的孩子命中了（即我在 Set 里）
            if (this.matchKeyword(node, keyword) || parentIdsToExpand.has(id)) {
                node[expandedField] = true;

                // 向上层传导：把父 ID 加入 Set
                if (pid && pid !== host.root) {
                    parentIdsToExpand.add(pid);
                }
            }
        });
    }

    protected applySort(list: T[]): T[] {
        const host = this.host;
        if (!host.search.sortBy || list.length <= 1) return list;

        return array.orderBy(list, [
            {
                by: host.search.sortBy as keyof T,
                order: host.search.order as 'asc' | 'desc',
            },
        ]);
    }

    protected matchKeyword(node: T, keyword: string): boolean {
        const host = this.host;
        if (!keyword) return false;

        const k = keyword.toLowerCase();
        // 使用 some：只要有一个字段匹配就返回 true
        return host.searchFields.some(field => {
            const value = (node as any)[field];
            return typeof value === 'string' && value.toLowerCase().includes(k);
        });
    }
}
