"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatRemoteQueryAbility = void 0;
const composable_1 = require("../../../composable");
const EntityError_1 = require("../../../errors/EntityError");
const codes_1 = require("../../../errors/codes");
class FlatRemoteQueryAbility extends composable_1.AbilityBase {
    expose() {
        const { host } = this;
        const { state } = host;
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
            jump: async (page) => {
                if (state.isValidPage(page)) {
                    state.page = page;
                    return await host.list(false);
                }
                host.logger.warn(`Invalid page: ${page}. Options are: ${state.pageSizes}`);
                return [];
            },
            changeSize: async (size) => {
                if (!state.pageSizes.includes(size)) {
                    if (host.systemConfig('env') === 'development')
                        throw new EntityError_1.EntityError(`Invalid pageSize: ${size}. Options are: ${state.pageSizes}`, codes_1.KernelErrorCode.INVALID_PAGE_SIZE);
                    host.logger.error(`Invalid pageSize: ${size}. Options are: ${state.pageSizes}`);
                    return [];
                }
                host.state.pageSize = size;
                host.state.page = 1; // 切换分页大小重置页码
                return await host.list(true);
            },
            /** 过滤查询 */
            filter: async (text) => {
                state.page = 1; // 过滤时重置页码
                state.filterBy = text;
                return await host.list(true);
            },
            search: async (search) => {
                state.searchBy = search;
                return await host.list(true);
            },
            /** 排序 */
            sort: async (prop, order) => {
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
exports.FlatRemoteQueryAbility = FlatRemoteQueryAbility;
//# sourceMappingURL=FlatRemoteQueryAbility.js.map