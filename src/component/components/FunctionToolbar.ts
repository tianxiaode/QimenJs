/**
 * FunctionToolbar 功能工具栏
 *
 * 组合 CRUD 工具栏 + 分页工具栏，提供完整的数据操作功能。
 * 左侧为 CRUD 按钮，右侧为分页控件，中间自动分隔。
 *
 * @example
 * ```js
 * {
 *   type: 'FunctionToolbar',
 *   // CRUD 配置
 *   showCreate: true,
 *   showDelete: true,
 *   showExport: true,
 *   // 分页配置
 *   currentPage: 1,
 *   totalPages: 10,
 *   totalRecords: 95,
 *   pageSize: 10,
 * }
 * ```
 */

import { ToolbarComponent } from './ToolbarComponent';
import { PAGINATION_POSITIONS } from './PaginationToolbar';
import { CRUD_POSITIONS } from './CrudToolbar';

/** 功能工具栏区域位置常量 */
export const FUNCTION_POSITIONS = {
    // CRUD 区域
    CRUD_START: 10,
    CRUD_CREATE: CRUD_POSITIONS.CREATE,
    CRUD_EDIT: CRUD_POSITIONS.EDIT,
    CRUD_DELETE: CRUD_POSITIONS.DELETE,
    CRUD_SEPARATOR_1: CRUD_POSITIONS.SEPARATOR_1,
    CRUD_REFRESH: CRUD_POSITIONS.REFRESH,
    CRUD_IMPORT: CRUD_POSITIONS.IMPORT,
    CRUD_EXPORT: CRUD_POSITIONS.EXPORT,
    CRUD_SAVE: CRUD_POSITIONS.SAVE,

    // 分隔区域
    MIDDLE_SEPARATOR: 500,

    // 分页区域
    PAGINATION_START: 600,
    PAGINATION_FIRST: 610,
    PAGINATION_PREV: 620,
    PAGINATION_PAGES: 630,
    PAGINATION_NEXT: 640,
    PAGINATION_LAST: 650,
    PAGINATION_INFO: 660,
} as const;

export class FunctionToolbar extends ToolbarComponent {
    /** CRUD 按钮配置 */
    private _crudButtons: Record<string, { visible: boolean; text: string; icon: string }> = {
        create:  { visible: true, text: '新建', icon: '➕' },
        edit:    { visible: true, text: '编辑', icon: '✏️' },
        delete:  { visible: true, text: '删除', icon: '🗑️' },
        refresh: { visible: true, text: '刷新', icon: '🔄' },
        import:  { visible: false, text: '导入', icon: '📥' },
        export:  { visible: true, text: '导出', icon: '📤' },
        save:    { visible: false, text: '保存', icon: '💾' },
    };

    /** 分页配置 */
    private _currentPage: number = 1;
    private _totalPages: number = 1;
    private _totalRecords: number = 0;
    private _pageSize: number = 10;
    private _showFirstLast: boolean = true;
    private _showPageInfo: boolean = true;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.className = 'q-function-toolbar q-toolbar q-flex q-flex-row';

        // CRUD 配置
        if (props) {
            for (const [key, config] of Object.entries(this._crudButtons)) {
                const propKey = `show${key.charAt(0).toUpperCase() + key.slice(1)}` as string;
                if (props[propKey] !== undefined) config.visible = props[propKey];
                if (props[`${key}Text`]) config.text = props[`${key}Text`];
                if (props[`${key}Icon`]) config.icon = props[`${key}Icon`];
            }

            // 分页配置
            if (props?.currentPage) this._currentPage = props.currentPage;
            if (props?.totalPages) this._totalPages = props.totalPages;
            if (props?.totalRecords) this._totalRecords = props.totalRecords;
            if (props?.pageSize) this._pageSize = props.pageSize;
            if (props?.showFirstLast !== undefined) this._showFirstLast = props.showFirstLast;
            if (props?.showPageInfo !== undefined) this._showPageInfo = props.showPageInfo;
        }

