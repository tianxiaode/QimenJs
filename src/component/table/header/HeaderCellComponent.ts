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
        draggable: false,
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

    _resizeInitialized: boolean = false;

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            colName: this.colName,
        };
    }

    onAfterInit(): void {
        super.onAfterInit();
        if (this.menuDisabled) {
            this.setStyles({ display: 'none' }, 'menuArea');
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

    _onDraggableOptionChange(_value: boolean): void {
        if (this.draggable) {
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
    }

    _onSortStateOptionChange(_value: SortState): void {
        this._applySortIcon();
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
    }

    _onHideableColumnsOptionChange(_value: any): void {}

    _onGroupableOptionChange(_value: boolean): void {}

    _onGroupFieldOptionChange(_value: string): void {}

    _onCustomMenuItemsOptionChange(_value: any): void {}

    _onSelectionAllOptionChange(value: boolean): void {
        this.setStyles({ display: value ? '' : 'none' }, 'selectAllBox');
        if (!value) {
            this.toggleCls('q-checkbox--checked', false, 'selectAllBox');
            this.toggleCls('q-checkbox--indeterminate', false, 'selectAllBox');
        }
    }

    _onSelectAllCheckedOptionChange(value: boolean): void {
        this.toggleCls('q-checkbox--checked', value, 'selectAllBox');
    }

    _onSelectAllIndeterminateOptionChange(value: boolean): void {
        this.toggleCls('q-checkbox--indeterminate', value, 'selectAllBox');
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
