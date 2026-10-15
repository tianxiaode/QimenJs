import type { AbilityDefinition } from '@/composable';
import type { TableAbilityHost } from './types';
import type { ColumnDefOrGroup, ColumnMeta, TemplateDecl, RowBodyConfig } from '../column-types';
import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';
import { ENTITY_LIST_EVENTS } from '@/events';

function isTemplateDecl(value: any): value is TemplateDecl {
    return !!value && typeof value === 'object' && ('tag' in value || 'children' in value);
}

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

    _renderRowBodyWithEntity(this: TableAbilityHost, row: any, rowData: any, rowKey: string, rowBody: RowBodyConfig): void {
        const entityKey = this.entityKey;
        if (!entityKey) {
            const content = this._renderRowBody(row, rowData);
            if (content) row.setBodyContent(content);
            return;
        }

        const bodyEl = row.bodyEl;
        const loadingText = rowBody.loadingText ?? 'Loading...';
        bodyEl.innerHTML = `<div class="q-table-row__body-loading">${loadingText}</div>`;

        const paramField = rowBody.entityParamField ?? 'id';
        const paramValue = rowData[paramField] ?? rowKey;
        const action = rowBody.entityAction;

        const offGot = this.entityOn(entityKey, ENTITY_LIST_EVENTS.GOT, (detailData: any) => {
            offGot?.();
            offError?.();
            if (detailData) {
                this._bodyCache.set(rowKey, detailData);
                const mergedData = { ...rowData, ...detailData };
                const content = this._renderRowBody(row, mergedData);
                if (content) row.setBodyContent(content);
            }
        });

        const offError = this.entityOn(entityKey, 'get:error', () => {
            offGot?.();
            offError?.();
            bodyEl.innerHTML = '<div class="q-table-row__body-error">Load failed</div>';
        });

        this.entityEmit(action, { id: paramValue }, { source: entityKey });
    },

    _renderRowBodyWithLoaderFn(this: TableAbilityHost, row: any, rowData: any, rowKey: string, rowBody: RowBodyConfig): void {
        const bodyEl = row.bodyEl;
        const loadingText = rowBody.loadingText ?? 'Loading...';
        bodyEl.innerHTML = `<div class="q-table-row__body-loading">${loadingText}</div>`;

        rowBody.loader!(rowKey, rowData).then((detailData: any) => {
            this._bodyCache.set(rowKey, detailData);
            const mergedData = { ...rowData, ...detailData };
            const content = this._renderRowBody(row, mergedData);
            if (content) row.setBodyContent(content);
        }).catch(() => {
            bodyEl.innerHTML = '<div class="q-table-row__body-error">Load failed</div>';
        });
    },

    _renderRowBody(this: TableAbilityHost, row: any, rowData: any): any {
        const rowBody: RowBodyConfig = this.getData('rowBody');
        if (!rowBody || !row?.bodyEl) return null;

        const bodyEl = row.bodyEl;

        switch (rowBody.type) {
            case 'html': {
                const htmlContent = typeof rowBody.html === 'function'
                    ? rowBody.html(rowData)
                    : rowBody.html;
                if (typeof htmlContent === 'string') {
                    bodyEl.innerHTML = htmlContent;
                }
                return { el: bodyEl, dispose: () => { bodyEl.innerHTML = ''; } };
            }

            case 'template': {
                const tpl = rowBody.template;
                if (!isTemplateDecl(tpl)) return null;
                const BaseCtor = ComponentRegistrar.getInstance().get('component') as any;
                const SlotCls = BaseCtor.extend({ type: 'row-body-slot', tpl });
                const inst = new SlotCls({ container: bodyEl });
                return inst;
            }

            case 'property-grid': {
                const PropertyGridCtor = ComponentRegistrar.getInstance().get('property-grid') as any;
                if (!PropertyGridCtor) return null;
                let fields = rowBody.fields;
                if (!fields && rowBody.excludeColumns) {
                    const columns: ColumnMeta[] = this.getData('columnMetas') || [];
                    const shownFields = new Set(columns.map((c: ColumnMeta) => c.field));
                    fields = Object.keys(rowData)
                        .filter(k => !k.startsWith('_') && !shownFields.has(k))
                        .map(k => ({ key: k }));
                }
                const inst = new PropertyGridCtor({
                    fields,
                    data: rowData,
                    cols: rowBody.cols ?? 2,
                    i18nScope: rowBody.i18nScope ?? '',
                });
                return inst;
            }

            case 'table': {
                const TableCtor = ComponentRegistrar.getInstance().get('table') as any;
                if (!TableCtor) return null;
                const subData = rowBody.dataField ? rowData[rowBody.dataField] : rowData;
                const options: Record<string, any> = {
                    data: Array.isArray(subData) ? subData : [],
                    ...(rowBody.tableOptions ?? {}),
                };
                const inst = new TableCtor(options);
                return inst;
            }

            case 'component': {
                const ComponentCtor = rowBody.component;
                if (typeof ComponentCtor !== 'function') return null;
                const inst = new ComponentCtor({ container: bodyEl });
                if (typeof inst.update === 'function') {
                    inst.update({ data: rowData });
                }
                return inst;
            }

            default:
                return null;
        }
    },
} satisfies AbilityDefinition;