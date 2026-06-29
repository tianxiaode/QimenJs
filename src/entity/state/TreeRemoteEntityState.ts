import { ComposableBase } from '@/composable';
import type { AbilityConstructor } from '@/composable';
import type { IEntity, ITreeSearchParams } from '@/schema';
import type { ITreeRemoteEntityState, ITreeRemoteStateAbility, ITreePathAbility, ITreeLifecycleAbility, ITreeSearchAbility, ITreeViewAbility, IStateDirtyAbility } from '@/entity/types';
import { BaseEntityState } from './BaseEntityState';
import { TreeRemoteStateAbility } from '@/entity/abilities/manager/remote/TreeRemoteStateAbility';
import { TreePathAbility } from '@/entity/abilities/state/tree/TreePathAbility';
import { TreeLifecycleAbility } from '@/entity/abilities/state/tree/TreeLifecycleAbility';
import { TreeSearchAbility } from '@/entity/abilities/state/tree/TreeSearchAbility';
import { TreeViewAbility } from '@/entity/abilities/state/tree/TreeViewAbility';
import { StateDirtyAbility } from '@/entity/abilities/state/base/StateDirtyAbility';

export class TreeRemoteEntityState<TSearch extends ITreeSearchParams = ITreeSearchParams>
    extends BaseEntityState<TSearch>
    implements ITreeRemoteEntityState<TSearch>
{
    static readonly abilities: readonly AbilityConstructor[] = [
        TreeRemoteStateAbility,
        TreePathAbility,
        TreeLifecycleAbility,
        TreeSearchAbility,
        TreeViewAbility,
        StateDirtyAbility,
    ];

    isRemote: true = true;
    total: number = 0;
    expandedIds: Set<string | number> = new Set();

    refreshView(): void {
        // 默认实现：替换数组引用以触发响应式更新
        // 实际运行时会被 TreeViewAbility 暴露的 refreshView 覆盖，
        // 后者会根据 hierarchy/nodes 重建 items
        this.items = [...this.items];
    }
}

export type TreeRemoteEntityStateAbilities =
    ITreeRemoteStateAbility &
    ITreePathAbility &
    ITreeLifecycleAbility &
    ITreeSearchAbility &
    ITreeViewAbility &
    IStateDirtyAbility;
