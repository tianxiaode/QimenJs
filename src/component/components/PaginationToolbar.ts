/**
 * PaginationToolbar 分页工具栏
 *
 * 内置分页按钮组：首页/上一页/页码/下一页/末页 + 页码信息。
 * 所有按钮通过 position 排序，可通过配置显隐。
 *
 * @example
 * ```js
 * {
 *   type: 'PaginationToolbar',
 *   currentPage: 1,
 *   totalPages: 10,
 *   totalRecords: 95,
 *   pageSize: 10,
 *   // 隐藏首页/末页按钮
 *   showFirstLast: false,
 * }
 * ```
 */

import { ToolbarComponent } from './ToolbarComponent';
import { TextAbility } from '../abilities/TextAbility';
import { ClickAbility } from '../abilities/ClickAbility';
import { DisableAbility } from '../abilities/DisableAbility';
import { VisibleAbility } from '../abilities/VisibleAbility';

/** 分页按钮位置常量 */
export const PAGINATION_POSITIONS = {
    FIRST: 10,
    PREV: 20,
    PAGES: 30,
    NEXT: 40,
    LAST: 50,
    INFO: 60,
    PAGE_SIZE: 70,
} as const;

export class PaginationToolbar extends ToolbarComponent {
    /** 当前页 */
    private _currentPage: number = 1;

    /** 总页数 */
    private _totalPages: number = 1;

    /** 总记录数 */
    private _totalRecords: number = 0;

    /** 每页条数 */
    private _pageSize: number = 10;

    /** 是否显示首页/末页按钮 */
    private _showFirstLast: boolean = true;

    /** 是否显示页码信息 */
    private _showInfo: boolean = true;

    /** 是否显示每页条数选择 */
    private _showPageSize: boolean = false;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.className = 'q-pagination-toolbar q-toolbar q-flex q-flex-row';

        // 初始化配置
        if (props?.currentPage) this._currentPage = props.currentPage;
        if (props?.totalPages) this._totalPages = props.totalPages;
        if (props?.totalRecords) this._totalRecords = props.totalRecords;
        if (props?.pageSize) this._pageSize = props.pageSize;
        if (props?.showFirstLast !== undefined) this._showFirstLast = props.showFirstLast;
        if (props?.showInfo !== undefined) this._showInfo = props.showInfo;
        if (props?.showPageSize !== undefined) this._showPageSize = props.showPageSize;

        this.renderPagination();
    }

    /** currentPage getter/setter */
    get currentPage(): number { return this._currentPage; }
    set currentPage(value: number) {
        this._currentPage = value;
        this.updatePagination();
    }

    /** totalPages getter/setter */
    get totalPages(): number { return this._totalPages; }
    set totalPages(value: number) {
        this._totalPages = value;
        this.updatePagination();
    }

    /** totalRecords getter/setter */
    get totalRecords(): number { return this._totalRecords; }
    set totalRecords(value: number) {
        this._totalRecords = value;
        this.updatePagination();
    }

    /** pageSize getter/setter */
    get pageSize(): number { return this._pageSize; }
    set pageSize(value: number) {
        this._pageSize = value;
        this.updatePagination();
    }

    /** 跳转到指定页 */
    gotoPage(page: number): void {
        if (page < 1 || page > this._totalPages) return;
        this._currentPage = page;
        this.updatePagination();
        this.emit?.('pagechange', { page, pageSize: this._pageSize });
    }

    /** 上一页 */
    prevPage(): void {
        this.gotoPage(this._currentPage - 1);
    }

    /** 下一页 */
    nextPage(): void {
        this.gotoPage(this._currentPage + 1);
    }

    /** 首页 */
    firstPage(): void {
        this.gotoPage(1);
    }

    /** 末页 */
    lastPage(): void {
        this.gotoPage(this._totalPages);
    }

    /** 更新分页状态 */
    private updatePagination(): void {
        this.renderPagination();
    }

    /** 渲染分页按钮 */
    private renderPagination(): void {
        this.el.innerHTML = '';

        // 首页
        if (this._showFirstLast) {
            const firstBtn = this.createPageButton('«', PAGINATION_POSITIONS.FIRST, () => this.firstPage());
            if (this._currentPage <= 1) (firstBtn as any).disabled = true;
            this.el.appendChild(firstBtn);
        }

        // 上一页
        const prevBtn = this.createPageButton('‹', PAGINATION_POSITIONS.PREV, () => this.prevPage());
        if (this._currentPage <= 1) (prevBtn as any).disabled = true;
        this.el.appendChild(prevBtn);

        // 页码
        const pagesEl = document.createElement('span');
        pagesEl.className = 'q-pagination__pages';
        pagesEl.setAttribute('data-position', String(PAGINATION_POSITIONS.PAGES));
        const pageButtons = this.generatePageNumbers();
        for (const btn of pageButtons) {
            pagesEl.appendChild(btn);
        }
        this.el.appendChild(pagesEl);

        // 下一页
        const nextBtn = this.createPageButton('›', PAGINATION_POSITIONS.NEXT, () => this.nextPage());
        if (this._currentPage >= this._totalPages) (nextBtn as any).disabled = true;
        this.el.appendChild(nextBtn);

        // 末页
        if (this._showFirstLast) {
            const lastBtn = this.createPageButton('»', PAGINATION_POSITIONS.LAST, () => this.lastPage());
            if (this._currentPage >= this._totalPages) (lastBtn as any).disabled = true;
            this.el.appendChild(lastBtn);
        }

        // 页码信息
        if (this._showInfo) {
            const infoEl = document.createElement('span');
            infoEl.className = 'q-pagination__info';
            infoEl.setAttribute('data-position', String(PAGINATION_POSITIONS.INFO));
            const start = (this._currentPage - 1) * this._pageSize + 1;
            const end = Math.min(this._currentPage * this._pageSize, this._totalRecords);
            infoEl.textContent = `${start}-${end} / ${this._totalRecords}`;
            this.el.appendChild(infoEl);
        }
    }

    /** 创建页码按钮 */
    private createPageButton(text: string, position: number, onClick: () => void): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'q-pagination__btn';
        btn.setAttribute('data-position', String(position));
        btn.textContent = text;
        btn.addEventListener('click', onClick);
        return btn;
    }

    /** 生成页码按钮列表 */
    private generatePageNumbers(): HTMLElement[] {
        const buttons: HTMLElement[] = [];
        const current = this._currentPage;
        const total = this._totalPages;

        // 显示策略：当前页前后各2页，首尾页必显示
        const range = 2;
        let start = Math.max(1, current - range);
        let end = Math.min(total, current + range);

        // 首页
        if (start > 1) {
            buttons.push(this.createPageNumberButton(1));
            if (start > 2) {
                buttons.push(this.createEllipsis());
            }
        }

        // 中间页码
        for (let i = start; i <= end; i++) {
            buttons.push(this.createPageNumberButton(i));
        }

        // 末页
        if (end < total) {
            if (end < total - 1) {
                buttons.push(this.createEllipsis());
            }
            buttons.push(this.createPageNumberButton(total));
        }

        return buttons;
    }

    /** 创建页码数字按钮 */
    private createPageNumberButton(page: number): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'q-pagination__btn';
        if (page === this._currentPage) {
            btn.classList.add('q-pagination__btn--active');
        }
        btn.textContent = String(page);
        btn.addEventListener('click', () => this.gotoPage(page));
        return btn;
    }

    /** 创建省略号 */
    private createEllipsis(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'q-pagination__ellipsis';
        span.textContent = '...';
        return span;
    }
}
