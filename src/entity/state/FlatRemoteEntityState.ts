import { ComposableBase } from '@/composable';
import type { AbilityConstructor } from '@/composable';
import type { IEntity, IFlatSearchParams } from '@/schema';
import type { IFlatRemoteEntityState } from '@/entity/types';
import { BaseEntityState } from './BaseEntityState';
import { FlatRemoteStateAbility } from '@/entity/abilities/remote/FlatRemoteStateAbility';
import { StateDirtyAbility } from '@/entity/abilities/state/StateDirtyAbility';

export class FlatRemoteEntityState<T extends IEntity, TSearch extends IFlatSearchParams>
    extends BaseEntityState<T, TSearch>
    implements IFlatRemoteEntityState<T, TSearch>
{
    static readonly abilities: readonly AbilityConstructor[] = [
        FlatRemoteStateAbility,
        StateDirtyAbility,
    ];

    isRemote: true = true;
    total: number = 0;
    page: number = 1;
    pageSize: number = 20;
    pages: number = 0;
    hasMore: boolean = false;

    isDirty(currentItem?: T): boolean {
        return (this as any).isDirty(currentItem);
    }

    edit(item: T): void {
        (this as any).startEdit(item);
    }

    rollback(): void {
        (this as any).rollbackAll();
    }

    refreshView(): void {
        // TODO: 实现视图刷新逻辑
    }
}

