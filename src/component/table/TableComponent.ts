import type { ListenItem, TemplateDecl } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '@qimenjs/component';
import { ColumnMetaManager } from './engine/ColumnMetaManager';
import { TableHeaderComponent } from './header/TableHeaderComponent';
import type { ColumnDefOrGroup, ColumnMeta } from './column-types';
import { GROUP_SUMMARY_ROW_TYPE } from './constants';
import { ENTITY_COMMAND_EVENTS } from '@/events';
import { Definitions } from '@/composable';

class TableComponent extends ItemGroupPooledComponent {
    static type = 'table';
    defaultItemType = 'table-row';
    _isAfterInit = false;
    _columnMetaManager: ColumnMetaManager | null = null;
    _header: TableHeaderComponent | null = null;
    _lastReflowData: any[] = [];
    _groupRowMap: Map<string, { summaryRow: any; dataRows: any[] }> = new Map();

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-table',
            children: [
                { tag: 'div', name: 'headerArea', classes: 'q-table__header-area' },
                { tag: 'div', name: 'itemContainer', classes: 'q-table__body' },
            ],
        };
    }

    get defaultOptions(): Record<string, any> {
        return {
            direction: 'vertical',
            autoEventKey: true,
            autoEntityKey: true,
        };
    }

    listens: ListenItem[] = [
        {
            source: 'self',
            events: {
                resize: '_onColumnResize',
                groupToggle: 'onGroupToggle',
            },
        },
    ];

    onAfterInit(): void {
        super.onAfterInit();

        const groupField = this.getData('groupField');
        if (groupField && this.hasEntity()) {
            this.entityEmit(ENTITY_COMMAND_EVENTS.GROUP_BY, { groupField }, { source: this.getData('entityKey') });
        }

        const headerArea = this.getNodeEl('headerArea');
        if (headerArea) {
            const columns = this.getData('columns') || [];
            this._header = new TableHeaderComponent({
                columns,
                eventKey: this.eventKey,
                entityKey: this.entityKey,
                groupField: this.getData('groupField') ?? '',
            });
            headerArea.appendChild(this._header.el);
        }

        this._isAfterInit = true;
        this._reflow();
    }

    _onEntityDataChange(): void {
        if (this._isAfterInit) this._reflow();
    }

    _onColumnResize(data: any): void {
        const colName = data.colName;
        const width = data.width;
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
        if (this._isAfterInit) this._reflow();
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
        this.defaultItemOption = {
            columnMetas: metas,
            eventKey: this.eventKey,
            entityKey: this.entityKey,
        };

        const data = this.hasEntity() ? this.getEntityItems() : (this.getData('data') ?? []);
        const isGrouped = this._isGroupedData(data);
        const wasGrouped = this._isGroupedData(this._lastReflowData);
        if (wasGrouped !== isGrouped) {
            this._disposeAllItems();
        }
        this._lastReflowData = data;

        const items = this._buildItems(data, metas);
        super.setItems(items);
        this._buildGroupRowMap(items);
    }

    /**
     * 构建 item 数组：分组数据展开为「组行 + 组内行」扁平数组，通过 order 排序。
     */
    _buildItems(data: any[], metas: ColumnMeta[]): Record<string, any>[] {
        if (this._isGroupedData(data)) {
            const items: Record<string, any>[] = [];
            let order = 1;
            for (const group of data) {
                const groupKey = group.groupKey;
                items.push({
                    type: GROUP_SUMMARY_ROW_TYPE,
                    data: { ...this._buildGroupSummary(group, metas), _groupKey: groupKey },
                    order: order++,
                    _groupKey: groupKey,
                });
                for (const rowData of group.groupItems ?? []) {
                    items.push({ data: rowData, order: order++, _groupKey: groupKey });
                }
            }
            return items;
        }
        return data.map((rowData: any) => ({ data: rowData }));
    }

    /** 判断是否为分组数据（[{ groupKey, groupItems }]） */
    _isGroupedData(data: any[]): boolean {
        return (
            Array.isArray(data) &&
            data.length > 0 &&
            data[0] !== null &&
            typeof data[0] === 'object' &&
            'groupKey' in data[0] &&
            Array.isArray(data[0].groupItems)
        );
    }

    /** 按 groupAggregator 计算分组汇总行数据 */
    _buildGroupSummary(group: any, metas: ColumnMeta[]): Record<string, any> {
        const summary: Record<string, any> = {};
        for (const meta of metas) {
            if (!meta.groupAggregator) continue;
            if (meta.groupAggregator === 'label') {
                summary[meta.name] = group.groupKey;
            } else {
                summary[meta.name] = this._aggregate(meta, group.groupItems ?? []);
            }
        }
        return summary;
    }

    _aggregate(meta: ColumnMeta, items: any[]): any {
        const values = items.map(row => this._getFieldValue(row, meta.field));
        switch (meta.groupAggregator) {
            case 'sum':
                return values.reduce((acc, v) => acc + (Number(v) || 0), 0);
            case 'count':
                return items.length;
            case 'avg':
                return values.length
                    ? values.reduce((acc, v) => acc + (Number(v) || 0), 0) / values.length
                    : '';
            case 'min':
                return values.length ? Math.min(...values.map(v => Number(v))) : '';
            case 'max':
                return values.length ? Math.max(...values.map(v => Number(v))) : '';
            default:
                return '';
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

    _buildGroupRowMap(itemsData: Record<string, any>[]): void {
        this._groupRowMap = new Map();
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (let i = 0; i < items.length; i++) {
            const groupKey = itemsData[i]?._groupKey;
            if (groupKey === undefined) continue;
            let entry = this._groupRowMap.get(groupKey);
            if (!entry) {
                entry = { summaryRow: null, dataRows: [] };
                this._groupRowMap.set(groupKey, entry);
            }
            if (itemsData[i]?.type === GROUP_SUMMARY_ROW_TYPE) {
                entry.summaryRow = items[i];
            } else {
                entry.dataRows.push(items[i]);
            }
        }
    }

    onGroupToggle(data: { groupKey: string; collapsed: boolean }): void {
        const entry = this._groupRowMap?.get(data.groupKey);
        if (!entry) return;
        for (const row of entry.dataRows) {
            row.hidden = data.collapsed;
        }
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
        if (this._header && typeof this._header.hideColumn === 'function') {
            this._header.hideColumn(name);
        }
    }

    showColumn(name: string): void {
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
        groupField: '',
    },
    fields: {
        _isAfterInit: false,
        _columnMetaManager: null,
        _header: null,
        _groupRowMap: null,
    },
} as const;

TableComponent.define(TableComponentDefs);
TableComponent.register();

export { TableComponent };
