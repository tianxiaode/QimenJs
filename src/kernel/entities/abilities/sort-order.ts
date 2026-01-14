import { debounce } from '@orbitjs/async';
import { array } from '@orbitjs/utils';
import { CollectionState } from './CollectionState';

export class LocalCollectionAbility<T, TC> {
    private debouncedRun = debounce((force: boolean) => this.actualRun(force), 300);

    constructor(
        private state: CollectionState<T, TC>,
        private em: any
    ) {}

    /**
     * 内部核心执行器：Source -> Filter -> Search -> Sort -> Pagination
     */
    public execute(): T[] {
        let result = [...this.state.getSource()];

        // 1. 搜索
        if (Object.keys(this.state.criteria).length > 0) {
            result = this.em.localSearch
                ? this.em.localSearch(this.state.criteria, result)
                : this.defaultSearch(this.state.criteria, result);
        }

        // 2. 过滤
        if (this.state.filter) {
            result = this.em.localFilter
                ? this.em.localFilter(this.state.filter, result)
                : this.defaultFilter(this.state.filter, result);
        }

        // 3. 排序
        if (this.state.sortBy && this.state.sortOrder) {
            result = this.em.localSort
                ? this.em.localSort(this.state.sortBy, this.state.sortOrder, result)
                : array.sortBy(result, this.state.sortBy as any, this.state.sortOrder);
        }

        // 4. 【关键点】不分页：直接把过滤排序后的结果塞给 state
        // 这样 UI 绑定 em.state.items 就能拿到全量符合条件的数据
        this.state.updateList(result, result.length);

        this.em.emit('refreshed', result);

        // 如果你希望兼容之前的逻辑，可以保留 data-updated
        this.em.emit('data-updated', {
            action: 'local-process',
            items: result,
            total: result.length,
        });

        return result;
    }

    /**
     * 获取对外对接的 Action 集合
     */
    public getActions() {
        return {
            filter: async (text: string) => {
                this.state.reset(false);
                this.state.filter = text;
                return this.debouncedRun(true);
            },
            search: async (criteria: Partial<TC>) => {
                this.state.reset(false);
                this.state.criteria = criteria;
                if (this.state.loading) return;
                return this.actualRun(true);
            },
            sort: async (key: string, order: any) => {
                this.state.setSort(key, order);
                return this.debouncedRun(true);;
            },
            applyLocalProcess: () => this.execute(),
        };
    }

    private async actualRun(force: boolean) {
        // 1. 状态锁：如果已经在 loading（请求中），则直接拦截猛点
        if (this.state.loading) {
            return;
        }

        // 2. 执行核心逻辑（本地算或远程拿）
        return this.em.useLocalSearch ? this.execute() : this.em.refresh(force);
    }

    /**
     * 默认模糊过滤：在所有字符串字段中查找
     */
    private defaultFilter<T>(text: string, records: T[]): T[] {
        const query = text.toLowerCase().trim();
        if (!query) return records;

        return records.filter(item => {
            // 简单的深度遍历或转 JSON 匹配，适合小规模本地数据
            return Object.values(item as any).some(val =>
                String(val).toLowerCase().includes(query)
            );
        });
    }

    /**
     * 默认结构化搜索：精确匹配 criteria 中的每个 key
     */
    private defaultSearch<T, TC>(criteria: Partial<TC>, records: T[]): T[] {
        const entries = Object.entries(criteria).filter(([_, v]) => v !== undefined && v !== '');
        if (entries.length === 0) return records;

        return records.filter(item => {
            return entries.every(([key, value]) => {
                const itemValue = (item as any)[key];
                // 默认逻辑：如果值相等或者是包含关系（针对数组）
                if (Array.isArray(itemValue)) {
                    return itemValue.includes(value);
                }
                return itemValue === value;
            });
        });
    }
}
