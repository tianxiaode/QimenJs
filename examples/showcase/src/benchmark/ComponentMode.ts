import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '@qimenjs/component';
import { Definitions } from '@/composable';

export interface BenchColumnDef {
    field: string;
    title: string;
    width?: number;
}

class BenchCellA extends Component {
    static type = 'bench-cell-a';

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            classes: 'bench-cell-a',
        };
    }

    _onValueOptionChange(value: any): void {
        this.el.textContent = String(value ?? '');
    }
}

const BenchCellADefs: Definitions = {
    options: {
        value: null,
    },
} as const;

BenchCellA.define(BenchCellADefs);
BenchCellA.register();

class BenchRowA extends Component {
    static type = 'bench-row-a';
    _cellEls: HTMLDivElement[] = [];

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            classes: 'bench-row-a',
        };
    }

    onAfterInit(): void {
        const columns: BenchColumnDef[] = this.getData('columns') || [];
        const data: Record<string, any> = this.getData('data') || {};
        for (const col of columns) {
            const cell = new BenchCellA({ value: data[col.field] ?? '' });
            if (col.width) {
                cell.el.style.width = `${col.width}px`;
                cell.el.style.flexShrink = '0';
            }
            this.el.appendChild(cell.el);
            this._cellEls.push(cell.el);
        }
    }

    update(props: any): void {
        if (!props?.data) return;
        const columns: BenchColumnDef[] = this.getData('columns') || [];
        for (let i = 0; i < this._cellEls.length; i++) {
            this._cellEls[i].textContent = String(props.data[columns[i].field] ?? '');
        }
    }

    hideColumn(colIndex: number): void {
        if (this._cellEls[colIndex]) this._cellEls[colIndex].style.display = 'none';
    }

    showColumn(colIndex: number): void {
        if (this._cellEls[colIndex]) this._cellEls[colIndex].style.display = '';
    }

    moveColumn(from: number, to: number): void {
        if (from === to || from < 0 || to < 0) return;
        if (from >= this._cellEls.length || to >= this._cellEls.length) return;
        const cellEl = this._cellEls[from];
        const targetEl = this._cellEls[to];
        if (from < to) {
            this.el.insertBefore(cellEl, targetEl.nextSibling);
        } else {
            this.el.insertBefore(cellEl, targetEl);
        }
        this._cellEls.splice(from, 1);
        this._cellEls.splice(to, 0, cellEl);
    }
}

const BenchRowADefs: Definitions = {
    options: {
        columns: null,
        data: null,
    },
    fields: {
        _cellEls: [],
    },
} as const;

BenchRowA.define(BenchRowADefs);
BenchRowA.register();

class BenchTableA extends ItemGroupPooledComponent {
    static type = 'bench-table-a';
    _isAfterInit = false;

    get defaultOptions(): Record<string, any> {
        return { direction: 'vertical' };
    }

    onAfterInit(): void {
        this.addCls('bench-table-a');
        this.defaultItemType = 'bench-row-a';
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

const BenchTableADefs: Definitions = {
    options: {
        columns: null,
        benchData: null,
    },
    fields: {
        _isAfterInit: false,
    },
} as const;

BenchTableA.define(BenchTableADefs);
BenchTableA.register();

export { BenchTableA, BenchRowA, BenchCellA };
