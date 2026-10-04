import { Component } from '../../../component-core/Component';
import type { ColumnMeta, CellType } from '../column-types';
import type { DomEventsMap, ListenItem } from '@qimenjs/component-core';
import { TextCellComponent } from '../cells/TextCellComponent';
import { TreeCellComponent } from '../cells/TreeCellComponent';
import { CheckboxCellComponent } from '../cells/CheckboxCellComponent';
import { RadioCellComponent } from '../cells/RadioCellComponent';
import { ActionCellComponent } from '../cells/ActionCellComponent';
import { Definitions } from '@/composable';
import './row.css';

const CELL_CLASS_MAP: Record<CellType, any> = {
    text: TextCellComponent,
    tree: TreeCellComponent,
    checkbox: CheckboxCellComponent,
    radio: RadioCellComponent,
    action: ActionCellComponent,
};

class RowComponent extends Component {
    static type = 'table-row';

    _cells: Map<string, any> = new Map();
    _selected: boolean = false;

    listens: ListenItem[] = [
        {
            source: 'self',
            events: {
                hideColumn: 'onHideColumn',
                showColumn: 'onShowColumn',
            },
        },
    ];

    domEvents: DomEventsMap = {
        click: [{ path: 'root', handler: '_onRowClick' }],
    };

    get tpl(): any {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-table-row',
        };
    }

    onAfterInit(): void {
        this._createCells();

        const cells = Array.from(this._cells.values());
        const data = this.getData('data');
        if (data) {
            Promise.all(cells.map((c: any) => c.ready)).then(() => {
                this._doUpdate(data);
            });
        }
    }
    
_createCells(): void {
    if (this._cells.size > 0) return;

    const columns: ColumnMeta[] = this.getData('columnMetas') || [];

    for (let i = 0; i < columns.length; i++) {
        const meta = columns[i];
        const cell = this._createCell(meta, i);
        this.el!.appendChild(cell.el);
        this._cells.set(meta.name, cell);
    }
}

_createCell(meta: ColumnMeta, index: number): any {
    const CellClass = CELL_CLASS_MAP[meta.cellType] || TextCellComponent;
    const options: Record<string, any> = {
        align: meta.align,
        colName: meta.name,
        fixed: meta.fixed ?? null,
        order: `var(--q-table-col-${meta.name}-order)`,
    };
    if (meta.width) {
        options.width = `var(--q-table-col-${meta.name}-width)`;
        options.minWidth = '0';
    }
    if (meta.format && meta.cellType === 'text') {
        options.format = meta.format;
    }
    if (meta.selection) {
        options.controlled = true;
    }
    const cell = new CellClass(options);
    return cell;
}

    update(props: any): void {
        const metas = props?.columnMetas;
        if (Array.isArray(metas)) {
            this.setData('columnMetas', metas, true);
        }
        if (props?.data) {
            this._doUpdate(props.data);
        } else if (Array.isArray(metas)) {
            this._rebuildCellsIfChanged();
        }
    }

    _doUpdate(data: any): void {
        this._rebuildCellsIfChanged();

        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        for (const meta of columns) {
            const cell = this._cells.get(meta.name);
            if (cell && typeof cell.update === 'function') {
                cell.update(this._getCellData(meta, data));
            }
        }
    }

    _rebuildCellsIfChanged(): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        const cellKeys = Array.from(this._cells.keys());

        if (cellKeys.length !== columns.length) {
            this._rebuildCells(columns);
            return;
        }

        const keySet = new Set(cellKeys);
        for (const col of columns) {
            if (!keySet.has(col.name)) {
                this._rebuildCells(columns);
                return;
            }
        }
    }

    _rebuildCells(columns: ColumnMeta[]): void {
        for (const cell of this._cells.values()) {
            cell.el?.remove?.();
        }
        this._cells.clear();
        for (let i = 0; i < columns.length; i++) {
            const meta = columns[i];
            const cell = this._createCell(meta, i);
            this.el!.appendChild(cell.el);
            this._cells.set(meta.name, cell);
        }
    }

    _getCellData(meta: ColumnMeta, data: any): any {
        const value = this._getFieldValue(data, meta.field);
        switch (meta.cellType) {
            case 'tree':
                return {
                    value,
                    depth: data._depth ?? 0,
                    leaf: data._leaf ?? true,
                    expanded: data._expanded,
                };
            case 'checkbox':
            case 'radio':
                if (meta.selection) {
                    return { checked: this._selected, disabled: !!data._selectDisabled };
                }
                return { checked: !!value };
            case 'action':
                return { actions: value };
            default:
                return { value, format: meta.format };
        }
    }

    _getFieldValue(obj: any, path: string): any {
        if (!obj) return undefined;
        const keys = path.split('.');
        let val = obj;
        for (const key of keys) {
            val = val?.[key];
            if (val === undefined) break;
        }
        return val;
    }

    hideColumn(name: string): void {
        const cell = this._cells.get(name);
        if (cell) cell.hidden = true;
    }

    showColumn(name: string): void {
        const cell = this._cells.get(name);
        if (cell) cell.hidden = false;
    }

    onHideColumn(data: any): void {
        this.hideColumn(data.colName);
    }

    onShowColumn(data: any): void {
        this.showColumn(data.colName);
    }

    setColumnOrder(name: string, order: number): void {
    }

    moveColumn(from: number, to: number): void {
    }

    _onSelectableOptionChange(value: string): void {
        this.toggleCls('q-table-row--selectable', value !== 'none');
    }

    /**
     * 行点击 — 选择模式下触发行选择
     *
     * selectable 为 none 或该行 _selectDisabled 时忽略。
     * 选择列 checkbox/radio 的点击也冒泡到行，统一由此处理。
     */
    _onRowClick(_domEvt: any): void {
        if (this.selectable === 'none') return;
        const data = this.getData('data');
        if (!data || data._selectDisabled) return;
        this.componentEmit('rowSelect', { key: data._rowKey, data });
    }

    /**
     * 设置行选中状态 — 由 Table 在 selectionChange 后同步
     *
     * 切换选中样式，并同步选择列 checkbox/radio 的 checked。
     */
    setRowSelected(selected: boolean): void {
        this._selected = selected;
        this.toggleCls('q-table-row--selected', selected);
        this._syncSelectCell();
    }

    _syncSelectCell(): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        for (const meta of columns) {
            if (!meta.selection) continue;
            const cell = this._cells.get(meta.name);
            if (!cell) continue;
            const data = this.getData('data');
            Promise.resolve(cell.ready).then(() => {
                cell.update({ checked: this._selected, disabled: !!data?._selectDisabled });
            });
        }
    }
}

const RowComponentDefs: Definitions = {
    options: {
        display: 'flex',
        columnMetas: null,
        data: null,
        eventKey: null,
        entityKey: null,
        selectable: 'none',
    },
    fields: {
        _cells: null,
        _selected: false,
    },
} as const;

RowComponent.define(RowComponentDefs);
RowComponent.register();

export { RowComponent };
