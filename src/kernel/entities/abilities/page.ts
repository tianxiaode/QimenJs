import { AbilityBase } from "./base";

export class PaginationAbility<T,TC> extends AbilityBase<T, TC> {

    page(): number {
        return this.state.pageIndex;
    }

    pageSize(): number {
        return this.state.pageSize;
    }

    pageCount(): number {
        return this.state.pageCount;
    }

    /**
     * 上一页
     */
    async prev(): Promise<T[]> {
        if (this.state.pageIndex > 1) {
            return await this.jump(this.state.pageIndex - 1);
        } else {
            this.logger.warn('Already on the first page, cannot go prev.');
            return [];
        }
    }    

    async next(): Promise<T[]> {
        if (this.state.pageIndex < this.state.maxPage) {
            return await this.jump(this.state.pageIndex + 1);
        } else {
            this.logger.warn('Already on the last page, cannot go next.');
            return [];
        }
    }

    async jump(page: number): Promise<T[]> {
        this.state.pageIndex = this.state.getValidPage(page);
        return await this.reload(true);
    }

    async changeSize(size: number): Promise<T[]> {
        // 1. 校验 size 是否在 pageSizeOptions 中（之前讨论过的安全校验）
        if (!this.state.pageSizes.includes(size)) {
            this.logger.error(
                `Invalid pageSize: ${size}. Options are: ${this.state.pageSizes}`
            );
            if (this.env === 'development') throw new Error('Invalid pageSize');
            return [];
        }

        // 2. 只有当值真的改变时才处理
        if (this.state.pageSize !== size) {
            this.state.pageSize = size;
            this.state.pageIndex = 1; // 关键：重置回第一页

            this.logger.debug(`PageSize changed to ${size}, resetting to page 1`);

            // 3. 改变 size 后通常需要立即重新加载数据
            return await this.reload(true);
        }
        return [];
    }    
}
