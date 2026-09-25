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
    static type = 'q-table-row';

    _columnMetas: ColumnMeta[] = [];
    _cells: Map<string, any> = new Map();

    get tpl(): any {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-table-row',
        };
    }

    onAfterInit(): void {
        this.el.style.display = 'flex';
        this._createCells();

        const cells = Array.from(this._cells.values());
        const data = this.getData('data');
        Promise.all(cells.map((c: any) => c.ready)).then(() => {
            this._applyWidths();
            if (data) {
                this._doUpdate(data);
            }
        });
    }

    _createCells(): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        this._columnMetas = columns;

        for (let i = 0; i < columns.length; i++) {
            const meta = columns[i];
            const cell = this._createCell(meta);
            this.el.appendChild(cell.el);
            this._cells.set(meta.name, cell);
            cell.el.style.order = String((i + 1) * 10);
        }
    }

    _createCell(meta: ColumnMeta): any {
        const CellClass = CELL_CLASS_MAP[meta.cellType] || TextCellComponent;
        const options: Record<string, any> = { align: meta.align };
        if (meta.format && meta.cellType === 'text') {
            options.format = meta.format;
        }
        return new CellClass(options);
    }

    _applyWidths(): void {
        for (const meta of this._columnMetas) {
            const cell = this._cells.get(meta.name);
            if (cell?.el && meta.width) {
                cell.el.style.width = `var(--q-table-col-${meta.name}-width)`;
                cell.el.style.minWidth = '0';
                cell.el.style.flexShrink = '0';
                cell.el.style.overflow = 'hidden';
                cell.el.style.boxSizing = 'border-box';
            }
        }
    }

    update(props: any): void {
        if (!props?.data) return;
        this._doUpdate(props.data);
    }

    _doUpdate(data: any): void {
        for (const meta of this._columnMetas) {
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
        if (cell) cell.el.style.display = 'none';
    }

    showColumn(name: string): void {
        const cell = this._cells.get(name);
        if (cell) cell.el.style.display = '';
    }

    setColumnOrder(name: string, order: number): void {
        const cell = this._cells.get(name);
        if (cell) cell.el.style.order = String(order);
    }

    moveColumn(from: number, to: number): void {
        if (from === to || from < 0 || to < 0) return;
        if (from >= this._columnMetas.length || to >= this._columnMetas.length) return;
        const fromName = this._columnMetas[from].name;
        const toName = this._columnMetas[to].name;
        const fromCell = this._cells.get(fromName);
        const toCell = this._cells.get(toName);
        if (fromCell && toCell) {
            const fromOrder = fromCell.el.style.order;
            const toOrder = toCell.el.style.order;
            fromCell.el.style.order = toOrder;
            toCell.el.style.order = fromOrder;
        }
    }
}

const RowComponentDefs: Definitions = {
    options: {
        columnMetas: null,
        data: null,
    },
    fields: {
        _columnMetas: [],
        _cells: null,
    },
} as const;

RowComponent.define(RowComponentDefs);
RowComponent.register();

export { RowComponent };
