/**
 * PaginationInfoAbility 分页信息展示能力
 *
 * 渲染分页信息文本，格式如 "1-10 / 95"。
 * 从 PaginationAbility 拆分而来，职责单一：只管分页信息渲染。
 *
 * 功能：
 * - 显示当前数据范围和总记录数
 * - 受 showPageInfo 配置控制，默认 true
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PAGINATION_POSITIONS } from './pagination-positions';

export const PaginationInfoAbility: AbilityDefinition = {
    /**
     * 渲染分页信息到 DocumentFragment
     */
    renderPaginationInfo(frag: DocumentFragment): void {
        if (!this.showPageInfo) return;

        const infoEl = document.createElement('span');
        infoEl.className = 'q-pagination__info';
        infoEl.setAttribute('data-pagination', 'info');
        infoEl.setAttribute('data-position', String(PAGINATION_POSITIONS.INFO));

        const totalRecords = this.totalRecords || 0;
        const pageSize = this.pageSize || 10;
        const currentPage = this.currentPage || 1;

        let start: number;
        let end: number;

        if (totalRecords === 0) {
            start = 0;
            end = 0;
        } else {
            start = (currentPage - 1) * pageSize + 1;
            end = Math.min(currentPage * pageSize, totalRecords);
        }

        infoEl.textContent = `${start}-${end} / ${totalRecords}`;
        frag.appendChild(infoEl);
    },
};
