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
        menuDisabled: false,
        hideableColumns: null,
        groupable: false,
        customMenuItems: null,
    },
} as const;

class HeaderCellComponent extends Component {
    static type = 'header-cell';

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
    _popoverInitialized: boolean = false;

    _buildMenuItems(): any[] {
        const items: any[] = [];
        if (this.sortable) {
            items.push({ text: '@table.sortAsc', action: 'sortAsc', order: 10 });
            items.push({ text: '@table.sortDesc', action: 'sortDesc', order: 20 });
        }
        if (this.groupable) {
            items.push({ text: '@table.groupBy', action: 'groupBy', order: 30 });
        }
        const hideable = this.hideableColumns;
        if (hideable?.length) {
            if (items.length === 0) {
                for (const col of hideable) {
                    items.push({
                        text: col.title ?? col.colName,
                        action: `toggleColumn:${col.colName}`,
                        group: 'hideableColumns',
                        groupMode: 'checkbox',
                        checked: !col.hidden,
                        order: 40,
                    });
                }
            } else {
                items.push({
                    text: '@table.hideColumn',
                    action: 'hideColumn',
                    order: 40,
                    popover: {
                        options: {
                            items: hideable.map((col: any) => ({
                                text: col.title ?? col.colName,
                                action: `toggleColumn:${col.colName}`,
                                group: 'hideableColumns',
                                groupMode: 'checkbox',
                                checked: !col.hidden,
                            })),
                        },
                    },
                });
            }
        }
        if (this.customMenuItems?.length) {
            for (const item of this.customMenuItems) {
                items.push({ ...item, order: item.order ?? 50 });
            }
        }
        items.sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
        return items;
    }

    _applyPopover(): void {
        if (this.menuDisabled || !this.getNodeEl('menuIcon')) return;
        this.setData('popover', {
            type: 'menu',
            trigger: 'click',
            anchor: 'menuIcon',
            placement: 'bottom-end',
            options: { items: this._buildMenuItems() },
        });
        this._popoverInitialized = true;
    }

    onAfterInit(): void {
        super.onAfterInit();
        if (this.menuDisabled) {
            this.setStyles({ display: 'none' }, 'menuIcon');
        } else {
            this._applyPopover();
        }
    }

    _onAlignOptionChange(_value: string): void {
        const justifyContent =
            this.align === 'center' ? 'center' : this.align === 'right' ? 'flex-end' : 'flex-start';
        this.setStyles({ justifyContent }, 'content');
    }

    _onMinWidthOptionChange(_value: number): void {
        this.setStyles({
            width: `var(--q-table-col-${this.colName}-width)`,
            minWidth: `var(--q-table-col-${this.colName}-min-width, ${this.minWidth}px)`,
        });
    }

    _onColNameOptionChange(_value: string): void {
        this.setStyles({
            width: `var(--q-table-col-${this.colName}-width)`,
            minWidth: `var(--q-table-col-${this.colName}-min-width, ${this.minWidth}px)`,
        });
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
        if (this._popoverInitialized) {
            this.updatePopover({ items: this._buildMenuItems() });
        }
    }

    _onResizableOptionChange(_value: boolean): void {
        this.setStyles({ display: this.resizable ? '' : 'none' }, 'resizeHandle');
    }

    _onMenuDisabledOptionChange(_value: boolean): void {
        this.setStyles({ display: this.menuDisabled ? 'none' : '' }, 'menuIcon');
        if (this.menuDisabled) {
            this.hidePopover();
            this.setData('popover', null);
            this._popoverInitialized = false;
        } else {
            this._applyPopover();
        }
    }

    _onHideableColumnsOptionChange(_value: any): void {
        if (this._popoverInitialized && !this.menuDisabled) {
            this.updatePopover({ items: this._buildMenuItems() });
        }
    }

    _onGroupableOptionChange(_value: boolean): void {
        if (this._popoverInitialized && !this.menuDisabled) {
            this.updatePopover({ items: this._buildMenuItems() });
        }
    }

    _onCustomMenuItemsOptionChange(_value: any): void {
        if (this._popoverInitialized && !this.menuDisabled) {
            this.updatePopover({ items: this._buildMenuItems() });
        }
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

    showPopover(): void {
        super.showPopover();
        const inst = this._getPopoverInstance();
        if (inst && !inst._menuSelectBound) {
            inst._menuSelectBound = true;
            inst.on('select', (data: any) => {
                const payload = data?.data ?? data;
                this.emit('menuSelect', {
                    action: payload?.action,
                    colName: this.colName,
                });
            });
        }
    }

    onDragStart(_ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        if (!this.resizable) return;
        this._resizeStartWidth = this.el!.offsetWidth;
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
