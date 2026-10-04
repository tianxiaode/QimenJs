import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, DragOptions, DomEventsMap } from '@qimenjs/component-core';
import { DomEventsEngine } from '@/component-core/engine';
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
        groupField: '',
        customMenuItems: null,
        selectionAll: false,
        sortState: 'none',
    },
} as const;

class HeaderCellComponent extends Component {
    static type = 'header-cell';

    get tpl(): TemplateDecl {
        return HEADER_CELL_TPL;
    }

    domEvents: DomEventsMap = {
        click: [{ path: 'selectAllBox', handler: '_onSelectAllBoxClick' }],
    };

    drag?: boolean | DragOptions = false;

    _resizeStartWidth: number = 0;
    _popoverInitialized: boolean = false;
    _resizeRule: any = null;

    _buildMenuItems(): any[] {
        const colName = this.colName;
        const sortState = this.getData('sortState') as SortState;
        const items: any[] = [];
        if (this.sortable) {
            items.push({
                text: '@table.sortAsc',
                action: 'sort',
                actionData: { colName, direction: 'asc' },
                group: 'sort',
                groupMode: 'radio',
                checked: sortState === 'asc',
                order: 10,
            });
            items.push({
                text: '@table.sortDesc',
                action: 'sort',
                actionData: { colName, direction: 'desc' },
                group: 'sort',
                groupMode: 'radio',
                checked: sortState === 'desc',
                order: 20,
            });
        }
        if (this.groupable) {
            items.push({
                text: '@table.groupBy',
                action: 'groupBy',
                actionData: { colName },
                group: 'groupBy',
                groupMode: 'checkbox',
                checked: this.groupField === this.colName,
                order: 30,
            });
        }
        const hideable = this.hideableColumns;
        if (hideable?.length) {
            if (items.length === 0) {
                for (const col of hideable) {
                    items.push({
                        text: col.title ?? col.colName,
                        action: col.hidden ? 'showColumn' : 'hideColumn',
                        actionData: { colName: col.colName },
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
                                action: col.hidden ? 'showColumn' : 'hideColumn',
                                actionData: { colName: col.colName },
                                group: 'hideableColumns',
                                groupMode: 'checkbox',
                                checked: !col.hidden,
                            })),
                            eventKey: this.eventKey,
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
        if (this.menuDisabled || !this.getNodeEl('menuArea')) return;
        this.setData('popover', {
            type: 'menu',
            trigger: 'click',
            anchor: 'menuArea',
            placement: 'bottom-start',
            options: { items: this._buildMenuItems(), eventKey: this.eventKey },
        });
        this._popoverInitialized = true;
    }

    onAfterInit(): void {
        super.onAfterInit();
        if (this.menuDisabled) {
            this.setStyles({ display: 'none' }, 'menuArea');
        } else {
            this._applyPopover();
        }
        this._initResizeRule();
    }

    _initResizeRule(): void {
        const resizeHandle = this.getNodeEl('resizeHandle');
        if (!resizeHandle) return;
        this._resizeRule = {
            event: 'drag',
            path: resizeHandle,
            handler: '_onResizeDrag',
            needsBinding: true,
        };
        DomEventsEngine.addEventRule(this, this._resizeRule);
        this.onCleanup(() => {
            DomEventsEngine.removeEventRule(this, this._resizeRule);
        });
    }

    _onResizeDrag(domEvt: any): void {
        if (!this.resizable) return;
        const phase = domEvt?.data?.phase;
        if (phase === 'start') {
            this._resizeStartWidth = this.el!.offsetWidth;
        } else if (phase === 'move') {
            const dx = domEvt.data.dx ?? 0;
            const newWidth = Math.max(this.minWidth, this._resizeStartWidth + dx);
            this.componentEmit('resize', {
                colName: this.colName,
                width: newWidth,
            });
        }
    }

    _onReorderableOptionChange(_value: boolean): void {
        if (this.reorderable) {
            this.drag = { axis: 'x', activeClass: 'q-header-cell--dragging', handle: 'content' };
        } else {
            this.drag = false;
        }
        this._commitDrags();
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

    _onSortStateOptionChange(_value: SortState): void {
        this._applySortIcon();
        if (this._popoverInitialized && !this.menuDisabled) {
            this.updatePopover({ items: this._buildMenuItems() });
        }
    }

    _onResizableOptionChange(_value: boolean): void {
        this.setStyles({ display: this.resizable ? '' : 'none' }, 'resizeHandle');
    }

    _onMenuDisabledOptionChange(_value: boolean): void {
        this.setStyles({ display: this.menuDisabled ? 'none' : '' }, 'menuArea');
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

    _onGroupFieldOptionChange(_value: string): void {
        if (this._popoverInitialized && !this.menuDisabled) {
            this.updatePopover({ items: this._buildMenuItems() });
        }
    }

    _onCustomMenuItemsOptionChange(_value: any): void {
        if (this._popoverInitialized && !this.menuDisabled) {
            this.updatePopover({ items: this._buildMenuItems() });
        }
    }

    _onSelectionAllOptionChange(value: boolean): void {
        this.setStyles({ display: value ? '' : 'none' }, 'selectAllBox');
        if (!value) {
            this.toggleCls('q-header-cell__select-all--checked', false, 'selectAllBox');
            this.toggleCls('q-header-cell__select-all--indeterminate', false, 'selectAllBox');
        }
    }

    /**
     * 设置全选状态 — 由 Table 在 selectionChange 后同步
     *
     * @param allSelected - 全部选中
     * @param someSelected - 部分选中（半选）
     */
    setSelectAllState(allSelected: boolean, someSelected: boolean): void {
        if (!this.selectionAll) return;
        this.toggleCls('q-header-cell__select-all--checked', allSelected, 'selectAllBox');
        this.toggleCls(
            'q-header-cell__select-all--indeterminate',
            !allSelected && someSelected,
            'selectAllBox'
        );
    }

    onSelectAllBoxClick(): void {
        if (!this.selectionAll) return;
        const allSelected = this.getNodeEl('selectAllBox')?.classList.contains(
            'q-header-cell__select-all--checked'
        );
        this.componentEmit('toggleAll', { checked: !allSelected });
    }

    _applySortIcon(): void {
        const sortState = this.getData('sortState') as SortState;
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
        this.addCls(`${SORT_CLS_PREFIX}${sortState}`, 'sortIcon');
    }

    onDragStart(_ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        this.componentEmit('reorderStart', { colName: this.colName });
    }

    onDragMove(ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        const oe = ctx.originalEvent as any;
        let clientX = 0;
        let clientY = 0;
        if (oe?.clientX !== undefined) {
            clientX = oe.clientX;
            clientY = oe.clientY;
        } else if (oe?.touches?.[0]) {
            clientX = oe.touches[0].clientX;
            clientY = oe.touches[0].clientY;
        } else if (oe?.changedTouches?.[0]) {
            clientX = oe.changedTouches[0].clientX;
            clientY = oe.changedTouches[0].clientY;
        }
        this.componentEmit('reorderMove', { colName: this.colName, clientX, clientY });
    }

    onDragEnd(ctx: { el: HTMLElement; originalEvent: Event }): void {
        const oe = ctx.originalEvent as any;
        let clientX = 0;
        let clientY = 0;
        if (oe?.clientX !== undefined) {
            clientX = oe.clientX;
            clientY = oe.clientY;
        } else if (oe?.touches?.[0]) {
            clientX = oe.touches[0].clientX;
            clientY = oe.touches[0].clientY;
        } else if (oe?.changedTouches?.[0]) {
            clientX = oe.changedTouches[0].clientX;
            clientY = oe.changedTouches[0].clientY;
        }
        this.componentEmit('reorderEnd', { colName: this.colName, clientX, clientY });
    }

}

HeaderCellComponent.define(HeaderCellComponentDefs);
HeaderCellComponent.register();

export { HeaderCellComponent };
export type HeaderCellComponentInstance = InstanceType<typeof HeaderCellComponent>;