        this.renderFunctionToolbar();
    }

    // ============================================
    // CRUD 操作
    // ============================================

    showButton(name: string): void {
        if (this._crudButtons[name]) {
            this._crudButtons[name].visible = true;
            this.renderFunctionToolbar();
        }
    }

    hideButton(name: string): void {
        if (this._crudButtons[name]) {
            this._crudButtons[name].visible = false;
            this.renderFunctionToolbar();
        }
    }

    toggleButton(name: string): void {
        if (this._crudButtons[name]) {
            this._crudButtons[name].visible = !this._crudButtons[name].visible;
            this.renderFunctionToolbar();
        }
    }

    // ============================================
    // 分页操作
    // ============================================

    get currentPage(): number { return this._currentPage; }
    set currentPage(value: number) {
        this._currentPage = value;
        this.renderFunctionToolbar();
    }

    get totalPages(): number { return this._totalPages; }
    set totalPages(value: number) {
        this._totalPages = value;
        this.renderFunctionToolbar();
    }

    get totalRecords(): number { return this._totalRecords; }
    set totalRecords(value: number) {
        this._totalRecords = value;
        this.renderFunctionToolbar();
    }

    gotoPage(page: number): void {
        if (page < 1 || page > this._totalPages) return;
        this._currentPage = page;
        this.renderFunctionToolbar();
        this.emit?.('pagechange', { page, pageSize: this._pageSize });
    }

    // ============================================
    // 渲染
    // ============================================

    private renderFunctionToolbar(): void {
        this.el.innerHTML = '';

        // === 左侧：CRUD 按钮 ===
        const crudItems: Array<{ name: string; position: number; separatorBefore?: number }> = [
            { name: 'create', position: FUNCTION_POSITIONS.CRUD_CREATE },
            { name: 'edit', position: FUNCTION_POSITIONS.CRUD_EDIT },
            { name: 'delete', position: FUNCTION_POSITIONS.CRUD_DELETE },
            { name: 'refresh', position: FUNCTION_POSITIONS.CRUD_REFRESH, separatorBefore: FUNCTION_POSITIONS.CRUD_SEPARATOR_1 },
            { name: 'import', position: FUNCTION_POSITIONS.CRUD_IMPORT },
            { name: 'export', position: FUNCTION_POSITIONS.CRUD_EXPORT },
            { name: 'save', position: FUNCTION_POSITIONS.CRUD_SAVE },
        ];

        let hasCrudVisible = false;
        for (const item of crudItems) {
            const config = this._crudButtons[item.name];
            if (!config?.visible) continue;

            if (item.separatorBefore && hasCrudVisible) {
                const sep = document.createElement('div');
                sep.className = 'q-separator q-separator--vertical';
                sep.setAttribute('data-position', String(item.separatorBefore));
                this.el.appendChild(sep);
            }

            const btn = document.createElement('button');
            btn.className = 'q-crud-toolbar__btn q-button';
            btn.setAttribute('data-position', String(item.position));
            btn.setAttribute('data-action', item.name);
            btn.textContent = `${config.icon || ''} ${config.text || item.name}`.trim();
            btn.addEventListener('click', () => {
                this.emit?.('crudaction', { action: item.name });
            });
            this.el.appendChild(btn);
            hasCrudVisible = true;
        }

        // === 中间：弹性空间 ===
        const spacer = document.createElement('div');
        spacer.className = 'q-function-toolbar__spacer';
        spacer.style.flex = '1';
        spacer.setAttribute('data-position', String(FUNCTION_POSITIONS.MIDDLE_SEPARATOR));
        this.el.appendChild(spacer);

        // === 右侧：分页 ===
        if (this._showFirstLast) {
            const firstBtn = this.createPageButton('«', FUNCTION_POSITIONS.PAGINATION_FIRST, () => this.gotoPage(1));
            if (this._currentPage <= 1) firstBtn.classList.add('q-pagination__btn--disabled');
            this.el.appendChild(firstBtn);
        }

        const prevBtn = this.createPageButton('‹', FUNCTION_POSITIONS.PAGINATION_PREV, () => this.gotoPage(this._currentPage - 1));
        if (this._currentPage <= 1) prevBtn.classList.add('q-pagination__btn--disabled');
        this.el.appendChild(prevBtn);

        // 页码
        const pagesEl = document.createElement('span');
        pagesEl.className = 'q-pagination__pages';
        pagesEl.setAttribute('data-position', String(FUNCTION_POSITIONS.PAGINATION_PAGES));
        this.el.appendChild(pagesEl);

        const nextBtn = this.createPageButton('›', FUNCTION_POSITIONS.PAGINATION_NEXT, () => this.gotoPage(this._currentPage + 1));
        if (this._currentPage >= this._totalPages) nextBtn.classList.add('q-pagination__btn--disabled');
        this.el.appendChild(nextBtn);

        if (this._showFirstLast) {
            const lastBtn = this.createPageButton('»', FUNCTION_POSITIONS.PAGINATION_LAST, () => this.gotoPage(this._totalPages));
            if (this._currentPage >= this._totalPages) lastBtn.classList.add('q-pagination__btn--disabled');
            this.el.appendChild(lastBtn);
        }

        // 页码信息
        if (this._showPageInfo) {
            const infoEl = document.createElement('span');
            infoEl.className = 'q-pagination__info';
            infoEl.setAttribute('data-position', String(FUNCTION_POSITIONS.PAGINATION_INFO));
            const start = (this._currentPage - 1) * this._pageSize + 1;
            const end = Math.min(this._currentPage * this._pageSize, this._totalRecords);
            infoEl.textContent = `${start}-${end} / ${this._totalRecords}`;
            this.el.appendChild(infoEl);
        }
    }

    private createPageButton(text: string, position: number, onClick: () => void): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'q-pagination__btn';
        btn.setAttribute('data-position', String(position));
        btn.textContent = text;
        btn.addEventListener('click', onClick);
        return btn;
    }
}
