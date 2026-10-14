import type { AbilityDefinition } from '@/composable';
import type { TableAbilityHost } from './types';
import type { ColumnDefOrGroup } from '../column-types';

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

        const content = this._renderRowBody(row, rowData);
        if (content) {
            row.setBodyContent(content);
        }

        this.emit('rowExpand', data);
    },

    _onRowCollapse(this: TableAbilityHost, data: any): void {
        const rowKey = data?.rowKey;
        if (rowKey == null) return;

        this.emit('rowCollapse', data);
    },

    _renderRowBody(this: TableAbilityHost, _row: any, _rowData: any): any {
        return null;
    },
} satisfies AbilityDefinition;
