import { Component } from '../../../component-core/Component';
import type { ColumnMeta } from '../column-types';
import { TextCellComponent } from '../cells/TextCellComponent';
import { Definitions } from '@/composable';
import './groupsummaryrow.css';

class GroupSummaryRowComponent extends Component {
    static type = 'q-table-group-summary-row';

    _columnMetas: ColumnMeta[] = [];
    _cells: Map<string, any> = new Map();

    get tpl(): any {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-table-row q-table-row--group-summary',
        };
    }

    onAfterInit(): void {
        this.el.style.display = 'flex';
        this._createCells();
    }

    _createCells(): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        this._columnMetas = columns;

        for (let i = 0; i < columns.length; i++) {
            const meta = columns[i];
            const cell = new TextCellComponent({ align: meta.align, format: meta.format });
            this.el.appendChild(cell.el);
            this._cells.set(meta.name, cell);
            cell.el.style.order = String((i + 1) * 10);

            if (meta.width) {
                cell.el.style.width = `var(--q-table-col-${meta.name}-width)`;
                cell.el.style.flexShrink = '0';
            }
        }
    }

    update(data: any): void {
        if (!data) return;
        for (const meta of this._columnMetas) {
            const cell = this._cells.get(meta.name);
            if (cell && typeof cell.update === 'function') {
                const value = data[meta.name];
                if (meta.groupAggregator === 'label') {
                    cell.update({ value: value ?? '' });
                } else if (value !== undefined) {
                    cell.update({ value, format: meta.format });
                } else {
                    cell.update({ value: '' });
                }
            }
        }
    }

    hideColumn(name: string): void {
        const cell = this._cells.get(name);
        if (cell) cell.el.style.display = 'none';
    }

    showColumn(name: string): void {
        const cell = this._cells.get(name);
        if (cell) cell.el.style.display = '';
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

const GroupSummaryRowComponentDefs: Definitions = {
    options: {
        columnMetas: null,
    },
    fields: {
        _columnMetas: [],
        _cells: null,
    },
} as const;

GroupSummaryRowComponent.define(GroupSummaryRowComponentDefs);

export { GroupSummaryRowComponent };
