import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';
import { EntityError } from '../../errors/EntityError';
import { KernelErrorCode } from '../../errors/codes';

export class RemoteQueryAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    protected expose(): IExposeResult {
        const { host } = this;
        const { state } = host;

        // 获取执行函数，这里建议做个兼容判断
        const runList = (force: boolean = false) => {
            if (typeof (host as any).list === 'function') {
                return (host as any).list(force);
            }
        };

        return {
            prev: () => {
                if (state.pageIndex > 1) {
                    return host.jump(state.pageIndex - 1);
                } else {
                    host.logger.warn('Already on the first page, cannot go prev.');
                    return Promise.resolve([]);
                }
            },

            next: () => {
                if (state.pageIndex < state.pageCount) {
                    return host.jump(state.pageIndex + 1);
                } else {
                    host.logger.warn('Already on the last page, cannot go next.');
                    return Promise.resolve([]);
                }
            },

            jump: (page: number) => {
                if (host.state.pageIndex === page) return;
                host.state.pageIndex = page;
                return runList(false);
            },

            changeSize: (size: number) => {
                if (!state.pageSizes.includes(size)) {
                    host.logger.error(`Invalid pageSize: ${size}. Options are: ${state.pageSizes}`);
                }
                if (host.systemConfig('env') === 'development')
                    throw new EntityError(`Invalid pageSize: ${size}. Options are: ${state.pageSizes}`, KernelErrorCode.INVALID_PAGE_SIZE);
                host.state.pageSize = size;
                host.state.pageIndex = 1; // 切换分页大小重置页码
                return runList(false);
            },

            /** 过滤查询 */
            filter: (text: string) => {
                state.reset(false); // 过滤时重置分页、排序
                state.filter = text;
                return runList(false);
            },

            search: (criteria: Partial<TC>) => {
                state.reset(false); // 过滤时重置分页、排序
                state.criteria = criteria;
                return runList(false);
            },

            /** 排序 */
            sort: (prop: string, order: 'asc' | 'desc' | null) => {
                host.state.sortBy = prop;
                host.state.sortOrder = order;
                return runList(false);
            },

            refresh: () => {
                return runList(true);
            },

            /** 重置 */
            reset: () => {
                state.reset(true); // 重置分页、过滤、排序
                return runList(true); // 重置通常强制刷新
            },
        };
    }
}