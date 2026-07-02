import type { AbilityDefinition } from '@/composable';
import { KernelError, KernelErrorCode } from '@/error';

/**
 * FlatRemoteQueryAbility - 远程查询能力
 * 
 * 提供分页导航、过滤、排序等查询操作。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const FlatRemoteQueryAbility: AbilityDefinition = {
    async prev() {
        const page = this.page - 1;
        if (this.isValidPage(page)) {
            this.page = page;
            return await this.list(false);
        }
        this.logger.warn('Already on the first page, cannot go prev.');
        return [];
    },

    async next() {
        const page = this.page + 1;
        if (this.isValidPage(page)) {
            this.page = page;
            return await this.list(false);
        }
        this.logger.warn('Already on the last page, cannot go next.');
        return [];
    },

    async jump(page: number) {
        if (this.isValidPage(page)) {
            this.page = page;
            return await this.list(false);
        }
        this.logger.warn(`Invalid page: ${page}. Options are: ${this.pageSizes}`);
        return [];
    },

    async changeSize(size: number) {
        if (!this.pageSizes.includes(size)) {
            if (this.systemConfig('env') === 'development')
                throw new KernelError(
                    `Invalid pageSize: ${size}. Options are: ${this.pageSizes}`,
                    KernelErrorCode.INVALID_PAGE_SIZE
                );
            this.logger.error(`Invalid pageSize: ${size}. Options are: ${this.pageSizes}`);
            return [];
        }
        this.pageSize = size;
        this.page = 1;
        return await this.list(true);
    },

    /** 过滤查询 */
    async filter(text: string) {
        this.page = 1;
        this.filterBy = text;
        return await this.list(true);
    },

    async search(search: any) {
        this.searchBy = search;
        return await this.list(true);
    },

    /** 排序 */
    async sort(prop: string, order: 'asc' | 'desc' | null) {
        this.sortBy = order ? prop : '';
        this.order = order || 'asc';
        this.page = 1;
        return await this.list(false);
    },

    /** 重置 */
    async reset() {
        this.page = 1;
        this.search = {} as any;
        return await this.list(true);
    },
};
