import type { ColumnMetaManager } from '../engine/ColumnMetaManager';
import type { TableHeaderComponent } from '../header/TableHeaderComponent';
import type { TableSummaryRowComponent } from '../table-summary/TableSummaryRowComponent';
import type { ColumnMeta, ColumnDefOrGroup, RowBodyConfig } from '../column-types';
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
    _editOverlay: any;
    _editingRowKey: string | null;
    _editingRowData: any | null;
    _editingRow: any | null;
    _editScrollHandler: (() => void) | null;

    getData(key: string): any;
    setData(key: string, value: any, raw?: boolean): void;
    getNodeEl(name: string): HTMLElement | undefined;
    emit(event: string, data?: any): void;
    componentEmit(event: string, data?: any): void;
    entityEmit(event: string, data?: any, opts?: Record<string, any>): void;
    entityOn(entityKey: string, eventName: string, handler: (data: any) => void): () => void;
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
    _onRowAreaClick(domEvt: any): void;
    _onRowSelectClick(domEvt: any): void;
    _isExpandCellClick(row: any, clickTarget: HTMLElement): boolean;

    _prepareColumnsForHeader(columns: ColumnDefOrGroup[]): ColumnDefOrGroup[];
    _resolveColumnTitle(title: string | undefined, displayKey: string | undefined, scope: string): string | undefined;
    _applyColumnStyles(): void;
    _applyFixedColumnOffsets(metas: ColumnMeta[]): void;
    _resolveFixedWidth(meta: ColumnMeta): number;
    _computeRowNumberWidth(totalRows: number, userWidth?: string): string;
    _setGroupColumnOrderVars(): void;
    _traverseGroupOrders(columns: ColumnDefOrGroup[], startLeafIndex: number, step: number): number;
    _updateItemsColumnMetas(): void;
    _isReorderOnly(oldMetas: ColumnMeta[], newMetas: ColumnMeta[]): boolean;

    _isGroupedData(data: any[]): boolean;
    _buildGroupSummary(group: any, metas: ColumnMeta[]): Record<string, any>;
    _buildGroupRowMap(itemsData: Record<string, any>[]): void;
    onGroupToggle(data: { groupKey: string; collapsed: boolean }): void;
    _onGroupBy(data: any): void;
    _onToggleAll(data: any): void;
    _onReorder(data: any): void;
    _onReorderStart(data: any): void;
    _onReorderMove(data: any): void;
    _onReorderEnd(data: any): void;

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
    _renderRowBodyWithLoader(row: any, rowData: any, rowKey: string): void;
    _renderRowBodyWithEntity(row: any, rowData: any, rowKey: string, rowBody: RowBodyConfig): void;
    _renderRowBodyWithLoaderFn(row: any, rowData: any, rowKey: string, rowBody: RowBodyConfig): void;
    _applyRowBodyData(inst: any, row: any, mergedData: any, rowBody: RowBodyConfig): void;
    _showBodyLoading(bodyEl: HTMLElement, text: string): HTMLElement;

    _onRowEditTrigger(domEvt: any): void;
    _findClickedColName(row: any, clickTarget: HTMLElement | undefined): string | null;
    _startEdit(row: any, rowData: any, editableMetas: any[]): void;
    _syncOverlayPosition(): void;
    _bindScrollSync(): void;
    _unbindScrollSync(): void;
    _collectCellPositions(row: any, editableMetas: any[]): any[];
    _bindEditActions(): void;
    _saveEdit(): void;
    _cancelEdit(): void;
    _closeEditOverlay(): void;
    _validateEditValues(values: Record<string, any>): Record<string, string>;
}
