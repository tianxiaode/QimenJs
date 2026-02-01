import { Ability } from '../../composable';
import {
    IEntity,
    IFlatLocalEntityState,
    ILocalChangeSet,
    ILocalSearchParams,
    IStateLocalMutationAbility,
    StateLocalMutationAbilityName,
} from '../../types';
import { BaseEntityState } from './BaseEntityState';

@Ability(StateLocalMutationAbilityName)
export class FlatLocalEntityState<T extends IEntity, TSearch extends ILocalSearchParams>
    extends BaseEntityState<T, TSearch>
    implements IFlatLocalEntityState<T, TSearch>
{
    isRemote: false = false;
    protected sourceData = new Map<string | number, T>();
    changes: ILocalChangeSet<T> = this.createEmptyChanges();

    async refreshView(): Promise<void> {
        this.loading = true;

        try {
            // 1. 从 Map 仓库提取所有原始数据
            const allData = Array.from(this.sourceData.values());

            // 2. 第一道工序：关键词过滤 (利用 SearchAbility 提供的 matchKeyword)
            // 注意：matchKeyword(i) 内部已经处理了关键词为空返回 true 的逻辑
            let filtered = allData.filter(item => (this as any).matchKeyword(item));

            // 3. 第二道工序：排序处理 (利用 SearchAbility 提供的 applySort)
            this.items = (this as any).applySort(filtered);
        } finally {
            this.loading = false;
        }
    }

    dispose(): void {
        this.sourceData.clear();
        super.dispose();
    }
}

export interface FlatLocalEntityState<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
> extends IStateLocalMutationAbility<T> {}
