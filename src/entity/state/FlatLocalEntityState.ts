import { ComposableBase } from '@/composable';
import type { AbilityType } from '@/composable';
import type { IEntity, ILocalSearchParams } from '@/schema';
import type { IFlatLocalEntityState, ILocalChangeSet, IDeletionPlan, IStateLocalMutationAbility, IStateSearchAbility } from '@/entity/types';
import { BaseEntityState } from './BaseEntityState';
import { StateLocalMutationAbility } from '@/entity/abilities/state/mutation/StateLocalMutationAbility';
import { StateSearchAbility } from '@/entity/abilities/state/search/StateSearchAbility';

export class FlatLocalEntityState<TSearch extends ILocalSearchParams = ILocalSearchParams>
    extends BaseEntityState<TSearch>
    implements IFlatLocalEntityState<TSearch>
{
    static readonly abilities: readonly AbilityType[] = [
        StateLocalMutationAbility,
        StateSearchAbility,
    ];

    isRemote: false = false;
    sourceData = new Map<string | number, IEntity>();

    // hasChanges 和 changes 由 StateLocalMutationAbility 提供
    hasChanges!: boolean;
    changes!: ILocalChangeSet;

    async updateData(result: any[]): Promise<void> {
        await (this as any).updateData(result);
    }

    async refreshView(): Promise<void> {
        this.loading = true;

        try {
            // 1. 从 Map 仓库提取所有原始数据
            const allData = Array.from(this.sourceData.values());

            // 2. 第一道工序：关键词过滤 (利用 SearchAbility 提供的 matchKeyword)
            // 注意：matchKeyword(i) 内部已经处理了关键词为空返回 true 的逻辑
            let filtered = allData.filter((item: any) => (this as any).matchKeyword(item));

            // 3. 第二道工序：排序处理 (利用 SearchAbility 提供的 applySort)
            this.items = (this as any).applySort(filtered);
        } finally {
            this.loading = false;
        }
    }

    async addItem(item: IEntity): Promise<void> {
        await (this as any).addItem(item);
    }

    async updateItem(item: IEntity): Promise<void> {
        await (this as any).updateItem(item);
    }

    async softDelete(plan: IDeletionPlan): Promise<void> {
        await (this as any).softDelete(plan);
    }

    getDeletionPlan(ids: (string | number)[]): IDeletionPlan {
        return (this as any).getDeletionPlan(ids);
    }

    async confirmDelete(): Promise<void> {
        await (this as any).confirmDelete();
    }

    async rollbackDelete(): Promise<void> {
        await (this as any).rollbackDelete();
    }

    async clearChanges(): Promise<void> {
        (this as any).clearChanges();
    }

    dispose(): void {
        this.sourceData.clear();
        super.dispose();
    }
}

export type FlatLocalEntityStateAbilities = IStateLocalMutationAbility & IStateSearchAbility;
