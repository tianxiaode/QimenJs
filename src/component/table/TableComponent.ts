import type { TemplateDecl } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '@qimenjs/component';
import { ColumnMetaManager } from './engine/ColumnMetaManager';
import { TableHeaderComponent } from './header/TableHeaderComponent';
import { RowComponent } from './row/RowComponent';
import type { ColumnDefOrGroup, ColumnMeta } from './column-types';
import { DictionaryManager } from '@/entity';
import { createEntityManager } from '@/entity';
import type { BaseEntityManager } from '@/entity';
import { ENTITY_LIST_EVENTS } from '@/events';
import { Definitions } from '@/composable';

class TableComponent extends ItemGroupPooledComponent {
    static type = 'q-table';
    _isAfterInit = false;
    _columnMetaManager: ColumnMetaManager | null = null;
    _header: TableHeaderComponent | null = null;
    _entity: BaseEntityManager | null = null;

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

        this._ensureEntity();

        const headerArea = this.getNodeEl('headerArea');
        if (headerArea) {
            const columns = this.getData('columns') || [];
            this._header = new TableHeaderComponent({ columns });
            headerArea.appendChild(this._header.el);
            this._bindHeaderEvents();
        }

        this._isAfterInit = true;
        this._reflow();
    }

    _ensureEntity(): void {
        if (this._entity) return;
        const entityConfig = this.getData('entity');
        if (entityConfig) {
            if (typeof entityConfig.sort === 'function') {
                this._entity = entityConfig;
            } else {
                this._entity = createEntityManager(entityConfig);
            }
        } else {
            const data = this.getData('data') || [];
            this._entity = new DictionaryManager({ data });
        }
        this._bindEntityEvents();
    }

    _bindEntityEvents(): void {
        if (!this._entity) return;
        this._entity.on(ENTITY_LIST_EVENTS.LISTED, () => {
            if (this._isAfterInit) this._reflow();
        });
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
        this._header.on('showColumn', (data: any) => {
            this.showColumn(data.colName);
        });
        this._header.on('groupBy', (data: any) => {
            this.emit('groupBy', data);
        });
    }

    _onSortChange(colName: string, direction: 'asc' | 'desc' | null): void {
        if (this._entity) {
            const entity = this._entity as any;
            if (direction) {
                entity.sort(colName, direction);
            } else {
                entity.sort(colName, 'asc');
                entity.sort(colName, 'asc');
            }
        }
    }

    _onColumnResize(colName: string, width: number): void {
        this.el!.style.setProperty(`--q-table-col-${colName}-width`, `${width}px`);
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

    _onDataOptionChange(data: Record<string, any>[]): void {
        if (this._entity) {
            this._entity.setData('data', data);
        }
        if (this._isAfterInit) {
            this._reflow();
        }
    }

    _onEntityOptionChange(value: any): void {
        if (!value) return;
        if (typeof value.sort === 'function') {
            this._entity = value;
        } else {
            this._entity = createEntityManager(value);
        }
        this._bindEntityEvents();
    }

    _reflow(): void {
        const columns = this.getData('columns') || [];
        if (columns.length === 0) return;

        if (!this._columnMetaManager) {
            this._columnMetaManager = new ColumnMetaManager();
            this._columnMetaManager.compile(columns);
        }

        this._applyColumnWidths();

        const metas = this._columnMetaManager.getAll();
        this.defaultItemOption = { columnMetas: metas };

        const data = this._entity?.items ?? this.getData('data') ?? [];
        const items = data.map((rowData: any) => ({ data: rowData }));
        super.setItems(items);
    }

    _applyColumnWidths(): void {
        if (!this._columnMetaManager) return;
        const metas = this._columnMetaManager.getAll();
        for (const meta of metas) {
            if (meta.width) {
                this.el!.style.setProperty(`--q-table-col-${meta.name}-width`, meta.width);
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
        entity: null,
    },
    fields: {
        _isAfterInit: false,
        _columnMetaManager: null,
        _header: null,
        _entity: null,
    },
} as const;

TableComponent.define(TableComponentDefs);
TableComponent.register();

export { TableComponent };
