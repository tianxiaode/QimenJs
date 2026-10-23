import { Component } from '../../../component-core/Component';
import type { ColumnMeta, CellType } from '../column-types';
import type { ListenItem } from '@qimenjs/component-core';
import { TextCellComponent } from '../cells/TextCellComponent';
import { TreeCellComponent } from '../cells/TreeCellComponent';
import { CheckboxCellComponent } from '../cells/CheckboxCellComponent';
import { RadioCellComponent } from '../cells/RadioCellComponent';
import { ActionCellComponent } from '../cells/ActionCellComponent';
import { RowNumberCellComponent } from '../cells/RowNumberCellComponent';
import { ExpandCellComponent } from '../cells/ExpandCellComponent';
import { Definitions } from '@/composable';
import './row.css';

const CELL_CLASS_MAP: Record<CellType, any> = {
    text: TextCellComponent,
    tree: TreeCellComponent,
    checkbox: CheckboxCellComponent,
    radio: RadioCellComponent,
    action: ActionCellComponent,
    rownumber: RowNumberCellComponent,
    expand: ExpandCellComponent,
};

class RowComponent extends Component {
    static type = 'table-row';

    _cells: Map<string, any> | null;
    _bodyEl: HTMLElement | null;
    _bodyExpanded: boolean;
    _bodyContent: any;

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
        if (!this._cells) this._cells = new Map();
        if (this._cells.size > 0) return;

        const columns: ColumnMeta[] = this.getData('columnMetas') || [];

        for (let i = 0; i < columns.length; i++) {
            const meta = columns[i];
            const cell = this._createCell(meta, i);
            this.el!.appendChild(cell.el);
            this._cells.set(meta.name, cell);
        }
    }

    _createCell(meta: ColumnMeta, _index: number): any {
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
        const cell = new CellClass(options);
        cell.el!.dataset.colName = meta.name;

        if (meta.flex && meta.flex > 0) {
            const basis = meta.width ? `var(--q-table-col-${meta.name}-width)` : '0px';
            cell.el.style.flex = `${meta.flex} 1 ${basis}`;
            cell.el.style.minWidth = '0';
        }

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
            const cell = this._cells?.get(meta.name);
            if (cell && typeof cell.update === 'function') {
                cell.update(this._getCellData(meta, data));
            }
        }
    }

    _rebuildCellsIfChanged(): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        const cellKeys = Array.from(this._cells?.keys() ?? []);

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
        if (!this._cells) this._cells = new Map();
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
                    return { checked: this.selected, disabled: !!data._selectDisabled };
                }
                return { checked: !!value };
            case 'action':
                return { actions: value };
            case 'rownumber':
                return { value: data._rowNumber ?? 0 };
            case 'expand':
                return { expanded: this._bodyExpanded };
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
        const cell = this._cells?.get(name);
        if (cell) cell.hidden = true;
    }

    showColumn(name: string): void {
        const cell = this._cells?.get(name);
        if (cell) cell.hidden = false;
    }

    onHideColumn(data: any): void {
        this.hideColumn(data.colName);
    }

    onShowColumn(data: any): void {
        this.showColumn(data.colName);
    }

    expand(): void {
        if (this._bodyExpanded) return;
        this._bodyExpanded = true;
        this._syncExpandCellState();
        this._createBodyEl();
        this.componentEmit('rowExpand', {
            rowKey: this.getData('data')?._rowKey,
            rowData: this.getData('data'),
            index: this.getData('data')?._rowNumber,
        });
    }

    collapse(): void {
        if (!this._bodyExpanded) return;
        this._bodyExpanded = false;
        this._syncExpandCellState();
        this._destroyBodyEl();
        this.componentEmit('rowCollapse', {
            rowKey: this.getData('data')?._rowKey,
            rowData: this.getData('data'),
            index: this.getData('data')?._rowNumber,
        });
    }

    _syncExpandCellState(): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        for (const meta of columns) {
            if (meta.cellType !== 'expand') continue;
            const cell = this._cells?.get(meta.name);
            if (cell) {
                Promise.resolve(cell.ready).then(() => {
                    cell.update({ expanded: this._bodyExpanded });
                });
            }
        }
    }

    _createBodyEl(): void {
        if (this._bodyEl) return;
        this._bodyEl = document.createElement('div');
        this._bodyEl.className = 'q-table-row__body';
        this._bodyEl.style.order = String((this.order ?? 0) + 1);
        if (this.el?.parentNode) {
            this.el.parentNode.insertBefore(this._bodyEl, this.el.nextSibling);
        }
    }

    _destroyBodyEl(): void {
        if (this._bodyContent?.dispose) {
            this._bodyContent.dispose();
        }
        this._bodyContent = null;
        if (this._bodyEl) {
            this._bodyEl.remove();
            this._bodyEl = null;
        }
    }

    setBodyContent(content: any): void {
        if (this._bodyContent && typeof this._bodyContent.dispose === 'function') {
            this._bodyContent.dispose();
        }
        this._bodyContent = content;
        if (this._bodyEl) {
            this._bodyEl.innerHTML = '';
            if (content?.el) {
                this._bodyEl.appendChild(content.el);
            }
        }
    }

    get bodyEl(): HTMLElement | null {
        return this._bodyEl;
    }

    get isExpanded(): boolean {
        return this._bodyExpanded;
    }

    setColumnOrder(_name: string, _order: number): void {}

    moveColumn(_from: number, _to: number): void {}

    _onSelectableOptionChange(value: string): void {
        this.toggleCls('q-table-row--selectable', value !== 'none');
    }

    _onSelectedOptionChange(value: boolean): void {
        this.toggleCls('q-table-row--selected', value);
        this._syncSelectCellChecked();
    }

    _syncSelectCellChecked(): void {
        if (!this._cells) return;
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        const data = this.getData('data');
        for (const meta of columns) {
            if (!meta.selection) continue;
            const cell = this._cells.get(meta.name);
            if (!cell) continue;
            Promise.resolve(cell.ready).then(() => {
                cell.update({ checked: this.selected, disabled: !!data?._selectDisabled });
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
        selected: false,
    },
    fields: {
        _cells: null,
        _bodyEl: null,
        _bodyExpanded: false,
        _bodyContent: null,
    },
} as const;

RowComponent.define(RowComponentDefs);
RowComponent.register();

export { RowComponent };
