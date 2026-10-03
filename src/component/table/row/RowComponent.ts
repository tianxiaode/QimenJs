import { Component } from '../../../component-core/Component';
import type { ColumnMeta, CellType } from '../column-types';
import type { ListenItem } from '@qimenjs/component-core';
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
        return new CellClass(options);
    }

    update(props: any): void {
        if (!props?.data) return;
        const metas = props.columnMetas;
        if (Array.isArray(metas)) {
            this.setData('columnMetas', metas, true);
        }
        this._doUpdate(props.data);
    }

    _doUpdate(data: any): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        const cellNames = new Set(this._cells.keys());
        const metaNames = new Set(columns.map(m => m.name));

        let needsRebuild = false;
        if (cellNames.size !== metaNames.size) {
            needsRebuild = true;
        } else {
            for (const name of metaNames) {
                if (!cellNames.has(name)) {
                    needsRebuild = true;
                    break;
                }
            }
        }

        if (needsRebuild) {
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
    }

    moveColumn(from: number, to: number): void {
    }
}

const RowComponentDefs: Definitions = {
    options: {
        display: 'flex',
        columnMetas: null,
        data: null,
        eventKey: null,
        entityKey: null,
    },
    fields: {
        _cells: null,
    },
} as const;

RowComponent.define(RowComponentDefs);
RowComponent.register();

export { RowComponent };
