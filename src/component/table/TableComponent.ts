import type { TemplateDecl } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '@qimenjs/component';
import { ColumnMetaManager } from './engine/ColumnMetaManager';
import { HeaderComponent } from './header/HeaderComponent';
import { RowComponent } from './row/RowComponent';
import type { ColumnDefOrGroup, ColumnMeta } from './column-types';
import { Definitions } from '@/composable';

class TableComponent extends ItemGroupPooledComponent {
    static type = 'q-table';
    _isAfterInit = false;
    _columnMetaManager: ColumnMetaManager | null = null;
    _header: HeaderComponent | null = null;
    _sortCol: string | null = null;
    _sortDir: 'asc' | 'desc' | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-table',
            children: [
                { tag: 'div', name: 'headerArea', classes: 'q-table__header-area' },
                { tag: 'div', name: 'overflowPrev', classes: 'q-itemgroup__overflow-prev hidden' },
                { tag: 'div', name: 'itemContainer', classes: 'q-table__body' },
                { tag: 'div', name: 'overflowNext', classes: 'q-itemgroup__overflow-next hidden' },
                { tag: 'div', name: 'overflowMore', classes: 'q-itemgroup__overflow-more hidden' },
            ],
        };
    }

    get defaultOptions(): Record<string, any> {
        return { direction: 'vertical' };
    }

    onAfterInit(): void {
        this.defaultItemType = 'q-table-row';
        super.onAfterInit();

        const headerArea = this.getNodeEl('headerArea');
        if (headerArea) {
            const columns = this.getData('columns') || [];
            this._header = new HeaderComponent({ columns });
            headerArea.appendChild(this._header.el);
            this._bindHeaderEvents();
        }

        this._isAfterInit = true;
        this._reflow();
    }

    _bindHeaderEvents(): void {
        if (!this._header) return;
        this._header.on('sortChange', (data: any) => {
            this._onSortChange(data.colName, data.direction);
        });
        this._header.on('resize', (data: any) => {
            this._onColumnResize(data.colName, data.width);
        });
        this._header.on('hideColumn', (data: any) => {
            this.hideColumn(data.colName);
        });
    }

    _onSortChange(colName: string, direction: 'asc' | 'desc' | null): void {
        this._sortCol = direction ? colName : null;
        this._sortDir = direction;

        const data = this.getData('data') || [];
        if (direction && data.length > 0) {
            const sorted = [...data].sort((a: any, b: any) => {
                const meta = this._columnMetaManager?.get(colName);
                const field = meta?.field || colName;
                const av = a[field];
                const bv = b[field];
                if (av == null && bv == null) return 0;
                if (av == null) return direction === 'asc' ? -1 : 1;
                if (bv == null) return direction === 'asc' ? 1 : -1;
                if (typeof av === 'number' && typeof bv === 'number') {
                    return direction === 'asc' ? av - bv : bv - av;
                }
                const cmp = String(av).localeCompare(String(bv));
                return direction === 'asc' ? cmp : -cmp;
            });
            this.setData('data', sorted, true);
        }

        this._reflow();
    }

    _onColumnResize(colName: string, width: number): void {
        this.el.style.setProperty(`--q-table-col-${colName}-width`, `${width}px`);
        if (this._columnMetaManager) {
            const meta = this._columnMetaManager.get(colName);
            if (meta) meta.width = `${width}px`;
        }
    }

    _onColumnsOptionChange(columns: ColumnDefOrGroup[]): void {
        if (!this._columnMetaManager) {
            this._columnMetaManager = new ColumnMetaManager();
        }
        this._columnMetaManager.compile(columns);
        this._applyColumnWidths();
        if (this._isAfterInit) {
            this._disposeAllItems();
            this._reflow();
        }
    }

    _onDataOptionChange(_data: Record<string, any>[]): void {
        if (this._isAfterInit) {
            this._reflow();
        }
    }

    _reflow(): void {
        const data = this.getData('data') || [];
        const columns = this.getData('columns') || [];
        if (columns.length === 0) return;

        if (!this._columnMetaManager) {
            this._columnMetaManager = new ColumnMetaManager();
            this._columnMetaManager.compile(columns);
        }

        this._applyColumnWidths();

        const metas = this._columnMetaManager.getAll();
        this.defaultItemOption = { columnMetas: metas };

        const items = data.map(rowData => ({ data: rowData }));
        super.setItems(items);
    }

    _applyColumnWidths(): void {
        if (!this._columnMetaManager) return;
        const metas = this._columnMetaManager.getAll();
        for (const meta of metas) {
            if (meta.width) {
                this.el.style.setProperty(`--q-table-col-${meta.name}-width`, meta.width);
            }
        }
    }

    _disposeAllItems(): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const item of items) {
                if (typeof item.dispose === 'function') item.dispose();
            }
            items.length = 0;
        }
        if (Array.isArray(this._hiddenItems)) {
            for (const item of this._hiddenItems) {
                if (typeof item.dispose === 'function') item.dispose();
            }
            this._hiddenItems.length = 0;
        }
    }

    hideColumn(name: string): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const row of items) {
                if (typeof row.hideColumn === 'function') row.hideColumn(name);
            }
        }
        if (this._header && typeof this._header.hideColumn === 'function') {
            this._header.hideColumn(name);
        }
    }

    showColumn(name: string): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const row of items) {
                if (typeof row.showColumn === 'function') row.showColumn(name);
            }
        }
        if (this._header && typeof this._header.showColumn === 'function') {
            this._header.showColumn(name);
        }
    }

    moveColumn(from: number, to: number): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const row of items) {
                if (typeof row.moveColumn === 'function') row.moveColumn(from, to);
            }
        }
        if (this._header && typeof this._header.moveColumn === 'function') {
            this._header.moveColumn(from, to);
        }
    }
}

const TableComponentDefs: Definitions = {
    options: {
        columns: null,
        data: null,
    },
    fields: {
        _isAfterInit: false,
        _columnMetaManager: null,
        _header: null,
        _sortCol: null,
        _sortDir: null,
    },
} as const;

TableComponent.define(TableComponentDefs);
TableComponent.register();

export { TableComponent };
