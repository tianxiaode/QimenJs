import { CollectionState } from "./CollectionState";

export class QueryHelper {
    /**
     * 一体化本地数据处理器
     * 严格遵守：过滤 -> 排序 -> 分页 流程
     */
    static process<T>(items: T[], state: CollectionState<T>): { items: T[], total: number } {
        // 1. 浅拷贝原始数据，避免污染
        let result = [...items];

        // 2. 过滤阶段 (Filter)
        if (state.filter) {
            const search = state.filter.toLowerCase();
            result = result.filter(item => 
                Object.values(item as any).some(val => 
                    String(val).toLowerCase().includes(search)
                )
            );
        }
        
        // 如果有高级条件 (Criteria)，也在这里过滤
        if (state.criteria && Object.keys(state.criteria).length > 0) {
            // 实现具体条件过滤逻辑...
        }

        const total = result.length;

        // 3. 排序阶段 (Sort)
        if (state.sortBy && state.sortOrder) {
            const { sortBy, sortOrder } = state;
            result.sort((a: any, b: any) => {
                const valA = a[sortBy];
                const valB = b[sortBy];
                if (valA === valB) return 0;
                const res = valA > valB ? 1 : -1;
                return sortOrder === 'asc' ? res : -res;
            });
        }

        // 4. 分页阶段 (Paginate)
        const start = (state.pageIndex - 1) * state.pageSize;
        const end = start + state.pageSize;
        const pagedList = result.slice(start, end);

        return { items: pagedList, total };
    }
}