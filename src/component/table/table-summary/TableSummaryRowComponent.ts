import { Component } from '../../../component-core/Component';
import type { ColumnMeta } from '../column-types';
import type { ListenItem } from '@qimenjs/component-core';
import { TABLE_SUMMARY_ROW_TYPE } from '../constants';
import { TextCellComponent } from '../cells/TextCellComponent';
import { Definitions } from '@/composable';
import './tablesummaryrow.css';

class TableSummaryRowComponent extends Component {
    static type = TABLE_SUMMARY_ROW_TYPE;

    _cells: Map<string, any> = new Map();

    listens: ListenItem[] = [
        {
            source: 'self',
            events: {
                hideColumn: 'onHideColumn',
                showColumn: 'onShowColumn',
            },
        },
    ];

    get tpl(): any {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-table-row q-table-row--table-summary',
        };
    }

    onAfterInit(): void {
        this._createCells();
    }

    _createCells(): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];

        for (let i = 0; i < columns.length; i++) {
            const meta = columns[i];
            const cell = this._createCell(meta, i);
            this.el!.appendChild(cell.el);
            this._cells.set(meta.name, cell);
        }
    }

    _createCell(meta: ColumnMeta, index: number): any {
        const options: Record<string, any> = {
            align: meta.align,
            colName: meta.name,
            fixed: meta.fixed ?? null,
            order: (index + 1) * 10,
        };
        if (meta.width) {
            options.width = `var(--q-table-col-${meta.name}-width)`;
            options.minWidth = '0';
        }
        if (meta.format) {
            options.format = meta.format;
        }
        return new TextCellComponent(options);
    }

    update(data: any): void {
        if (!data) return;
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        for (const meta of columns) {
            const cell = this._cells.get(meta.name);
            if (cell && typeof cell.update === 'function') {
                const value = this._getFieldValue(data, meta.field);
                cell.update({ value, format: meta.format });
            }
        }
    }

    _getFieldValue(obj: any, path: string): any {
        if (!obj || !path) return undefined;
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

    moveColumn(from: number, to: number): void {
        if (from === to || from < 0 || to < 0) return;
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        if (from >= columns.length || to >= columns.length) return;
        const fromName = columns[from].name;
        const toName = columns[to].name;
        const fromCell = this._cells.get(fromName);
        const toCell = this._cells.get(toName);
        if (fromCell && toCell) {
            const fromOrder = fromCell.getData('order');
            const toOrder = toCell.getData('order');
            fromCell.setData('order', toOrder);
            toCell.setData('order', fromOrder);
        }
    }
}

const TableSummaryRowComponentDefs: Definitions = {
    options: {
        display: 'flex',
        columnMetas: null,
    },
    fields: {
        _cells: null,
    },
} as const;

TableSummaryRowComponent.define(TableSummaryRowComponentDefs);
TableSummaryRowComponent.register();

export { TableSummaryRowComponent };
