import type { AbilityDefinition } from '@/composable';
import type { TableAbilityHost } from './types';
import type { ColumnDefOrGroup, ColumnMeta, RowBodyConfig } from '../column-types';
import { createItemFromDef } from '../../container/resolve';
import { ENTITY_LIST_EVENTS } from '@/events';

export const RowBodyAbility = {
    _onRowBodyOptionChange(this: TableAbilityHost, _value: any): void {
        if (this._isAfterInit) {
            const columns = this.getData('columns') || [];
            const adjusted = this._ensureExpandColumn(columns);
            if (adjusted !== columns) {
                this.setData('columns', adjusted);
            }
        }
    },

    _ensureExpandColumn(this: TableAbilityHost, columns: ColumnDefOrGroup[]): ColumnDefOrGroup[] {
        const rowBody = this.getData('rowBody');
        if (!rowBody || this.getData('virtualScroll')) return columns;

        const hasExpand = columns.some((col: any) => {
            if ('children' in col) return false;
            return col.cellType === 'expand';
        });
        if (hasExpand) return columns;

        return [{ name: '_expand', cellType: 'expand', width: 36 }, ...columns];
    },

    _onRowExpand(this: TableAbilityHost, data: any): void {
        const rowKey = data?.rowKey;
        if (rowKey == null) return;

        const row = this.items?.find((r: any) => r?.getData?.('data')?._rowKey === rowKey);
        if (!row) return;

        const rowData = data?.rowData ?? row.getData('data');
        const rowBody = this.getData('rowBody');
        if (!rowBody) return;

        this._renderRowBodyWithLoader(row, rowData, rowKey);

        this.emit('rowExpand', data);
    },

    _onRowCollapse(this: TableAbilityHost, data: any): void {
        const rowKey = data?.rowKey;
        if (rowKey == null) return;

        this.emit('rowCollapse', data);
    },

    _renderRowBodyWithLoader(this: TableAbilityHost, row: any, rowData: any, rowKey: string): void {
        const rowBody: RowBodyConfig = this.getData('rowBody');
        if (!rowBody || !row?.bodyEl) return;

        if (this._bodyCache.has(rowKey)) {
            const mergedData = { ...rowData, ...this._bodyCache.get(rowKey) };
            const content = this._renderRowBody(row, mergedData);
            if (content) row.setBodyContent(content);
            return;
        }

        if (rowBody.entityAction) {
            this._renderRowBodyWithEntity(row, rowData, rowKey, rowBody);
            return;
        }

        if (rowBody.loader) {
            this._renderRowBodyWithLoaderFn(row, rowData, rowKey, rowBody);
            return;
        }

        const content = this._renderRowBody(row, rowData);
        if (content) row.setBodyContent(content);
    },

    _renderRowBodyWithEntity(
        this: TableAbilityHost,
        row: any,
        rowData: any,
        rowKey: string,
        rowBody: RowBodyConfig
    ): void {
        const entityKey = rowBody.entityKey ?? this.entityKey;
        if (!entityKey) {
            const content = this._renderRowBody(row, rowData);
            if (content) row.setBodyContent(content);
            return;
        }

        const loadingText = rowBody.loadingText ?? 'Loading...';
        const paramField = rowBody.entityParamField ?? 'id';
        const paramValue = rowData[paramField] ?? rowKey;
        const action = rowBody.entityAction;
        if (!action) return;

        const inst = this._renderRowBody(row, rowData);
        const bodyEl = row.bodyEl;
        let loadingEl: HTMLElement | null = null;
        if (inst && bodyEl) {
            row.setBodyContent(inst);
            loadingEl = this._showBodyLoading(bodyEl, loadingText);
        }

        const offGot = this.entityOn(entityKey, ENTITY_LIST_EVENTS.GOT, (detailData: any) => {
            offGot?.();
            offError?.();
            if (detailData) {
                this._bodyCache.set(rowKey, detailData);
                const mergedData = { ...rowData, ...detailData };
                loadingEl?.remove();
                this._applyRowBodyData(inst, row, mergedData, rowBody);
            }
        });

        const offError = this.entityOn(entityKey, 'get:error', () => {
            offGot?.();
            offError?.();
            loadingEl?.remove();
            if (bodyEl) {
                bodyEl.innerHTML = '<div class="q-table-row__body-error">Load failed</div>';
            }
        });

        this.entityEmit(action, paramValue, { source: entityKey });
    },

    _renderRowBodyWithLoaderFn(
        this: TableAbilityHost,
        row: any,
        rowData: any,
        rowKey: string,
        rowBody: RowBodyConfig
    ): void {
        const loadingText = rowBody.loadingText ?? 'Loading...';
        const bodyEl = row.bodyEl;

        const inst = this._renderRowBody(row, rowData);
        let loadingEl: HTMLElement | null = null;
        if (inst && bodyEl) {
            row.setBodyContent(inst);
            loadingEl = this._showBodyLoading(bodyEl, loadingText);
        }

        rowBody.loader!(rowKey, rowData)
            .then((detailData: any) => {
                this._bodyCache.set(rowKey, detailData);
                const mergedData = { ...rowData, ...detailData };
                loadingEl?.remove();
                this._applyRowBodyData(inst, row, mergedData, rowBody);
            })
            .catch(() => {
                loadingEl?.remove();
                if (bodyEl) {
                    bodyEl.innerHTML = '<div class="q-table-row__body-error">Load failed</div>';
                }
            });
    },

    _applyRowBodyData(
        this: TableAbilityHost,
        inst: any,
        row: any,
        mergedData: any,
        rowBody: RowBodyConfig
    ): void {
        const content = rowBody.content as Record<string, any> | null | undefined;
        if (typeof content === 'object' && content?.type === 'table' && content?.dataField) {
            const subData = mergedData[content.dataField];
            if (inst && typeof inst.setData === 'function') {
                inst.setData('data', Array.isArray(subData) ? subData : []);
            } else if (row.bodyEl) {
                row.bodyEl.innerHTML = '';
            }
            return;
        }
        if (inst && typeof inst.setData === 'function') {
            inst.setData('data', mergedData);
        } else {
            const item = this._renderRowBody(row, mergedData);
            if (item) row.setBodyContent(item);
        }
    },

    _showBodyLoading(this: TableAbilityHost, bodyEl: HTMLElement, text: string): HTMLElement {
        const loadingEl = document.createElement('div');
        loadingEl.className = 'q-table-row__body-loading-overlay';
        const spinner = document.createElement('div');
        spinner.className = 'q-loading-spinner';
        const textEl = document.createElement('div');
        textEl.className = 'q-loading-text';
        textEl.textContent = text;
        loadingEl.appendChild(spinner);
        loadingEl.appendChild(textEl);
        bodyEl.appendChild(loadingEl);
        return loadingEl;
    },

    /**
     * 行 body 内容渲染 — 统一走 Container 四路解析
     *
     * content 求值（rowData 上下文）在 _resolveRowBodyContent 完成，
     * 产物（wrapper 或组件实例）交由 row.setBodyContent 挂载。
     */
    _renderRowBody(this: TableAbilityHost, row: any, rowData: any): any {
        const rowBody: RowBodyConfig = this.getData('rowBody');
        if (!rowBody || !row?.bodyEl) return null;

        const def = this._resolveRowBodyContent(rowBody, rowData);
        if (def == null) return null;
        return createItemFromDef(this, def);
    },

    /**
     * 求值 rowBody.content 为 Container 四路 def：
     * - 函数：html 求值（(rowData) => string）
     * - property-grid 配置：excludeColumns 派生 fields
     * - table 配置：dataField 从 rowData 提取初始 data
     * - 其余原样透传
     */
    _resolveRowBodyContent(this: TableAbilityHost, rowBody: RowBodyConfig, rowData: any): any {
        const c = rowBody.content;
        if (c == null) return null;

        if (typeof c === 'function') {
            const html = (c as (data: any) => string)(rowData);
            return typeof html === 'string' ? html : null;
        }
        if (typeof c === 'object' && !Array.isArray(c)) {
            const def = { ...(c as Record<string, any>) };
            if (def.type === 'property-grid') {
                if (!def.fields && def.excludeColumns) {
                    const columns: ColumnMeta[] = this.getData('columnMetas') || [];
                    const shownFields = new Set(columns.map((col: ColumnMeta) => col.field));
                    def.fields = Object.keys(rowData)
                        .filter(k => !k.startsWith('_') && !shownFields.has(k))
                        .map(k => ({ key: k }));
                }
                delete def.excludeColumns;
                return def;
            }
            if (def.type === 'table') {
                const subData = def.dataField ? rowData[def.dataField] : rowData;
                def.data = Array.isArray(subData) ? subData : [];
                delete def.dataField;
                return def;
            }
        }
        return c;
    },
} satisfies AbilityDefinition;
