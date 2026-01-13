import { ILogger } from '@orbitjs/logger';
import { AbilityBase } from './base';
import { CollectionState } from './state';
import { EnvType } from '@orbitjs/registry';
import { array } from '@orbitjs/utils';

export class SortAbility<T, TC> extends AbilityBase<T, TC> {
    async sort(key: string, order: any) {
        this.logger.debug(`Sorting by ${key} ${order}`);
        this.state.setSort(key, order);
        await this.reload(true);
    }
}

export class LocalSortAbility<T, TC> extends AbilityBase<T, TC> {
    constructor(
        protected state: CollectionState<T, TC>,
        protected reload: (force: boolean) => Promise<T[]>,
        protected logger: ILogger,
        protected env: EnvType,
        protected sortFn?: (state: CollectionState<T, TC>) => T[]
    ) {
        super(state, reload, logger, env);
    }

    async sort(key: string, order: 'asc' | 'desc' | null): Promise<T[]> {
        // 1. 更新状态
        this.state.sortBy = key;
        this.state.sortOrder = order;
        this.state.pageIndex = 1;

        // 2. 优先执行自定义排序钩子
        if (this.sortFn) {
            return this.sortFn(this.state);
        }

        // 3. 默认逻辑：使用你的 utils 的 orderBy
        const fullData = this.state.items;
        let result = [...fullData];

        if (this.state.sortBy && this.state.sortOrder) {
            result = array.orderBy(result, [
                {
                    key: this.state.sortBy as keyof T,
                    order: this.state.sortOrder,
                },
            ]);
        }

        // 4. 执行本地分页切片
        const total = result.length;
        const start = (this.state.pageIndex - 1) * this.state.pageSize;
        const pagedItems = result.slice(start, start + this.state.pageSize);

        // 5. 副作用：通知 EM 更新 items 和 total (用于 UI 绑定)
        this.onResult(pagedItems, total);

        return pagedItems;
    }
}
