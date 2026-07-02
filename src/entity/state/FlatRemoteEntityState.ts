import { ComposableBase } from '@/composable';
import type { AbilityDefinition } from '@/composable';
import type { IEntity, IFlatSearchParams } from '@/schema';
import type { IFlatRemoteEntityState, IStateDirtyAbility } from '@/entity/types';
import { BaseEntityState } from './BaseEntityState';
import { StateDirtyAbility } from '@/entity/abilities/state/base/StateDirtyAbility';
import { StateSearchAbility } from '@/entity/abilities/state/search/StateSearchAbility';

export class FlatRemoteEntityState<TSearch extends IFlatSearchParams = IFlatSearchParams>
    extends BaseEntityState<TSearch>
    implements IFlatRemoteEntityState<TSearch>
{
    static readonly abilities: readonly AbilityDefinition[] = [
        StateDirtyAbility,
        StateSearchAbility,
    ];

    isRemote: true = true;
    total: number = 0;
    page: number = 1;
    pageSize: number = 20;
    pages: number = 0;
    hasMore: boolean = false;
    pageSizes: number[] = [10, 20, 50];

    // 由 StateDirtyAbility 注入
    isDirty!: (currentItem?: IEntity) => boolean;
    startEdit!: (item: IEntity) => void;
    rollbackAll!: () => void;

    // 由 StateSearchAbility 注入
    toParams!: () => Record<string, any>;

    edit(item: IEntity): void {
        this.startEdit(item);
    }

    rollback(): void {
        this.rollbackAll();
    }

    /**
     * 更新列表数据和分页信息
     */
    updateData(list: any[], total?: number): void {
        this.items = list || [];
        this.total = typeof total === 'number' ? total : this.items.length;
        this.pages = Math.ceil(this.total / this.pageSize) || 0;
        this.hasMore = this.page < this.pages;
    }

    /**
     * 更新单个实体
     */
    updateItem(item: any): void {
        if (!item) return;
        this.item = item;
        // 同步到 items 列表
        const index = this.items.findIndex((i: any) => i.id === item.id);
        if (index >= 0) {
            this.items[index] = item;
        }
    }

    /**
     * 验证页码是否有效
     */
    isValidPage(page: number): boolean {
        return page >= 1 && page <= this.pages;
    }

    refreshView(): void {
        // 替换数组引用以触发响应式更新
        // Remote 场景下 items 由服务端数据直接设置，
        // refreshView 主要用于脏数据回滚后确保视图感知变更
        this.items = [...this.items];
    }
}

export type FlatRemoteEntityStateAbilities = IStateDirtyAbility;
