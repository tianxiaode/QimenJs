import type { ListenItem, TemplateDecl } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '@qimenjs/component';
import { ColumnOrderAbility, SelectionAbility } from '@qimenjs/component-abilities';
import { ColumnMetaManager } from './engine/ColumnMetaManager';
import { TableHeaderComponent } from './header/TableHeaderComponent';
import { TableSummaryRowComponent } from './table-summary/TableSummaryRowComponent';
import type { ColumnDefOrGroup, ColumnGroupDef, ColumnMeta, AggregatorType, TableSelectMode } from './column-types';
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
    _summaryRow: TableSummaryRowComponent | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-table',
            children: [
                { tag: 'div', name: 'headerArea', classes: 'q-table__header-area' },
                { tag: 'div', name: 'itemContainer', classes: 'q-table__body' },
                { tag: 'div', name: 'summaryArea', classes: 'q-table__summary-area' },
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
                rowSelect: '_onRowSelect',
                selectionChange: '_onSelectionChange',
            },
        },
    ];

    onAfterInit(): void {
        super.onAfterInit();

        const groupField = this.getData('groupField');
        if (groupField && this.hasEntity()) {
            this.entityEmit(
                ENTITY_COMMAND_EVENTS.GROUP_BY,
                { groupField },
                { source: this.getData('entityKey') }
            );
        }

        const headerArea = this.getNodeEl('headerArea');
        if (headerArea) {
            const columns = this.getData('columns') || [];
            this._header = new TableHeaderComponent({
                columns,
                eventKey: this.eventKey,
                entityKey: this.entityKey,
                groupField: this.getData('groupField') ?? '',
                selectable: this.getData('selectable') ?? 'none',
            });
            this._header.on('reorder', (ctx: any) => {
                this.setData('columns', ctx.data.columns);
                const metas = this._columnMetaManager?.getAll() ?? [];
                if (metas.length > 0) {
                    this.rebuildColumnOrders(metas.map(m => m.name));
                    this._setGroupColumnOrderVars();
                }
            });
            this._header.on('toggleAll', () => {
                this.toggleAllSelection();
            });
            headerArea.appendChild(this._header.el);
        }

        this._isAfterInit = true;
        this._reflow();
    }

    _onEntityDataChange(): void {
        if (this._isAfterInit) this._reflow();
    }

    _onSelectableOptionChange(value: TableSelectMode): void {
        if (value === 'none') {
            this.clearSelection();
            return;
        }
        this.initSelection({ mode: value === 'multiple' ? 'multiple' : 'single' });
    }

    /**
     * 行选择事件（RowComponent 冒泡）→ 切换选中
     */
    _onRowSelect(data: any): void {
        if (!data?.key) return;
        this.toggleSelect(data.key, data.data);
    }

    /**
     * 选中变化 — 同步行选中状态 + 表头全选状态，并转发给外部
     */
    _onSelectionChange(data: any): void {
        this._syncRowSelectedStates();
        this._updateHeaderSelectAllState();
        this.emit('selectionChanged', data);
    }

    /**
     * 收集全部可选行（multiple 模式全选用）
     */
    _collectSelectableEntries(): Array<{ key: string; data: any }> {
        const entries: Array<{ key: string; data: any }> = [];
        const items = this.items;
        if (!Array.isArray(items)) return entries;
        for (const item of items) {
            const data = item?.getData?.('data');
            if (!data?._rowKey || data?._selectDisabled) continue;
            entries.push({ key: data._rowKey, data });
        }
        return entries;
    }

    /**
     * 全选/清空切换 — multiple 模式
     */
    toggleAllSelection(): void {
        const entries = this._collectSelectableEntries();
        if (entries.length === 0) return;
        if (this.getSelectionCount() >= entries.length) {
            this.clearSelection();
        } else {
            this.selectAll(entries);
        }
    }

    _syncRowSelectedStates(): void {
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const item of items) {
            if (typeof item.setRowSelected !== 'function') continue;
            const data = item.getData?.('data');
            if (!data?._rowKey) continue;
            const selected = this.isSelected(data._rowKey);
            Promise.resolve(item.ready).then(() => {
                if (typeof item.dispose === 'function' && item.isDisposed?.()) return;
                item.setRowSelected(selected);
            });
        }
    }

    _updateHeaderSelectAllState(): void {
        if (!this._header || typeof (this._header as any).setSelectAllState !== 'function') return;
        const selectable = this.getData('selectable');
        if (selectable !== 'multiple') return;
        const entries = this._collectSelectableEntries();
        const selectedCount = entries.filter(e => this.isSelected(e.key)).length;
        (this._header as any).setSelectAllState(
            entries.length > 0 && selectedCount === entries.length,
            selectedCount > 0 && selectedCount < entries.length
        );
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
        const oldMetas = this._columnMetaManager.getAll();
        this._columnMetaManager.compile(columns);
        const isReorderOnly = this._isReorderOnly(oldMetas, this._columnMetaManager.getAll());
        if (!isReorderOnly) {
            this._applyColumnStyles();
        }
        if (this._isAfterInit) {
            if (!isReorderOnly) {
                this._disposeAllItems();
                this._reflow();
            }
        }
    }

    _onDataOptionChange(_data: Record<string, any>[]): void {
        if (this._isAfterInit) this._reflow();
    }

    _reflow(): void {
        const columns = this.getData('columns') || [];
        if (columns.length === 0) return;

        if (!this._columnMetaManager) {
            this._columnMetaManager = new ColumnMetaManager();
            this._columnMetaManager.compile(columns);
        }

        this._applyColumnStyles();

        const metas = this._columnMetaManager.getAll();
        this.defaultItemOption = {
            columnMetas: metas,
            eventKey: this.eventKey,
            entityKey: this.entityKey,
            selectable: this.getData('selectable') ?? 'none',
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
        this._updateSummaryRow();
        if (this.getData('selectable') !== 'none') {
            this._syncRowSelectedStates();
        }
    }

    /**
     * 构建 item 数组：分组数据展开为「组行 + 组内行」扁平数组，通过 order 排序。
     * 每行生成 _rowKey（data.id 优先，fallback 全局计数），用于选择状态管理。
     */
    _buildItems(data: any[], metas: ColumnMeta[]): Record<string, any>[] {
        let rowIdx = 0;
        const nextKey = (rowData: any): string =>
            String(rowData?.id ?? rowData?._rowKey ?? `row-${rowIdx++}`);
        if (this._isGroupedData(data)) {
            const items: Record<string, any>[] = [];
            let order = 1;
            for (const group of data) {
                const groupKey = group.groupKey;
                items.push({
                    type: GROUP_SUMMARY_ROW_TYPE,
                    data: { ...this._buildGroupSummary(group, metas), _groupKey: groupKey },
                    columnMetas: metas,
                    order: order++,
                    _groupKey: groupKey,
                });
                for (const rowData of group.groupItems ?? []) {
                    items.push({
                        data: rowData,
                        columnMetas: metas,
                        order: order++,
                        _rowKey: nextKey(rowData),
                        _groupKey: groupKey,
                    });
                }
            }
            return items;
        }
        return data.map((rowData: any) => ({
            data: rowData,
            columnMetas: metas,
            _rowKey: nextKey(rowData),
        }));
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

    _updateSummaryRow(): void {
        const metas = this._columnMetaManager?.getAll() ?? [];
        const hasSummary = metas.some(m => m.summary);

        if (!hasSummary) {
            if (this._summaryRow) {
                this._summaryRow.dispose();
                this._summaryRow = null;
            }
            return;
        }

        const summaryData = this._computeSummaryData(metas);

        if (!this._summaryRow) {
            const summaryArea = this.getNodeEl('summaryArea');
            if (!summaryArea) return;
            this._summaryRow = new TableSummaryRowComponent({ columnMetas: metas });
            summaryArea.appendChild(this._summaryRow.el);
        }

        this._summaryRow.update(summaryData);
    }

    _computeSummaryData(metas: ColumnMeta[]): Record<string, any> {
        const data = this.hasEntity() ? this.getEntityItems() : (this.getData('data') ?? []);
        const flatData = this._isGroupedData(data)
            ? data.flatMap((g: any) => g.groupItems ?? [])
            : data;
        const summary: Record<string, any> = {};

        for (const meta of metas) {
            if (!meta.summary) continue;
            if (meta.summary.label !== undefined) {
                summary[meta.name] = meta.summary.label;
            } else if (meta.summary.aggregator) {
                summary[meta.name] = this._aggregateByType(meta, flatData, meta.summary.aggregator);
            }
        }

        return summary;
    }

    _aggregateByType(meta: ColumnMeta, items: any[], aggregator: AggregatorType): any {
        const values = items.map(row => this._getFieldValue(row, meta.field));
        switch (aggregator) {
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
    _applyColumnStyles(): void {
        if (!this._columnMetaManager) return;
        const metas = this._columnMetaManager.getAll();
        if (!this.getColumnOrderCount()) {
            this.initColumnOrder({ useCssVar: true, cssVarPrefix: '--q-table-col-' });
        }
        for (let i = 0; i < metas.length; i++) {
            const meta = metas[i];
            if (meta.width) {
                this.el!.style.setProperty(`--q-table-col-${meta.name}-width`, meta.width);
            }
            this.registerColumnEntry(meta.name, null, i, { isLeaf: true });
        }
        this._setGroupColumnOrderVars();
    }

    _setGroupColumnOrderVars(): void {
        const columns = this.getData('columns') || [];
        const step = this.step ?? 100;
        this._traverseGroupOrders(columns, 0, step);
    }

    _traverseGroupOrders(
        columns: ColumnDefOrGroup[],
        startLeafIndex: number,
        step: number
    ): number {
        let leafIndex = startLeafIndex;
        for (const col of columns) {
            if ('children' in col && Array.isArray((col as ColumnGroupDef).children)) {
                const group = col as ColumnGroupDef;
                const childStartLeafIndex = leafIndex;
                leafIndex = this._traverseGroupOrders(group.children, leafIndex, step);
                const minOrder = (childStartLeafIndex + 1) * step;
                const groupOrder = minOrder - Math.floor(step / 2);
                this.el!.style.setProperty(`--q-table-col-${group.name}-order`, String(groupOrder));
            } else {
                leafIndex++;
            }
        }
        return leafIndex;
    }

    _updateItemsColumnMetas(): void {
        const metas = this._columnMetaManager!.getAll();
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const item of items) {
            if (typeof item.update === 'function') {
                item.update({ columnMetas: metas });
            }
        }
    }

    _isReorderOnly(oldMetas: ColumnMeta[], newMetas: ColumnMeta[]): boolean {
        if (oldMetas.length !== newMetas.length) return false;
        const oldNames = new Set(oldMetas.map(m => m.name));
        for (const m of newMetas) {
            if (!oldNames.has(m.name)) return false;
        }
        return true;
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
        if (this._header && typeof this._header.moveColumn === 'function') {
            this._header.moveColumn(from, to);
        }
    }

    override onBeforeDispose(): void {
        super.onBeforeDispose();
        this._summaryRow?.dispose();
        this._summaryRow = null;
        this._header?.dispose?.();
        this._header = null;
    }
}

const TableComponentDefs: Definitions = {
    options: {
        columns: null,
        groupField: '',
        selectable: 'none',
    },
    fields: {
        _isAfterInit: false,
        _columnMetaManager: null,
        _header: null,
        _groupRowMap: null,
        _summaryRow: null,
    },
} as const;

TableComponent.use([ColumnOrderAbility, SelectionAbility]);
TableComponent.define(TableComponentDefs);
TableComponent.register();

export { TableComponent };
