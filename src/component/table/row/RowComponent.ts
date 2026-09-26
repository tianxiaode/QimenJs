import { Component } from '../../../component-core/Component';
import type { ColumnMeta, CellType } from '../column-types';
import { TextCellComponent } from '../cells/TextCellComponent';
import { TreeCellComponent } from '../cells/TreeCellComponent';
import { CheckboxCellComponent } from '../cells/CheckboxCellComponent';
import { ActionCellComponent } from '../cells/ActionCellComponent';
import { Definitions } from '@/composable';
import './row.css';

const CELL_CLASS_MAP: Record<CellType, any> = {
    text: TextCellComponent,
    tree: TreeCellComponent,
    checkbox: CheckboxCellComponent,
    action: ActionCellComponent,
};

class RowComponent extends Component {
    static type = 'table-row';

    _cells: Map<string, any> = new Map();

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
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];

        for (let i = 0; i < columns.length; i++) {
            const meta = columns[i];
            const cell = this._createCell(meta);
            this.el!.appendChild(cell.el);
            this._cells.set(meta.name, cell);
            cell.order = (i + 1) * 10;
        }
    }

    _createCell(meta: ColumnMeta): any {
        const CellClass = CELL_CLASS_MAP[meta.cellType] || TextCellComponent;
        const options: Record<string, any> = {
            align: meta.align,
            colName: meta.name,
            fixed: meta.fixed ?? null,
        };
        if (meta.width) {
            options.width = `var(--q-table-col-${meta.name}-width)`;
            options.minWidth = '0';
        }
        if (meta.format && meta.cellType === 'text') {
            options.format = meta.format;
        }
        return new CellClass(options);
    }

    update(props: any): void {
        if (!props?.data) return;
        this._doUpdate(props.data);
    }

    _doUpdate(data: any): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        for (const meta of columns) {
            const cell = this._cells.get(meta.name);
            if (cell && typeof cell.update === 'function') {
                cell.update(this._getCellData(meta, data));
            }
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
        const cell = this._cells.get(name);
        if (cell) cell.order = order;
    }

    moveColumn(from: number, to: number): void {
        if (from === to || from < 0 || to < 0) return;
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        if (from >= columns.length || to >= columns.length) return;
        const fromName = columns[from].name;
        const toName = columns[to].name;
        const fromCell = this._cells.get(fromName);
        const toCell = this._cells.get(toName);
        if (fromCell && toCell) {
            const fromOrder = fromCell.order;
            const toOrder = toCell.order;
            fromCell.order = toOrder;
            toCell.order = fromOrder;
        }
    }
}

const RowComponentDefs: Definitions = {
    options: {
        display: 'flex',
        columnMetas: null,
        data: null,
        eventKey: null,
        listens: [
            {
                source: 'self',
                events: {
                    hideColumn: 'onHideColumn',
                    showColumn: 'onShowColumn',
                },
            },
        ],
    },
    fields: {
        _cells: null,
    },
} as const;

RowComponent.define(RowComponentDefs);
RowComponent.register();

export { RowComponent };
