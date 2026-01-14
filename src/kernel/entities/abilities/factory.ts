import { IReadonlyEntityManager } from '../../types';
import { PaginationAbility } from './page';
import { CollectionState } from './CollectionState';
import { LocalCollectionAbility } from './sort-order';

export class AbilityFactory {
    /**
     * 将分页、过滤、排序等能力一键挂载到 EM 实例上
     */
    static attach<T, TC>(em: IReadonlyEntityManager<T, TC>) {
        // 1. 创建原子能力实例
        const state = new CollectionState<T, TC>(
            em.domain,
            em.logger,
            em.env,
            em._pageSize,
            em._pageSizes,
            em.useLocalSearch
        );
        em.state = state;
        const refreshFn = (force: boolean) => em.refresh(force);
        const localAbility = new LocalCollectionAbility(state, em);
        Object.assign(em, localAbility.getActions());
        const abilities: any = { $localAbility: localAbility, $state: state } as any;
        // 2. 将能力方法直接对接到 EM 实例上（即你想要的“映射”）
        // 这样 UI 依然可以 em.search()
        if (!em.localSearch) {
            const paginator = new PaginationAbility(state, refreshFn, em.logger, em.env);
            Object.assign(em, {
                // 分页
                page: paginator.page.bind(paginator),
                pageSize: paginator.pageSize.bind(paginator),
                pageCount: paginator.pageCount.bind(paginator),
                jump: paginator.jump.bind(paginator),
                next: paginator.next.bind(paginator),
                prev: paginator.prev.bind(paginator),
                changeSize: paginator.changeSize.bind(paginator),
            });
            abilities['$page'] = paginator;
        }
        Object.assign(em, abilities);

        // 统一映射视图状态（只读）
        const viewProps = {
            loading: () => state.loading,
            isEmpty: () => state.items.length === 0,
            // 只有在非本地搜索且有分页时 hasMore 才有意义
            hasMore: () => state.pageIndex < state.pageCount,
            total: () => state.total,
            items: () => state.items,
        };

        Object.keys(viewProps).forEach(key => {
            Object.defineProperty(em, key, {
                get: viewProps[key as keyof typeof viewProps],
                enumerable: true,
                configurable: true,
            });
        });
    }
}
