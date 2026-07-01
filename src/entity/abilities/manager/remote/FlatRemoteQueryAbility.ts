import type { AbilityDefinition } from '@/composable';
import { KernelError, KernelErrorCode } from '@/error';

/**
 * FlatRemoteQueryAbility - 远程查询能力
 * 
 * 提供分页导航、过滤、排序等查询操作。
 * this 指向宿主（Manager），this.state 可直接访问。
 */
export const FlatRemoteQueryAbility: AbilityDefinition = {
    async prev() {
        const state = this.state;
        const page = state.page - 1;
        if (state.isValidPage(page)) {
            state.page = page;
            return await this.list(false);
        }
        this.logger.warn('Already on the first page, cannot go prev.');
        return [];
    },

    async next() {
        const state = this.state;
        const page = state.page + 1;
        if (state.isValidPage(page)) {
            state.page = page;
            return await this.list(false);
        }
        this.logger.warn('Already on the last page, cannot go next.');
        return [];
    },

    async jump(page: number) {
        const state = this.state;
        if (state.isValidPage(page)) {
            state.page = page;
            return await this.list(false);
        }
        this.logger.warn(`Invalid page: ${page}. Options are: ${state.pageSizes}`);
        return [];
    },

    async changeSize(size: number) {
        const state = this.state;
        if (!state.pageSizes.includes(size)) {
            if (this.systemConfig('env') === 'development')
                throw new KernelError(
                    `Invalid pageSize: ${size}. Options are: ${state.pageSizes}`,
                    KernelErrorCode.INVALID_PAGE_SIZE
                );
            this.logger.error(`Invalid pageSize: ${size}. Options are: ${state.pageSizes}`);
            return [];
        }
        this.state.pageSize = size;
        this.state.page = 1;
        return await this.list(true);
    },

    /** 过滤查询 */
    async filter(text: string) {
        const state = this.state;
        state.page = 1;
        state.filterBy = text;
        return await this.list(true);
    },

    async search(search: any) {
        const state = this.state;
        state.searchBy = search;
        return await this.list(true);
    },

    /** 排序 */
    async sort(prop: string, order: 'asc' | 'desc' | null) {
        const state = this.state;
        state.sortBy = order ? prop : '';
        state.order = order || 'asc';
        state.page = 1;
        return await this.list(false);
    },

    /** 重置 */
    async reset() {
        const state = this.state;
        state.reset();
        return await this.list(true);
    },
};
