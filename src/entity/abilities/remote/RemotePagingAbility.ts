import type { AbilityDefinition } from '@/composable';
import { KernelError, KernelErrorCode } from '@/error';

/**
 * RemotePagingAbility - 远程分页能力
 *
 * 提供分页导航操作（prev/next/jump/changeSize）。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const RemotePagingAbility = {
    async prev() {
        const page = this.page - 1;
        if (this.isValidPage(page)) {
            this.page = page;
            return await this._internalList(false);
        }
        this.logger.warn('Already on the first page, cannot go prev.');
        return [];
    },

    async next() {
        const page = this.page + 1;
        if (this.isValidPage(page)) {
            this.page = page;
            return await this._internalList(false);
        }
        this.logger.warn('Already on the last page, cannot go next.');
        return [];
    },

    async jump(page: number) {
        if (this.isValidPage(page)) {
            this.page = page;
            return await this._internalList(false);
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
        return await this._internalList(true);
    },
} satisfies AbilityDefinition;
