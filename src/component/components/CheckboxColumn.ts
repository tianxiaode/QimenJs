/**
 * CheckboxColumn 复选框列
 *
 * 专用于行选择的复选框列，列头有全选复选框，每行有单选复选框。
 * 使用 SelectableAbility 管理选中状态。
 *
 * @example
 * ```js
 * { type: ComponentTypes.CHECKBOX_COLUMN, field: '_selected', label: '' }
 * ```
 */

import { ColumnBase } from './ColumnBase';
import { SelectableAbility } from '@qimenjs/component-abilities';
import type { ColumnDefinition } from '@qimenjs/component-abilities';

export class CheckboxColumn extends ColumnBase {
    static override readonly abilities = [...ColumnBase.abilities, SelectableAbility];

    /** 已选中的行 ID 集合 */
    private _selectedRows: Set<string | number> = new Set();

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.className = 'q-column q-column--checkbox';

        // 复选框列默认配置
        this._width = 40;
        this._align = 'center';

        // 从 props 覆盖
        if (props?.width) this._width = props.width;
        if (props?.align) this._align = props.align;
    }

    /** selectedRows getter */
    get selectedRows(): Set<string | number> {
        return this._selectedRows;
    }

    /** 选中行数 */
    get selectedCount(): number {
        return this._selectedRows.size;
    }

    /** 选中指定行 */
    selectRow(rowId: string | number): void {
        this._selectedRows.add(rowId);
        this.emit?.('rowselect', { rowId, selected: true });
        this.emit?.('selectionchange', { selectedRows: this._selectedRows });
    }

    /** 取消选中指定行 */
    deselectRow(rowId: string | number): void {
        this._selectedRows.delete(rowId);
        this.emit?.('rowselect', { rowId, selected: false });
        this.emit?.('selectionchange', { selectedRows: this._selectedRows });
    }

    /** 切换行选中状态 */
    toggleRow(rowId: string | number): void {
        if (this._selectedRows.has(rowId)) {
            this.deselectRow(rowId);
        } else {
            this.selectRow(rowId);
        }
    }

    /** 全选 */
    selectAll(rowIds: (string | number)[]): void {
        for (const id of rowIds) {
            this._selectedRows.add(id);
        }
        this.emit?.('selectionchange', { selectedRows: this._selectedRows });
    }

    /** 清空选中 */
    clearSelection(): void {
        this._selectedRows.clear();
        this.emit?.('selectionchange', { selectedRows: this._selectedRows });
    }

    /** 判断行是否选中 */
    isRowSelected(rowId: string | number): boolean {
        return this._selectedRows.has(rowId);
    }

    override toDefinition(): ColumnDefinition {
        const def = super.toDefinition();
        def.width = this._width;
        def.align = this._align;
        def.sortable = false;

        // 复选框列使用自定义渲染器
        def.renderer = (value: any, row: Record<string, any>) => {
            const rowId = row.id ?? row._id ?? '';
            const checked = this._selectedRows.has(rowId);
            return checked ? '☑' : '☐';
        };

        return def;
    }
}
