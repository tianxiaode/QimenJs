import { ComposableBase } from '@/composable';
import type { AbilityConstructor } from '@/composable';
import type { IEntity, IFlatSearchParams } from '@/schema';
import type { IFlatRemoteEntityState, IStateDirtyAbility } from '@/entity/types';
import { BaseEntityState } from './BaseEntityState';
import { StateDirtyAbility } from '@/entity/abilities/state/base/StateDirtyAbility';

export class FlatRemoteEntityState<TSearch extends IFlatSearchParams = IFlatSearchParams>
    extends BaseEntityState<TSearch>
    implements IFlatRemoteEntityState<TSearch>
{
    static readonly abilities: readonly AbilityConstructor[] = [
        StateDirtyAbility,
    ];

    isRemote: true = true;
    total: number = 0;
    page: number = 1;
    pageSize: number = 20;
    pages: number = 0;
    hasMore: boolean = false;

    // 由 StateDirtyAbility 注入
    isDirty!: (currentItem?: IEntity) => boolean;
    startEdit!: (item: IEntity) => void;
    rollbackAll!: () => void;

    edit(item: IEntity): void {
        this.startEdit(item);
    }

    rollback(): void {
        this.rollbackAll();
    }

    refreshView(): void {
        // 替换数组引用以触发响应式更新
        // Remote 场景下 items 由服务端数据直接设置，
        // refreshView 主要用于脏数据回滚后确保视图感知变更
        this.items = [...this.items];
    }
}

export type FlatRemoteEntityStateAbilities = IStateDirtyAbility;
