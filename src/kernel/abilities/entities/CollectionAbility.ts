import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';

export class CollectionAbility extends AbilityBase<IEntityManagerBase> {
    protected expose(): IExposeResult {
        const { state, logger } = this.host;

        // 使用基类提供的批量注入方法
        return {
            // 每一个属性都通过 get 访问器代理到 state 上
            loading:   { get: () => state.loading },
            isEmpty:   { get: () => state.items.length === 0 },
            hasMore:   { get: () => state.pageIndex < state.pageCount },
            total:     { get: () => state.total },
            items:     { get: () => state.items },
            pageIndex: { get: () => state.pageIndex },
            pageSize:  { get: () => state.pageSize },
        };

    }

}
