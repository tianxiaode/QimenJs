/**
 * PaginationNavAbility 分页导航按钮能力
 *
 * 渲染首页/上一页/下一页/末页按钮。
 * 从 PaginationAbility 拆分而来，职责单一：只管导航按钮渲染。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PAGINATION_POSITIONS } from './pagination-positions';

export const PaginationNavAbility: AbilityDefinition = {
    /**
     * 渲染导航按钮到 DocumentFragment
     */
    renderPaginationNav(frag: DocumentFragment): void {
        // 首页
        if (this.showFirstLast) {
            const firstBtn = this._createPageBtn('«', PAGINATION_POSITIONS.FIRST, () => this.firstPage());
            if (this.currentPage <= 1) firstBtn.classList.add('q-pagination__btn--disabled');
            frag.appendChild(firstBtn);
        }

        // 上一页
        const prevBtn = this._createPageBtn('‹', PAGINATION_POSITIONS.PREV, () => this.prevPage());
        if (this.currentPage <= 1) prevBtn.classList.add('q-pagination__btn--disabled');
        frag.appendChild(prevBtn);

        // 下一页
        const nextBtn = this._createPageBtn('›', PAGINATION_POSITIONS.NEXT, () => this.nextPage());
        if (this.currentPage >= this.totalPages) nextBtn.classList.add('q-pagination__btn--disabled');
        frag.appendChild(nextBtn);

        // 末页
        if (this.showFirstLast) {
            const lastBtn = this._createPageBtn('»', PAGINATION_POSITIONS.LAST, () => this.lastPage());
            if (this.currentPage >= this.totalPages) lastBtn.classList.add('q-pagination__btn--disabled');
            frag.appendChild(lastBtn);
        }
    },

    /**
     * 创建分页按钮
     */
    _createPageBtn(text: string, position: number, onClick: () => void): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'q-pagination__btn';
        btn.setAttribute('data-pagination', 'btn');
        btn.setAttribute('data-position', String(position));
        btn.textContent = text;
        btn.addEventListener('click', onClick);
        return btn;
    },
};
