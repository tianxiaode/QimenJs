/**
 * PaginationAbility 分页能力
 *
 * 为工具栏注入分页按钮组：首页/上一页/页码/下一页/末页 + 页码信息。
 * 所有按钮通过 position 排序，可通过配置显隐。
 *
 * @example
 * ```js
 * // 给任意 Toolbar 加分页
 * class MyToolbar extends ComponentBase {
 *     static abilities = [LayoutAbility, ChildrenAbility, ToolbarAbility, PaginationAbility];
 * }
 *
 * // 布局定义
 * { type: ComponentTypes.TOOLBAR, currentPage: 1, totalPages: 10, totalRecords: 95 }
 *
 * // 运行时
 * toolbar.gotoPage(3);
 * toolbar.nextPage();
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PAGINATION_EVENTS } from '@qimenjs/events';

/** 分页按钮位置常量 */
export const PAGINATION_POSITIONS = {
    FIRST: 610,
    PREV: 620,
    PAGES: 630,
    NEXT: 640,
    LAST: 650,
    INFO: 660,
} as const;

export const PaginationAbility: AbilityDefinition = {
    /**
     * currentPage getter/setter
     */
    currentPage: {
        get(): number {
            return this.abilityState('PaginationAbility:currentPage', () => 1);
        },
        set(value: number): void {
            this.setAbilityState('PaginationAbility:currentPage', value);
            this.renderPagination?.();
        },
    },

    /**
     * totalPages getter/setter
     */
    totalPages: {
        get(): number {
            return this.abilityState('PaginationAbility:totalPages', () => 1);
        },
        set(value: number): void {
            this.setAbilityState('PaginationAbility:totalPages', value);
            this.renderPagination?.();
        },
    },

    /**
     * totalRecords getter/setter
     */
    totalRecords: {
        get(): number {
            return this.abilityState('PaginationAbility:totalRecords', () => 0);
        },
        set(value: number): void {
            this.setAbilityState('PaginationAbility:totalRecords', value);
            this.renderPagination?.();
        },
    },

    /**
     * pageSize getter/setter
     */
    pageSize: {
        get(): number {
            return this.abilityState('PaginationAbility:pageSize', () => 10);
        },
        set(value: number): void {
            this.setAbilityState('PaginationAbility:pageSize', value);
            this.renderPagination?.();
        },
    },

    /**
     * showFirstLast getter/setter
     */
    showFirstLast: {
        get(): boolean {
            return this.abilityState('PaginationAbility:showFirstLast', () => true);
        },
        set(value: boolean): void {
            this.setAbilityState('PaginationAbility:showFirstLast', value);
            this.renderPagination?.();
        },
    },

    /**
     * showPageInfo getter/setter
     */
    showPageInfo: {
        get(): boolean {
            return this.abilityState('PaginationAbility:showPageInfo', () => true);
        },
        set(value: boolean): void {
            this.setAbilityState('PaginationAbility:showPageInfo', value);
            this.renderPagination?.();
        },
    },

    // ============================================
    // 分页操作
    // ============================================

    gotoPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.emit?.(PAGINATION_EVENTS.CHANGE, { page, pageSize: this.pageSize });
    },

    prevPage(): void {
        this.gotoPage(this.currentPage - 1);
    },

    nextPage(): void {
        this.gotoPage(this.currentPage + 1);
    },

    firstPage(): void {
        this.gotoPage(1);
    },

    lastPage(): void {
        this.gotoPage(this.totalPages);
    },

    // ============================================
    // 渲染分页按钮
    // ============================================

    renderPagination(): void {
        if (!this.el) return;

        // 移除旧分页元素
        const oldItems = this.el.querySelectorAll('[data-pagination]');
        oldItems.forEach((el: Element) => el.remove());

        const frag = document.createDocumentFragment();

        // 首页
        if (this.showFirstLast) {
            const firstBtn = this.createPageBtn('«', PAGINATION_POSITIONS.FIRST, () => this.firstPage());
            if (this.currentPage <= 1) firstBtn.classList.add('q-pagination__btn--disabled');
            frag.appendChild(firstBtn);
        }

        // 上一页
        const prevBtn = this.createPageBtn('‹', PAGINATION_POSITIONS.PREV, () => this.prevPage());
        if (this.currentPage <= 1) prevBtn.classList.add('q-pagination__btn--disabled');
        frag.appendChild(prevBtn);

        // 页码
        const pagesEl = document.createElement('span');
        pagesEl.className = 'q-pagination__pages';
        pagesEl.setAttribute('data-pagination', 'pages');
        pagesEl.setAttribute('data-position', String(PAGINATION_POSITIONS.PAGES));
        const pageButtons = this.generatePageNumbers();
        for (const btn of pageButtons) pagesEl.appendChild(btn);
        frag.appendChild(pagesEl);

        // 下一页
        const nextBtn = this.createPageBtn('›', PAGINATION_POSITIONS.NEXT, () => this.nextPage());
        if (this.currentPage >= this.totalPages) nextBtn.classList.add('q-pagination__btn--disabled');
        frag.appendChild(nextBtn);

        // 末页
        if (this.showFirstLast) {
            const lastBtn = this.createPageBtn('»', PAGINATION_POSITIONS.LAST, () => this.lastPage());
            if (this.currentPage >= this.totalPages) lastBtn.classList.add('q-pagination__btn--disabled');
            frag.appendChild(lastBtn);
        }

        // 页码信息
        if (this.showPageInfo) {
            const infoEl = document.createElement('span');
            infoEl.className = 'q-pagination__info';
            infoEl.setAttribute('data-pagination', 'info');
            infoEl.setAttribute('data-position', String(PAGINATION_POSITIONS.INFO));
            const start = (this.currentPage - 1) * this.pageSize + 1;
            const end = Math.min(this.currentPage * this.pageSize, this.totalRecords);
            infoEl.textContent = `${start}-${end} / ${this.totalRecords}`;
            frag.appendChild(infoEl);
        }

        this.el.appendChild(frag);
    },

    createPageBtn(text: string, position: number, onClick: () => void): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'q-pagination__btn';
        btn.setAttribute('data-pagination', 'btn');
        btn.setAttribute('data-position', String(position));
        btn.textContent = text;
        btn.addEventListener('click', onClick);
        return btn;
    },

    generatePageNumbers(): HTMLElement[] {
        const buttons: HTMLElement[] = [];
        const current = this.currentPage;
        const total = this.totalPages;
        const range = 2;
        let start = Math.max(1, current - range);
        let end = Math.min(total, current + range);

        if (start > 1) {
            buttons.push(this.createPageNumBtn(1));
            if (start > 2) buttons.push(this.createEllipsis());
        }

        for (let i = start; i <= end; i++) {
            buttons.push(this.createPageNumBtn(i));
        }

        if (end < total) {
            if (end < total - 1) buttons.push(this.createEllipsis());
            buttons.push(this.createPageNumBtn(total));
        }

        return buttons;
    },

    createPageNumBtn(page: number): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'q-pagination__btn';
        if (page === this.currentPage) btn.classList.add('q-pagination__btn--active');
        btn.textContent = String(page);
        btn.addEventListener('click', () => this.gotoPage(page));
        return btn;
    },

    createEllipsis(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'q-pagination__ellipsis';
        span.textContent = '...';
        return span;
    },

    /**
     * 从 props 初始化
     */
    __initProps(props: Record<string, any>): void {
        if (props.currentPage) this.currentPage = props.currentPage;
        if (props.totalPages) this.totalPages = props.totalPages;
        if (props.totalRecords) this.totalRecords = props.totalRecords;
        if (props.pageSize) this.pageSize = props.pageSize;
        if (props.showFirstLast !== undefined) this.showFirstLast = props.showFirstLast;
        if (props.showPageInfo !== undefined) this.showPageInfo = props.showPageInfo;
    },
};
