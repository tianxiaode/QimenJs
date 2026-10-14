import type { ColumnMetaManager } from '../engine/ColumnMetaManager';
import type { TableHeaderComponent } from '../header/TableHeaderComponent';
import type { TableSummaryRowComponent } from '../table-summary/TableSummaryRowComponent';
import type { ColumnMeta, ColumnDefOrGroup } from '../column-types';
import type { RangeLoadedData } from '@/entity/abilities/remote/RangeLoadAbility';

/**
 * Table 能力宿主接口 — 各 TableAbility 通过 this 上下文访问宿主成员，
 * 方法体拆分到 abilities/ 目录，运行时由 use() 注入组件原型。
 */
export interface TableAbilityHost {
    el: HTMLElement;
    items: any[];
    step: number;
    eventKey: string;
    entityKey: string;
    rawOptions: Record<string, any> | undefined;
    defaultItemOption: Record<string, any>;
    defaultEventData: Record<string, any>;

    _isAfterInit: boolean;
    _columnMetaManager: ColumnMetaManager | null;
    _header: TableHeaderComponent | null;
    _groupRowMap: Map<string, { summaryRow: any; dataRows: any[] }> | null;
    _summaryRow: TableSummaryRowComponent | null;
    _entityTotal: number;
    _virtualEntityMode: boolean;
    _pendingRanges: Set<string> | null;
    _hiddenItems: any[];
    _virtualData: any[];
    _scrollUnbind: (() => void) | null;
    _bodyCache: Map<string, any>;

    getData(key: string): any;
    setData(key: string, value: any, raw?: boolean): void;
    getNodeEl(name: string): HTMLElement | undefined;
    emit(event: string, data?: any): void;
    componentEmit(event: string, data?: any): void;
    entityEmit(event: string, data?: any, opts?: Record<string, any>): void;
    entityLoadRange(start: number, end: number): void;
    getEntityItems(): any[];
    hasEntity(): boolean;
    _renderVirtualItems(): void;

    initColumnOrder(config: { useCssVar: boolean; cssVarPrefix: string }): void;
    registerColumnEntry(name: string, width: any, index: number, extra?: Record<string, any>): void;
    getColumnOrderCount(): number;
    rebuildColumnOrders(names: string[]): void;

    initSelection(config: { mode: string }): void;
    isSelected(key: string): boolean;
    toggleSelect(key: string, data: any): void;
    deselect(key: string): void;
    selectAll(entries: Array<{ key: string; data: any }>): void;
    clearSelection(): void;
    getSelectionCount(): number;
    getSelectedKeys(): string[];
    getSelectedData(): any[];

    _applyRowBgVars(): void;
    _applyZebraStripes(): void;

    _collectSelectableEntries(): Array<{ key: string; data: any }>;
    toggleAllSelection(): void;
    _syncRowSelectedStates(): void;
    _updateHeaderSelectAllState(): void;
    _deselectDisabledRows(): void;
    _rowHasSelectionCell(row: any): boolean;
    _isSelectionCellClick(row: any, domEvt: any): boolean;

    _prepareColumnsForHeader(columns: ColumnDefOrGroup[]): ColumnDefOrGroup[];
    _applyColumnStyles(): void;
    _applyFixedColumnOffsets(metas: ColumnMeta[]): void;
    _resolveFixedWidth(meta: ColumnMeta): number;
    _computeRowNumberWidth(totalRows: number, userWidth?: string): string;
    _setGroupColumnOrderVars(): void;
    _traverseGroupOrders(columns: ColumnDefOrGroup[], startLeafIndex: number, step: number): number;
    _updateItemsColumnMetas(): void;
    _isReorderOnly(oldMetas: ColumnMeta[], newMetas: ColumnMeta[]): boolean;

    _isGroupedData(data: any[]): boolean;
    _groupLocalData(data: any[], groupField: string): any[];
    _buildGroupSummary(group: any, metas: ColumnMeta[]): Record<string, any>;
    _buildGroupRowMap(itemsData: Record<string, any>[]): void;
    onGroupToggle(data: { groupKey: string; collapsed: boolean }): void;
    _onGroupBy(data: any): void;

    _updateSummaryRow(): void;
    _computeSummaryData(metas: ColumnMeta[]): Record<string, any>;
    _aggregate(meta: ColumnMeta, items: any[]): any;
    _aggregateByType(meta: ColumnMeta, items: any[], aggregator: any): any;
    _getFieldValue(obj: any, path: string): any;

    _onVirtualDataMissing(start: number, end: number): void;
    onEntityRangeLoaded(data: RangeLoadedData): void;

    _ensureExpandColumn(columns: ColumnDefOrGroup[]): ColumnDefOrGroup[];
    _onRowExpand(data: any): void;
    _onRowCollapse(data: any): void;
    _renderRowBody(row: any, rowData: any): any;
}
