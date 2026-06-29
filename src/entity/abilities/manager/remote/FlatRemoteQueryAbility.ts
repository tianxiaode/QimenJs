import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import { KernelError, KernelErrorCode } from '@/error';

export class FlatRemoteQueryAbility extends AbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        const host = proxy.host;
        const state = host.state;

        return {
            prev: async () => {
                const page = state.page - 1;
                if (state.isValidPage(page)) {
                    state.page = page;
                    return await host.list(false);
                }
                host.logger.warn('Already on the first page, cannot go prev.');
                return [];
            },

            next: async () => {
                const page = state.page + 1;
                if (state.isValidPage(page)) {
                    state.page = page;
                    return await host.list(false);
                }
                host.logger.warn('Already on the last page, cannot go next.');
                return [];
            },

            jump: async (page: number) => {
                if (state.isValidPage(page)) {
                    state.page = page;
                    return await host.list(false);
                }
                host.logger.warn(`Invalid page: ${page}. Options are: ${state.pageSizes}`);
                return [];
            },

            changeSize: async (size: number) => {
                if (!state.pageSizes.includes(size)) {
                    if (host.systemConfig('env') === 'development')
                        throw new KernelError(
                            `Invalid pageSize: ${size}. Options are: ${state.pageSizes}`,
                            KernelErrorCode.INVALID_PAGE_SIZE
                        );
                    host.logger.error(`Invalid pageSize: ${size}. Options are: ${state.pageSizes}`);
                    return [];
                }
                host.state.pageSize = size;
                host.state.page = 1; // 切换分页大小重置页码
                return await host.list(true);
            },

            /** 过滤查询 */
            filter: async (text: string) => {
                state.page = 1; // 过滤时重置页码
                state.filterBy = text;
                return await host.list(true);
            },

            search: async (search: any) => {
                state.searchBy = search;
                return await host.list(true);
            },

            /** 排序 */
            sort: async (prop: string, order: 'asc' | 'desc' | null) => {
                state.sortBy = order ? prop : '';
                state.order = order || 'asc';
                state.page = 1; // 排序时重置页码
                return await host.list(false);
            },

            /** 重置 */
            reset: async () => {
                state.reset(); // 重置分页、过滤、排序
                return await host.list(true); // 重置通常强制刷新
            },
        };
    }
}
