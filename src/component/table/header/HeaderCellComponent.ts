import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, DragOptions } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { HEADER_CELL_TPL } from './header-cell-tpl';

type SortState = 'none' | 'asc' | 'desc';

const SORT_CLS_PREFIX = 'q-header-cell__sort--';

const HeaderCellComponentDefs: Definitions = {
    options: {
        colName: '',
        align: 'center',
        minWidth: 50,
        title: null,
        action: null,
        sortable: false,
        resizable: true,
        reorderable: false,
    },
} as const;

class HeaderCellComponent extends Component {
    static type = 'q-header-cell';

    get tpl(): TemplateDecl {
        return HEADER_CELL_TPL;
    }

    drag?: boolean | DragOptions = {
        axis: 'x',
        activeClass: 'q-header-cell__resize--active',
        handle: 'resizeHandle',
    };

    _sortState: SortState = 'none';
    _resizeStartWidth: number = 0;
    _menuOpen: boolean = false;

    onAfterInit(): void {
        this.setNodeText('升序', 'sortAscItem');
        this.setNodeText('降序', 'sortDescItem');
        this.setNodeText('隐藏此列', 'hideColumnItem');
    }

    _onAlignOptionChange(_value: string): void {
        const justifyContent =
            this.align === 'center' ? 'center' : this.align === 'right' ? 'flex-end' : 'flex-start';
        this.setStyles({ justifyContent }, 'content');
    }

    _onMinWidthOptionChange(_value: number): void {
        this.setStyles(
            {
                width: `var(--q-table-col-${this.colName}-width)`,
                minWidth: `var(--q-table-col-${this.colName}-min-width, ${this.minWidth}px)`,
            },
            'content'
        );
    }

    _onColNameOptionChange(_value: string): void {
        this.setStyles(
            {
                width: `var(--q-table-col-${this.colName}-width)`,
                minWidth: `var(--q-table-col-${this.colName}-min-width, ${this.minWidth}px)`,
            },
            'content'
        );
    }

    _onTitleOptionChange(_value: string): void {
        if (this.title) {
            this.setNodeText(String(this.title), 'title');
            this.setStyles({ display: '' }, 'title');
        } else {
            this.setStyles({ display: 'none' }, 'title');
        }
    }

    _onSortableOptionChange(_value: boolean): void {
        this._applySortIcon();
        this.setStyles({ display: this.sortable ? '' : 'none' }, 'sortAscItem');
        this.setStyles({ display: this.sortable ? '' : 'none' }, 'sortDescItem');
    }

    _onResizableOptionChange(_value: boolean): void {
        this.setStyles({ display: this.resizable ? '' : 'none' }, 'resizeHandle');
    }

    get sortState(): SortState {
        return this._sortState;
    }
    set sortState(v: SortState) {
        this._sortState = v;
        this._applySortIcon();
    }

    _applySortIcon(): void {
        if (this.sortable) {
            this.addCls('q-header-cell--sortable');
        } else {
            this.removeCls('q-header-cell--sortable');
            this.setStyles({ display: 'none' }, 'sortIcon');
            return;
        }
        this.setStyles({ display: '' }, 'sortIcon');
        this.removeCls(
            [`${SORT_CLS_PREFIX}none`, `${SORT_CLS_PREFIX}asc`, `${SORT_CLS_PREFIX}desc`],
            'sortIcon'
        );
        this.addCls(`${SORT_CLS_PREFIX}${this._sortState}`, 'sortIcon');
    }

    _toggleMenu(): void {
        if (this._menuOpen) this._closeMenu();
        else this._openMenu();
    }

    _openMenu(): void {
        this._menuOpen = true;
        this.addCls('q-header-cell--menu-open');
    }

    _closeMenu(): void {
        this._menuOpen = false;
        this.removeCls('q-header-cell--menu-open');
    }

    onDragStart(_ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        if (!this.resizable) return;
        this._resizeStartWidth = this.el.offsetWidth;
    }

    onDragMove(ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        if (!this.resizable) return;
        const newWidth = Math.max(this.minWidth, this._resizeStartWidth + ctx.dx);
        this.emit('resize', {
            colName: this.colName,
            width: newWidth,
        });
    }

    onDragEnd(_ctx: { el: HTMLElement; originalEvent: Event }): void {}

    update(data: any): void {
        if (data?.title !== undefined) {
            this.setData('title', data.title);
        }
        if (data?.sortState !== undefined) {
            this.sortState = data.sortState;
        }
    }
}

HeaderCellComponent.define(HeaderCellComponentDefs);
HeaderCellComponent.register();

export { HeaderCellComponent };
export type HeaderCellComponentInstance = InstanceType<typeof HeaderCellComponent>;
