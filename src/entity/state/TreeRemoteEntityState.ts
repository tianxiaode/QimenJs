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
        // TODO: 实现视图刷新逻辑
    }
}

export type TreeRemoteEntityStateAbilities =
    ITreeRemoteStateAbility &
    ITreePathAbility &
    ITreeLifecycleAbility &
    ITreeSearchAbility &
    ITreeViewAbility &
    IStateDirtyAbility;
