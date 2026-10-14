import type { AbilityDefinition } from '@/composable';
import type { ColumnMeta, TableSelectMode } from '../column-types';
import type { TableAbilityHost } from './types';

/**
 * RowSelectAbility — 表格行选择交互
 *
 * selectable option 驱动（none/single/multiple），选择列存在时只有点击
 * 选择列单元格才触发选中；header 全选状态与行选中状态双向同步；
 * selectDisabled 函数命中的行自动取消选中。
 */
export const RowSelectAbility = {
    _onSelectableOptionChange(this: TableAbilityHost, value: TableSelectMode): void {
        if (value === 'none') {
            this.clearSelection();
            this._syncRowSelectedStates();
            this._updateHeaderSelectAllState();
        } else {
            this.initSelection({ mode: value === 'multiple' ? 'multiple' : 'single' });
            this._syncRowSelectedStates();
            this._updateHeaderSelectAllState();
        }
        if (this._header && this._header.getData('selectable') !== value) {
            this._header.selectable = value;
        }
    },

    /**
     * 行点击 — domEvents 委托，选择模式下切换选中 + 同步行状态
     * selectionChanged 事件由 domEvents emits 配置自动转发
     * 有选择列的行禁用默认行选择，只有点击选择列单元格才触发选中
     */
    _onRowClick(this: TableAbilityHost, domEvt: any): void {
        if (this.getData('selectable') === 'none') return;
        const item = domEvt?.targetComponent;
        if (!item) return;
        const data = item.getData?.('data');
        if (!data || data._selectDisabled || !data._rowKey) return;
        if (this._rowHasSelectionCell(item) && !this._isSelectionCellClick(item, domEvt)) return;
        this.toggleSelect(data._rowKey, data);
        this._syncRowSelectedStates();
        this._updateHeaderSelectAllState();
    },

    _rowHasSelectionCell(this: TableAbilityHost, row: any): boolean {
        const metas = row?.getData?.('columnMetas') || [];
        return metas.some((m: ColumnMeta) => m.selection);
    },

    _isSelectionCellClick(this: TableAbilityHost, row: any, domEvt: any): boolean {
        const clickTarget = domEvt?.data?.originalEvent?.target as HTMLElement | undefined;
        if (!clickTarget) return false;
        const metas = row?.getData?.('columnMetas') || [];
        for (const meta of metas) {
            if (!meta.selection) continue;
            const cell = row?._cells?.get(meta.name);
            if (cell?.el?.contains(clickTarget)) return true;
        }
        return false;
    },

    /**
     * 收集全部可选行（multiple 模式全选用）
     */
    _collectSelectableEntries(this: TableAbilityHost): Array<{ key: string; data: any }> {
        const entries: Array<{ key: string; data: any }> = [];
        const items = this.items;
        if (!Array.isArray(items)) return entries;
        for (const item of items) {
            const data = item?.getData?.('data');
            if (!data?._rowKey || data?._selectDisabled) continue;
            entries.push({ key: data._rowKey, data });
        }
        return entries;
    },

    /**
     * 全选/清空切换 — multiple 模式
     */
    toggleAllSelection(this: TableAbilityHost): void {
        const entries = this._collectSelectableEntries();
        if (entries.length === 0) return;
        if (this.getSelectionCount() >= entries.length) {
            this.clearSelection();
        } else {
            this.selectAll(entries);
        }
        this._syncRowSelectedStates();
        this._updateHeaderSelectAllState();
        this.emit('selectionChanged', this.defaultEventData);
    },

    _syncRowSelectedStates(this: TableAbilityHost): void {
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const item of items) {
            const data = item.getData?.('data');
            if (!data?._rowKey) continue;
            const selected = this.isSelected(data._rowKey);
            Promise.resolve(item.ready).then(() => {
                if (typeof item.dispose === 'function' && item.isDisposed?.()) return;
                item.setData('selected', selected);
            });
        }
    },

    _updateHeaderSelectAllState(this: TableAbilityHost): void {
        if (!this._header || typeof (this._header as any).setSelectAllState !== 'function') return;
        const selectable = this.getData('selectable');
        if (selectable !== 'multiple') return;
        const entries = this._collectSelectableEntries();
        const selectedCount = entries.filter(e => this.isSelected(e.key)).length;
        (this._header as any).setSelectAllState(
            entries.length > 0 && selectedCount === entries.length,
            selectedCount > 0 && selectedCount < entries.length
        );
    },

    /**
     * 取消已被禁选的行的选中状态（selectDisabled 函数可能在 reflow 后对已选行返回 true）
     */
    _deselectDisabledRows(this: TableAbilityHost): void {
        if (this.getData('selectable') === 'none') return;
        const items = this.items;
        if (!Array.isArray(items)) return;
        let changed = false;
        for (const item of items) {
            const data = item?.getData?.('data');
            if (!data?._rowKey || !data?._selectDisabled) continue;
            if (this.isSelected(data._rowKey)) {
                this.deselect(data._rowKey);
                changed = true;
            }
        }
        if (changed) this._updateHeaderSelectAllState();
    },
} satisfies AbilityDefinition;
