/**
 * PaginationPagesAbility 分页页码按钮能力
 *
 * 渲染页码数字按钮和省略号。
 * 从 PaginationAbility 拆分而来，职责单一：只管页码按钮渲染。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PAGINATION_POSITIONS } from './pagination-positions';

export const PaginationPagesAbility: AbilityDefinition = {
    /**
     * 渲染页码区域到 DocumentFragment
     */
    renderPaginationPages(frag: DocumentFragment): void {
        const pagesEl = document.createElement('span');
        pagesEl.className = 'q-pagination__pages';
        pagesEl.setAttribute('data-pagination', 'pages');
        pagesEl.setAttribute('data-position', String(PAGINATION_POSITIONS.PAGES));
        const pageButtons = this._generatePageNumbers();
        for (const btn of pageButtons) pagesEl.appendChild(btn);
        frag.appendChild(pagesEl);
    },

    /**
     * 生成页码按钮列表（含省略号）
     */
    _generatePageNumbers(): HTMLElement[] {
        const buttons: HTMLElement[] = [];
        const current = this.currentPage;
        const total = this.totalPages;
        const range = this.pageRange || 2;
        let start = Math.max(1, current - range);
        let end = Math.min(total, current + range);

        if (start > 1) {
            buttons.push(this._createPageNumBtn(1));
            if (start > 2) buttons.push(this._createEllipsis());
        }

        for (let i = start; i <= end; i++) {
            buttons.push(this._createPageNumBtn(i));
        }

        if (end < total) {
            if (end < total - 1) buttons.push(this._createEllipsis());
            buttons.push(this._createPageNumBtn(total));
        }

        return buttons;
    },

    /**
     * 创建页码数字按钮
     */
    _createPageNumBtn(page: number): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'q-pagination__btn';
        if (page === this.currentPage) btn.classList.add('q-pagination__btn--active');
        btn.setAttribute('data-pagination', 'btn');
        btn.textContent = String(page);
        btn.addEventListener('click', () => this.gotoPage(page));
        return btn;
    },

    /**
     * 创建省略号
     */
    _createEllipsis(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'q-pagination__ellipsis';
        span.setAttribute('data-pagination', 'ellipsis');
        span.textContent = '...';
        return span;
    },
};
