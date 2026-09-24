import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '@qimenjs/component';
import { Definitions } from '@/composable';
import type { BenchColumnDef } from './ComponentMode';

class BenchRowB extends Component {
    static type = 'bench-row-b';
    _tds: HTMLTableCellElement[] = [];

    get tpl(): TemplateDecl {
        return {
            tag: 'tr',
            name: 'root',
            classes: 'bench-row-b',
        };
    }

    onAfterInit(): void {
        const columns: BenchColumnDef[] = this.getData('columns') || [];
        const data: Record<string, any> = this.getData('data') || {};
        const tr = this.el as HTMLTableRowElement;
        for (const col of columns) {
            const td = document.createElement('td');
            td.className = 'bench-td-b';
            if (col.width) {
                td.style.width = `${col.width}px`;
            }
            td.textContent = String(data[col.field] ?? '');
            tr.appendChild(td);
            this._tds.push(td);
        }
    }

    update(props: any): void {
        if (!props?.data) return;
        const columns: BenchColumnDef[] = this.getData('columns') || [];
        for (let i = 0; i < this._tds.length; i++) {
            this._tds[i].textContent = String(props.data[columns[i].field] ?? '');
        }
    }

    hideColumn(colIndex: number): void {
        if (this._tds[colIndex]) this._tds[colIndex].style.display = 'none';
    }

    showColumn(colIndex: number): void {
        if (this._tds[colIndex]) this._tds[colIndex].style.display = '';
    }

    moveColumn(from: number, to: number): void {
        if (from === to || from < 0 || to < 0) return;
        if (from >= this._tds.length || to >= this._tds.length) return;
        const tr = this.el as HTMLTableRowElement;
        const td = this._tds[from];
        const targetTd = this._tds[to];
        if (from < to) {
            tr.insertBefore(td, targetTd.nextSibling);
        } else {
            tr.insertBefore(td, targetTd);
        }
        this._tds.splice(from, 1);
        this._tds.splice(to, 0, td);
    }
}

const BenchRowBDefs: Definitions = {
    options: {
        columns: null,
        data: null,
    },
    fields: {
        _tds: [],
    },
} as const;

BenchRowB.define(BenchRowBDefs);
BenchRowB.register();

class BenchTableB extends ItemGroupPooledComponent {
    static type = 'bench-table-b';
    _isAfterInit = false;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-itemgroup bench-table-b',
            children: [
                { tag: 'div', name: 'overflowPrev', classes: 'q-itemgroup__overflow-prev hidden' },
                { tag: 'table', name: 'table', classes: 'bench-table-b__table', children: [
                    { tag: 'tbody', name: 'itemContainer', classes: 'q-itemgroup__items' },
                ]},
                { tag: 'div', name: 'overflowNext', classes: 'q-itemgroup__overflow-next hidden' },
                { tag: 'div', name: 'overflowMore', classes: 'q-itemgroup__overflow-more hidden' },
            ],
        };
    }

    get defaultOptions(): Record<string, any> {
        return { direction: 'vertical' };
    }

    onAfterInit(): void {
        this.defaultItemType = 'bench-row-b';
        super.onAfterInit();
        this._isAfterInit = true;
        this._benchReflow();
    }

    _onColumnsOptionChange(_value: BenchColumnDef[]): void {
    }

    _onBenchDataOptionChange(_value: Record<string, any>[]): void {
        if (this._isAfterInit) {
            this._benchReflow();
        }
    }

    _benchReflow(): void {
        const data = this.getData('benchData') || [];
        const columns = this.getData('columns') || [];
        if (data.length === 0) return;
        this.defaultItemOption = { columns };
        const items = data.map(rowData => ({ data: rowData }));
        super.setItems(items);
    }

    hideColumn(colIndex: number): void {
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const row of items) {
            if (typeof row.hideColumn === 'function') row.hideColumn(colIndex);
        }
    }

    showColumn(colIndex: number): void {
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const row of items) {
            if (typeof row.showColumn === 'function') row.showColumn(colIndex);
        }
    }

    moveColumn(from: number, to: number): void {
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const row of items) {
            if (typeof row.moveColumn === 'function') row.moveColumn(from, to);
        }
    }
}

const BenchTableBDefs: Definitions = {
    options: {
        columns: null,
        benchData: null,
    },
    fields: {
        _isAfterInit: false,
    },
} as const;

BenchTableB.define(BenchTableBDefs);
BenchTableB.register();

export { BenchTableB, BenchRowB };
