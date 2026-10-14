import type { ListenItem, TemplateDecl, DomEventsMap } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '@qimenjs/component';
import { ColumnOrderAbility, SelectionAbility } from '@qimenjs/component-abilities';
import { ColumnMetaManager } from './engine/ColumnMetaManager';
import { TableHeaderComponent } from './header/TableHeaderComponent';
import type {
    ColumnDefOrGroup,
    ColumnMeta,
    TableSelectMode,
} from './column-types';
import { GROUP_SUMMARY_ROW_TYPE } from './constants';
import { ENTITY_COMMAND_EVENTS } from '@/events';
import { Definitions } from '@/composable';
import { TABLE_ABILITIES } from './abilities';
import './table.css';

/**
 * TableComponent — 表格容器主类
 *
 * 只保留核心流程：模板、初始化编排（header 创建）、_reflow 渲染编排、
 * _buildItems 数据构建。列样式/行选择/分组/汇总/斑马纹/虚拟滚动 entity
 * 等能力拆分到 abilities/ 目录，通过 use() 注入原型。
 */
class TableComponent extends ItemGroupPooledComponent {
    static type = 'table';
    defaultItemType = 'table-row';
    _isAfterInit = false;
    _columnMetaManager: ColumnMetaManager | null = null;
    _header: TableHeaderComponent | null = null;
    _lastReflowData: any[] = [];
    _sortState: { colName: string; direction: 'asc' | 'desc' } | null = null;
    _bodyCache: Map<string, any> = new Map();

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
                sort: '_onSort',
                groupToggle: 'onGroupToggle',
                hideColumn: '_onHideColumn',
                showColumn: '_onShowColumn',
                rowExpand: '_onRowExpand',
                rowCollapse: '_onRowCollapse',
            },
        },
    ];

    domEvents: DomEventsMap = {
        click: [{ path: '[items]', handler: '_onRowClick', emits: ['selectionChanged'] }],
    };

    get defaultEventData(): Record<string, any> {
        return {
            selectedKeys: this.getSelectedKeys?.() ?? [],
            selectedData: this.getSelectedData?.() ?? [],
        };
    }

    onAfterInit(): void {
        super.onAfterInit();

        const groupField = this.getData('groupField');
        if (groupField && this.hasEntity() && !this.getData('virtualScroll')) {
            this.entityEmit(
                ENTITY_COMMAND_EVENTS.GROUP_BY,
                { groupField },
                { source: this.getData('entityKey') }
            );
        }

        const headerArea = this.getNodeEl('headerArea');
        if (headerArea) {
            const columns = this._prepareColumnsForHeader(this.getData('columns') || []);
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

    _onSelectDisabledOptionChange(): void {
        if (this._isAfterInit) this._reflow();
    }

    _onColumnsOptionChange(columns: ColumnDefOrGroup[]): void {
        const adjusted = this._ensureExpandColumn(columns);
        if (adjusted !== columns) {
            this.setData('columns', adjusted, true);
            columns = adjusted;
        }
        if (!this._columnMetaManager) {
            this._columnMetaManager = new ColumnMetaManager();
        }
        const oldMetas = this._columnMetaManager.getAll();
        this._columnMetaManager.compile(columns);
        const isReorderOnly = this._isReorderOnly(oldMetas, this._columnMetaManager.getAll());
        if (!isReorderOnly) {
            this._sortState = null;
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
        let columns = this.getData('columns') || [];
        if (columns.length === 0) return;

        columns = this._ensureExpandColumn(columns);
        const currentColumns = this.getData('columns');
        if (columns !== currentColumns) {
            this.setData('columns', columns, true);
        }

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

        const explicitEntity = !!(this.rawOptions?.entityKey || this.rawOptions?.entityType);
        const localData = this.getData('data');

        if (this.getData('virtualScroll') && explicitEntity && !Array.isArray(localData)) {
            this._virtualEntityMode = true;
            const entityItems = this.getEntityItems();
            if (entityItems.length > 0) {
                this._entityTotal = entityItems.length;
                const sparseData: any[] = new Array(this._entityTotal);
                super.setItems(sparseData);
            }
            return;
        }

        this._virtualEntityMode = false;
        const data = explicitEntity && !Array.isArray(localData) ? this.getEntityItems() : (localData ?? []);
        const isGrouped = this._isGroupedData(data);
        const wasGrouped = this._isGroupedData(this._lastReflowData);
        if (wasGrouped !== isGrouped) {
            this._disposeAllItems();
        }
        this._lastReflowData = data;

        const sortedData = this._sortState ? this._applySort(data) : data;
        const items = this._buildItems(sortedData, metas);
        super.setItems(items);
        if (!this.getData('virtualScroll')) {
            this._buildGroupRowMap(items);
        }
        this._deselectDisabledRows();
        this._updateSummaryRow();
        this._applyZebraStripes();
        if (this.getData('selectable') !== 'none') {
            this._syncRowSelectedStates();
        }
    }

    /**
     * 构建 item 数组：分组数据展开为「组行 + 组内行」扁平数组，通过 order 排序。
     * 每行生成 _rowKey（data.id 优先，fallback 全局计数），用于选择状态管理。
     * selectDisabled 函数对每行求值，结果写入 _selectDisabled 标记。
     */
    _buildItems(data: any[], metas: ColumnMeta[]): Record<string, any>[] {
        let rowIdx = 0;
        let rowNumber = 0;
        const nextKey = (rowData: any): string =>
            String(rowData?.id ?? rowData?._rowKey ?? `row-${rowIdx++}`);
        const selectDisabledFn = this.getData('selectDisabled');
        const computeDisabled = (rowData: any): boolean => {
            if (rowData?._selectDisabled) return true;
            if (typeof selectDisabledFn === 'function') {
                try { return !!selectDisabledFn(rowData); } catch { return false; }
            }
            return false;
        };
        if (this._isGroupedData(data) && !this.getData('virtualScroll')) {
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
                    rowNumber++;
                    items.push({
                        data: { ...rowData, _rowKey: nextKey(rowData), _rowNumber: rowNumber, _selectDisabled: computeDisabled(rowData) },
                        columnMetas: metas,
                        order: order++,
                        _groupKey: groupKey,
                    });
                }
            }
            return items;
        }
        if (this._isGroupedData(data)) {
            const items: Record<string, any>[] = [];
            for (const group of data) {
                for (const rowData of group.groupItems ?? []) {
                    rowNumber++;
                    items.push({
                        data: { ...rowData, _rowKey: nextKey(rowData), _rowNumber: rowNumber, _selectDisabled: computeDisabled(rowData) },
                        columnMetas: metas,
                    });
                }
            }
            return items;
        }
        return data.map((rowData: any) => {
            rowNumber++;
            return {
                data: { ...rowData, _rowKey: nextKey(rowData), _rowNumber: rowNumber, _selectDisabled: computeDisabled(rowData) },
                columnMetas: metas,
            };
        });
    }

    _onSort(data: any): void {
        const colName = data?.colName ?? data?.actionData?.colName;
        const direction = data?.direction ?? data?.actionData?.direction;
        if (!colName || !direction) return;
        if (direction === 'none') {
            this._sortState = null;
        } else {
            this._sortState = { colName, direction };
        }
        if (this._isAfterInit) this._reflow();
    }

    _applySort(data: any[]): any[] {
        if (!this._sortState || !this._columnMetaManager) return data;
        const meta = this._columnMetaManager.get(this._sortState.colName);
        if (!meta) return data;
        const field = meta.field;
        const direction = this._sortState.direction;
        const sortFn = (a: any, b: any): number => {
            const av = a?.[field];
            const bv = b?.[field];
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            if (typeof av === 'number' && typeof bv === 'number') {
                return direction === 'asc' ? av - bv : bv - av;
            }
            const cmp = String(av).localeCompare(String(bv));
            return direction === 'asc' ? cmp : -cmp;
        };
        if (this._isGroupedData(data)) {
            return data.map(group => ({
                ...group,
                groupItems: [...(group.groupItems ?? [])].sort(sortFn),
            }));
        }
        return [...data].sort(sortFn);
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

    override onBeforeDispose(): void {
        super.onBeforeDispose();
        this._summaryRow?.dispose();
        this._summaryRow = null;
        this._header?.dispose?.();
        this._header = null;
        this._bodyCache.clear();
    }
}

const TableComponentDefs: Definitions = {
    options: {
        columns: null,
        groupField: '',
        selectable: 'none',
        selectDisabled: null,
        stripe: true,
        rowBg: null,
        stripeBg: null,
        virtualScroll: false,
        itemHeight: 36,
        height: null,
        rowBody: null,
    },
    fields: {
        _isAfterInit: false,
        _columnMetaManager: null,
        _header: null,
        _groupRowMap: null,
        _summaryRow: null,
        _entityTotal: 0,
        _virtualEntityMode: false,
        _pendingRanges: null,
        _bodyCache: null,
    },
} as const;

TableComponent.use([ColumnOrderAbility, SelectionAbility, ...TABLE_ABILITIES]);
TableComponent.define(TableComponentDefs);
TableComponent.register();

export { TableComponent };
