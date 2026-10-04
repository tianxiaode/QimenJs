import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, DragOptions, DomEventsMap } from '@qimenjs/component-core';
import { ResizeAbility } from '@qimenjs/component-abilities';
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
        selectAllChecked: false,
        selectAllIndeterminate: false,
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

    _popoverInitialized: boolean = false;
    _resizeInitialized: boolean = false;

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            colName: this.colName,
        };
    }

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
        if (this.resizable) {
            this._initResize();
        }
    }

    _initResize(): void {
        if (this._resizeInitialized) return;
        this.initResize({
            edges: ['e'],
            handle: 'resizeHandle',
            emits: ['resize'],
            bridges: ['resize'],
            skipDomUpdate: true,
            minWidth: this.minWidth,
        });
        this._resizeInitialized = true;
    }

    _onSelectAllBoxClick(): void {
        if (!this.selectionAll) return;
        const checked = this.getData('selectAllChecked') ?? false;
        this.componentEmit('toggleAll', { checked: !checked });
    }

    _onReorderableOptionChange(_value: boolean): void {
        if (this.reorderable) {
            this.drag = {
                axis: 'x',
                activeClass: 'q-header-cell--dragging',
                handle: 'content',
                bridges: ['[action]'],
                actionMap: {
                    start: 'reorderStart',
                    move: 'reorderMove',
                    end: 'reorderEnd',
                },
            };
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
        if (this.resizable) {
            this._initResize();
        } else if (this._resizeInitialized) {
            this.resizable = false;
        }
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
            this.toggleCls('q_cell__checkbox--checked', false, 'selectAllBox');
            this.toggleCls('q-header-cell__select-all--indeterminate', false, 'selectAllBox');
        }
    }

    _onSelectAllCheckedOptionChange(value: boolean): void {
        this.toggleCls('q_cell__checkbox--checked', value, 'selectAllBox');
    }

    _onSelectAllIndeterminateOptionChange(value: boolean): void {
        this.toggleCls('q-header-cell__select-all--indeterminate', value, 'selectAllBox');
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
}

HeaderCellComponent.use([ResizeAbility]);
HeaderCellComponent.define(HeaderCellComponentDefs);
HeaderCellComponent.register();

export { HeaderCellComponent };
export type HeaderCellComponentInstance = InstanceType<typeof HeaderCellComponent>;
