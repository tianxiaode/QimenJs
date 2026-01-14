import { debounce } from '@orbitjs/async';
import { AbilityBase } from '../../composable';
import { IEntityManagerBase } from '../../types';

export class LocalListAbility extends AbilityBase<IEntityManagerBase> {
    // 保留你的防抖逻辑
    private debouncedRun = debounce((force: boolean) => this.actualRun(force), 300);

    protected onAttach(): void {
        const { host } = this;
        const state = host.state;

        // 注入 Actions
        Object.assign(host, {
            /**
             * 统一的入口：list 方法
             * 它现在涵盖了：检查源数据 -> (远程同步) -> 本地计算
             */
            list: async (forceRefresh: boolean = false): Promise<any[]> => {
                // 1. 自动同步源数据
                if (state.getSource().length === 0 || forceRefresh) {
                    // 如果你坚持用 list 这个 action 获取远程全量
                    await host.fetch('list', { params: { _all: true } }, (data: any) => {
                        const raw = data.list || data.items || data;
                        state.setSource(raw);
                    });
                }
                // 2. 执行本地管道计算
                return this.execute();
            },

            // 保持你原有的快捷操作
            filter: async (text: string) => {
                state.reset(false);
                state.filter = text;
                return this.debouncedRun(true);
            },

            search: async (criteria: any) => {
                state.reset(false);
                state.criteria = criteria;
                return this.actualRun(true);
            },

            sort: async (key: string, order: any) => {
                state.setSort(key, order);
                return this.debouncedRun(true);
            },

            // 提供给外部手动触发本地处理的方法
            applyLocalProcess: () => this.execute(),
        });
    }

    /**
     * 核心执行器：完全保留你之前的逻辑并优化
     */
    private execute(): any[] {
        const { host } = this;
        const state = host.state;
        let result = [...state.getSource()];

        // 1. 搜索 (优先检查是否有自定义 localSearch)
        if (Object.keys(state.criteria).length > 0) {
            result = host.localSearch
                ? host.localSearch(state.criteria, result)
                : this.defaultSearch(state.criteria, result);
        }

        // 2. 过滤
        if (state.filter) {
            result = host.localFilter
                ? host.localFilter(state.filter, result)
                : this.defaultFilter(state.filter, result);
        }

        // 3. 排序 (利用你之前的 array.sortBy 或内置逻辑)
        if (state.sortBy && state.sortOrder) {
            result = host.localSort
                ? host.localSort(state.sortBy, state.sortOrder, result)
                : this.defaultSort(result, state.sortBy, state.sortOrder);
        }

        // 4. 更新视图 (不分页，直接全量)
        state.updateList(result, result.length);

        host.emit('refreshed', result);
        return result;
    }

    private async actualRun(force: boolean) {
        if (this.host.state.loading) return;
        // 注意：这里统一调用 host.list，确保走同样的同步逻辑
        return this.host.list(force);
    }

    // ... 保留你的 defaultFilter, defaultSearch ...
    private defaultSort(records: any[], key: string, order: string) {
        return [...records].sort((a, b) => {
            const v1 = a[key];
            const v2 = b[key];
            return order === 'desc' ? (v2 > v1 ? 1 : -1) : v1 > v2 ? 1 : -1;
        });
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

    protected onDispose(): void {
        // 彻底取消挂起的防抖任务
        if (this.debouncedRun && (this.debouncedRun as any).cancel) {
            (this.debouncedRun as any).cancel();
        }

        // 3. 清理 host 上的引用，防止内存泄漏
        const { host } = this;
        delete host.list;
        delete host.filter;
        delete host.search;
        delete host.sort;

        host.logger.debug('LocalListAbility disposed and debounce cancelled.');
    }
}
