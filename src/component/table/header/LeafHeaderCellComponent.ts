import { BaseHeaderCellComponent } from './BaseHeaderCellComponent';
import type { TemplateDecl, DragOptions } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { LEAF_HEADER_CELL_TPL } from './leaf-header-cell-tpl';

type SortState = 'none' | 'asc' | 'desc';

const SORT_CLS_PREFIX = 'q-header-cell__sort--';

const LeafHeaderCellComponentDefs: Definitions = {
    options: {
        sortable: false,
        resizable: true,
        reorderable: false,
    },
} as const;

class LeafHeaderCellComponent extends BaseHeaderCellComponent {
    get tpl(): TemplateDecl {
        return LEAF_HEADER_CELL_TPL;
    }

    domEvents = {
        click: [
            { path: 'content', handler: '_onContentClick' },
            { path: 'menu', handler: '_onMenuClick' },
        ],
    };

    drag?: boolean | DragOptions = {
        axis: 'x',
        activeClass: 'q-header-cell__resize--active',
        handle: 'resizeHandle',
    };

    _sortState: SortState = 'none';
    _resizeStartWidth: number = 0;
    _menuOpen: boolean = false;

    onAfterInit(): void {
        super.onAfterInit();
        this._applySortIcon();
        this._applyResizable();
        this._initMenu();
    }

    _onSortableOptionChange(_value: boolean): void {
        this._applySortIcon();
        this._applyMenuItems();
    }

    _onResizableOptionChange(_value: boolean): void {
        this._applyResizable();
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
        this.removeCls([`${SORT_CLS_PREFIX}none`, `${SORT_CLS_PREFIX}asc`, `${SORT_CLS_PREFIX}desc`], 'sortIcon');
        this.addCls(`${SORT_CLS_PREFIX}${this._sortState}`, 'sortIcon');
    }

    _applyResizable(): void {
        this.setStyles({ display: this.resizable ? '' : 'none' }, 'resizeHandle');
    }

    _initMenu(): void {
        this.setNodeText('升序', 'sortAscItem');
        this.setNodeText('降序', 'sortDescItem');
        this.setNodeText('隐藏此列', 'hideColumnItem');
        this._applyMenuItems();
        this._closeMenu();
    }

    _applyMenuItems(): void {
        this.setStyles({ display: this.sortable ? '' : 'none' }, 'sortAscItem');
        this.setStyles({ display: this.sortable ? '' : 'none' }, 'sortDescItem');
    }

    _onContentClick(e: any): void {
        const target = e?.target as HTMLElement;
        const menuIconEl = this.getNodeEl('menuIcon');

        if (menuIconEl === target || menuIconEl?.contains(target)) {
            this._toggleMenu();
            return;
        }

        if (this._menuOpen) {
            this._closeMenu();
            return;
        }

        if (this.sortable) {
            this._onSortClick();
        }
    }

    _onMenuClick(e: any): void {
        const target = e?.target as HTMLElement;
        const sortAscEl = this.getNodeEl('sortAscItem');
        const sortDescEl = this.getNodeEl('sortDescItem');
        const hideColEl = this.getNodeEl('hideColumnItem');

        if (sortAscEl === target) {
            this.sortState = 'asc';
            this.emit('sortChange', { colName: this.colName, direction: 'asc' });
        } else if (sortDescEl === target) {
            this.sortState = 'desc';
            this.emit('sortChange', { colName: this.colName, direction: 'desc' });
        } else if (hideColEl === target) {
            this.emit('hideColumn', { colName: this.colName });
        }

        this._closeMenu();
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

    _onSortClick(): void {
        if (!this.sortable) return;
        const next: SortState =
            this._sortState === 'none' ? 'asc' : this._sortState === 'asc' ? 'desc' : 'none';
        this.sortState = next;

        this.emit('sortChange', {
            colName: this.colName,
            direction: next === 'none' ? null : next,
        });
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
            this.setNodeText(String(data.title), 'title');
        }
        if (data?.sortState !== undefined) {
            this.sortState = data.sortState;
        }
    }
}

LeafHeaderCellComponent.define(LeafHeaderCellComponentDefs);

export { LeafHeaderCellComponent };
export type LeafHeaderCellComponentInstance = InstanceType<typeof LeafHeaderCellComponent>;
