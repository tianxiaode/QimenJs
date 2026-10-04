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
        if (this._pendingData) {
            this.update(this._pendingData);
            this._pendingData = null;
        }
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

    _createCell(meta: ColumnMeta, _index: number): any {
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
        if (meta.format) {
            options.format = meta.format;
        }
        return new TextCellComponent(options);
    }

    update(data: any): void {
        if (!data) return;
        if (this._cells.size === 0) {
            this._pendingData = data;
            return;
        }
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

    moveColumn(_from: number, _to: number): void {}
}

const TableSummaryRowComponentDefs: Definitions = {
    options: {
        display: 'flex',
        columnMetas: null,
    },
    fields: {
        _cells: null,
        _pendingData: null,
    },
} as const;

TableSummaryRowComponent.define(TableSummaryRowComponentDefs);
TableSummaryRowComponent.register();

export { TableSummaryRowComponent };
