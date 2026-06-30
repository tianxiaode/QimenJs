import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import { KernelError, KernelErrorCode } from '@/error';

export class FlatRemoteQueryAbility extends AbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        // 注意：不能在 expose() 函数体中直接访问 proxy.host（此时 proxy.host 尚未设置）
        // 必须在返回的方法闭包内部访问 proxy.host
        return {
            prev: async () => {
                const host = proxy.host;
                const state = host.state;
                const page = state.page - 1;
                if (state.isValidPage(page)) {
                    state.page = page;
                    return await host.list(false);
                }
                host.logger.warn('Already on the first page, cannot go prev.');
                return [];
            },

            next: async () => {
                const host = proxy.host;
                const state = host.state;
                const page = state.page + 1;
                if (state.isValidPage(page)) {
                    state.page = page;
                    return await host.list(false);
                }
                host.logger.warn('Already on the last page, cannot go next.');
                return [];
            },

            jump: async (page: number) => {
                const host = proxy.host;
                const state = host.state;
                if (state.isValidPage(page)) {
                    state.page = page;
                    return await host.list(false);
                }
                host.logger.warn(`Invalid page: ${page}. Options are: ${state.pageSizes}`);
                return [];
            },

            changeSize: async (size: number) => {
                const host = proxy.host;
                const state = host.state;
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
                const host = proxy.host;
                const state = host.state;
                state.page = 1; // 过滤时重置页码
                state.filterBy = text;
                return await host.list(true);
            },

            search: async (search: any) => {
                const host = proxy.host;
                const state = host.state;
                state.searchBy = search;
                return await host.list(true);
            },

            /** 排序 */
            sort: async (prop: string, order: 'asc' | 'desc' | null) => {
                const host = proxy.host;
                const state = host.state;
                state.sortBy = order ? prop : '';
                state.order = order || 'asc';
                state.page = 1; // 排序时重置页码
                return await host.list(false);
            },

            /** 重置 */
            reset: async () => {
                const host = proxy.host;
                const state = host.state;
                state.reset(); // 重置分页、过滤、排序
                return await host.list(true); // 重置通常强制刷新
            },
        };
    }
}
