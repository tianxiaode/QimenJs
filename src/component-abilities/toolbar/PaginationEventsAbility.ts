/**
 * PaginationEventsAbility 分页事件分发能力
 *
 * 提供分页操作方法，统一事件发射。
 * 从 PaginationAbility 拆分而来，职责单一：只管操作和事件，不管状态存储和渲染。
 *
 * 操作方法：
 * - gotoPage(page): 跳转到指定页
 * - prevPage(): 上一页
 * - nextPage(): 下一页
 * - firstPage(): 首页
 * - lastPage(): 末页
 * - changeSize(size): 修改每页条数
 *
 * 事件：
 * - PAGINATION_EVENTS.CHANGE: 分页变更，数据格式 { page, pageSize }
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PAGINATION_EVENTS } from '@qimenjs/events';

export const PaginationEventsAbility: AbilityDefinition = {
    /**
     * 跳转到指定页
     *
     * 校验页码范围，更新 currentPage，发射 pagechange 事件。
     * 事件去重：currentPage 未变且 pageSize 未变时不发射。
     */
    gotoPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        const oldPage = this.currentPage;
        const oldSize = this.pageSize;
        this.currentPage = page;
        // 事件去重：页码和每页条数都未变时不发射
        if (this.currentPage === oldPage && this.pageSize === oldSize) return;
        this.emit?.(PAGINATION_EVENTS.CHANGE, { page: this.currentPage, pageSize: this.pageSize });
    },

    /**
     * 上一页
     */
    prevPage(): void {
        this.gotoPage(this.currentPage - 1);
    },

    /**
     * 下一页
     */
    nextPage(): void {
        this.gotoPage(this.currentPage + 1);
    },

    /**
     * 首页
     */
    firstPage(): void {
        this.gotoPage(1);
    },

    /**
     * 末页
     */
    lastPage(): void {
        this.gotoPage(this.totalPages);
    },

    /**
     * 修改每页条数
     *
     * 校验 pageSizes，更新 pageSize + 重置 currentPage=1，发射 pagechange 事件。
     */
    changeSize(size: number): void {
        const sizes = this.pageSizes;
        if (!sizes || !sizes.includes(size)) return;
        this.pageSize = size;
        this.currentPage = 1;
        this.emit?.(PAGINATION_EVENTS.CHANGE, { page: 1, pageSize: size });
    },
};
