import { FilterAbility, LocalFilterAbility } from './filter';
import { PaginationAbility } from './page';
import { LocalSortAbility, SortAbility } from './sort';
import { CollectionState } from './state';

export class AbilityFactory {
    /**
     * 将分页、过滤、排序等能力一键挂载到 EM 实例上
     */
    static attach(em: any) {
        // 1. 创建原子能力实例
        const state = new CollectionState();
        em.state = state;
        const refreshFn = (force: boolean) => em.refresh(force);
        const paginator = new PaginationAbility(state, refreshFn, em.logger, em.env);
        let filterer, sorter;

        if (em.useLocalSearch) {
            // 注入“本地算法版”能力，它们不需要 reload() 触发网络，而是触发本地 applyLocalProcess
            filterer = new LocalFilterAbility(state,refreshFn, em.logger, em.env,);
            sorter = new LocalSortAbility(state, refreshFn, em.logger, em.env);
        } else {
            // 注入“远程对接版”能力
            filterer = new FilterAbility(state, refreshFn, em.logger, em.env);
            sorter = new SortAbility(state, refreshFn, em.logger, em.env);
        }
        // 2. 将能力方法直接对接到 EM 实例上（即你想要的“映射”）
        // 这样 UI 依然可以 em.search()
        Object.assign(em, {
            // 分页
            total: paginator.total.bind(paginator),
            page: paginator.page.bind(paginator),
            pageSize: paginator.pageSize.bind(paginator),
            pageCount: paginator.pageCount.bind(paginator),
            jump: paginator.jump.bind(paginator),
            next: paginator.next.bind(paginator),
            prev: paginator.prev.bind(paginator),
            changeSize: paginator.changeSize.bind(paginator),

            // 过滤与搜索
            search: filterer.search.bind(filterer),
            filter: filterer.filter.bind(filterer),

            // 排序
            sort: sorter.sort.bind(sorter),

            // 方便 UI 访问底层能力对象（可选）
            $state: state,
            $paginator: paginator,
            $filterer: filterer,
            $sorter: sorter,
        });
    }
}
