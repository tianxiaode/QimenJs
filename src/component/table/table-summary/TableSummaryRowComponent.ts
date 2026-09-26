import { Component } from '../../../component-core/Component';
import type { ColumnMeta } from '../column-types';
import { TextCellComponent } from '../cells/TextCellComponent';
import { Definitions } from '@/composable';
import './tablesummaryrow.css';

class TableSummaryRowComponent extends Component {
    static type = 'q-table-summary-row';

    _cells: Map<string, any> = new Map();

    get tpl(): any {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-table-row q-table-row--table-summary',
        };
    }

    onAfterInit(): void {
        this.el.style.display = 'flex';
        this._createCells();
    }

    _createCells(): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];

        for (let i = 0; i < columns.length; i++) {
            const meta = columns[i];
            const cell = new TextCellComponent({ align: meta.align, format: meta.format });
            this.el.appendChild(cell.el);
            this._cells.set(meta.name, cell);
            cell.order = (i + 1) * 10;

            if (meta.width) {
                cell.el.style.width = `var(--q-table-col-${meta.name}-width)`;
                cell.el.style.flexShrink = '0';
            }
        }
    }

    update(data: any): void {
        if (!data) return;
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        for (const meta of columns) {
            const cell = this._cells.get(meta.name);
            if (cell && typeof cell.update === 'function') {
                const value = data[meta.name];
                if (value !== undefined) {
                    cell.update({ value, format: meta.format });
                } else {
                    cell.update({ value: '' });
                }
            }
        }
    }

    hideColumn(name: string): void {
        const cell = this._cells.get(name);
        if (cell) cell.hidden = true;
    }

    showColumn(name: string): void {
        const cell = this._cells.get(name);
        if (cell) cell.hidden = false;
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

const TableSummaryRowComponentDefs: Definitions = {
    options: {
        columnMetas: null,
    },
    fields: {
        _cells: null,
    },
} as const;

TableSummaryRowComponent.define(TableSummaryRowComponentDefs);

export { TableSummaryRowComponent };
