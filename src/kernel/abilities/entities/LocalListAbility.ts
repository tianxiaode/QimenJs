import { debounce } from '@orbitjs/async';
import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';

/**
 * LocalListAbility - 本地列表能力
 * 
 * 提供本地列表操作功能，包括过滤、搜索、排序等
 * 
 * @template T 实体类型
 * @template TCriteria 搜索条件类型
 */
export class LocalListAbility<T, TCriteria> extends AbilityBase<IEntityManagerBase> {
    // 保留你的防抖逻辑
    private debouncedRun = debounce((force: boolean) => this.actualRun(force), 300);

    /**
     * 暴露列表操作相关的方法
     * 
     * @returns 包含列表操作方法的对象，如list、filter、search、sort等
     */
    protected expose(): IExposeResult {
        const { host } = this;
        const state = host.state;

        // 注入 Actions
        return {
            /**
             * 统一的入口：list 方法
             * 它现在涵盖了：检查源数据 -> (远程同步) -> 本地计算
             * 
             * @param forceRefresh 是否强制刷新，默认为false
             * @returns Promise<T[]> 返回实体数组的Promise
             */
            list: async (forceRefresh: boolean = false): Promise<T[]> => {
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
            /**
             * 过滤列表数据
             * 
             * @param text 过滤文本
             * @returns Promise<void>
             */
            filter: async (text: string) => {
                state.reset(false);
                state.filter = text;
                return this.debouncedRun(true);
            },

            /**
             * 搜索列表数据
             * 
             * @param criteria 搜索条件
             * @returns Promise<void>
             */
            search: async (criteria: Partial<TCriteria>) => {
                state.reset(false);
                state.search = criteria;
                return this.actualRun(true);
            },

            /**
             * 排序列表数据
             * 
             * @param key 排序字段
             * @param order 排序方向
             * @returns Promise<void>
             */
            sort: async (key: string, order: any) => {
                state.setSort(key, order);
                return this.debouncedRun(true);
            },

            // 提供给外部手动触发本地处理的方法
            /**
             * 应用本地处理
             * 
             * @returns 处理后的实体数组
             */
            applyLocalProcess: () => this.execute(),
        };
    }

    /**
     * 核心执行器：完全保留你之前的逻辑并优化
     * 
     * @returns 处理后的实体数组
     */
    private execute(): T[] {
        const { host } = this;
        const state = host.state;
        let result = [...state.getSource()];

        const keys = (host as any).getKeys?.() || { id: 'id' };

        // 1. 搜索 (优先检查是否有自定义 localSearch)
        if (Object.keys(state.search).length > 0) {
            result = host.localSearch
                ? host.localSearch(state.search, result)
                : this.defaultSearch(state.search, result);
        }

        // 2. 过滤
        if (state.filter) {
            const filterKeys = host.schemaFilters || [];
            result = host.localFilter
                ? host.localFilter(state.filter, result)
                : this.defaultFilter(state.filter, result, filterKeys);
        }

        // 3. 排序 (利用你之前的 array.sortBy 或内置逻辑)
        if (state.sortBy && state.sortOrder) {
            const sortBy = state.sortBy || host.sechemaSort.prop || keys.id;
            const sortOrder = state.sortOrder || host.sechemaSort.order || 'desc';
            result = host.localSort
                ? host.localSort(sortBy, sortOrder, result)
                : this.defaultSort(result, sortBy, sortOrder);
        }

        // 4. 更新视图 (不分页，直接全量)
        state.updateList(result, result.length);

        host.emit('refreshed', result);
        return result;
    }

    /**
     * 实际运行方法
     * 
     * @param force 是否强制执行
     * @returns Promise<void>
     */
    private async actualRun(force: boolean) {
        if (this.host.state.loading) return;
        // 注意：这里统一调用 host.list，确保走同样的同步逻辑
        return this.host.list(force);
    }

    // ... 保留你的 defaultFilter, defaultSearch ...
    /**
     * 默认排序方法
     * 
     * @param records 待排序的记录数组
     * @param key 排序字段
     * @param order 排序方向
     * @returns 排序后的记录数组
     */
    private defaultSort(records: any[], key: string, order: string) {
        // 提前获取语言环境（可以从 SystemAbility 获取，或者默认 'zh-CN'）
        const locale = (this.host as any).getSystemValue?.('locale') || 'zh-CN';

        return [...records].sort((a, b) => {
            const v1 = a[key];
            const v2 = b[key];

            // 1. 处理相等或空值情况
            if (v1 === v2) return 0;
            if (v1 === null || v1 === undefined) return 1;
            if (v2 === null || v2 === undefined) return -1;

            let res = 0;

            // 2. 根据类型选择比较方式
            if (typeof v1 === 'string' && typeof v2 === 'string') {
                // 使用 localeCompare 处理多语言字符串（支持拼音排序）
                // numeric: true 确保 "2" < "10"
                res = v1.localeCompare(v2, locale, { numeric: true, sensitivity: 'accent' });
            } else {
                // 数值或其他类型保持原始比较
                res = v1 > v2 ? 1 : -1;
            }

            return order === 'desc' ? -res : res;
        });
    }

    /**
     * 默认模糊过滤：在所有字符串字段中查找
     * 
     * @template T 被过滤的记录类型
     * @param text 过滤文本
     * @param records 待过滤的记录数组
     * @param limitKeys 限制搜索的字段
     * @returns 过滤后的记录数组
     */
    private defaultFilter<T>(text: string, records: T[], limitKeys: string[]): T[] {
        const query = text.toLowerCase().trim();
        if (!query) return records;

        return records.filter(item => {
            // 如果有 limitKeys，只遍历指定键；否则全量遍历
            const targetValues =
                limitKeys.length > 0
                    ? limitKeys.map(k => (item as any)[k])
                    : Object.values(item as any);

            return targetValues.some(val =>
                String(val ?? '')
                    .toLowerCase()
                    .includes(query)
            );
        });
    }

    /**
     * 默认结构化搜索：精确匹配 criteria 中的每个 key
     * 
     * @template T 记录类型
     * @template TCriteria 搜索条件类型
     * @param criteria 搜索条件
     * @param records 待搜索的记录数组
     * @returns 搜索后的记录数组
     */
    private defaultSearch<T, TCriteria>(criteria: Partial<TCriteria>, records: T[]): T[] {
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

    /**
     * 在能力被释放时清理资源
     */
    protected onDispose(): void {
        // 彻底取消挂起的防抖任务
        if (this.debouncedRun && (this.debouncedRun as any).cancel) {
            (this.debouncedRun as any).cancel();
        }
        this.host.logger.debug('LocalListAbility disposed and debounce cancelled.');
    }
}