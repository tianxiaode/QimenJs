import type { AbilityDefinition } from '@/composable';
import type { RangeLoadedData } from '@/entity/abilities/remote/RangeLoadAbility';
import type { TableAbilityHost } from './types';

/**
 * VirtualEntityAbility — 虚拟滚动 + Entity 按需加载集成
 *
 * _renderVirtualItems 发现缺失范围时触发 LOAD_RANGE 命令（_pendingRanges
 * 防重复请求），RANGE_LOADED 回填 sparse _virtualData 后 rAF 重渲染。
 */
export const VirtualEntityAbility = {
    _onVirtualDataMissing(this: TableAbilityHost, start: number, end: number): void {
        if (this._virtualEntityMode) {
            const clampedEnd = Math.min(end, this._entityTotal);
            if (start >= clampedEnd) return;
            if (!this._pendingRanges) this._pendingRanges = new Set();
            const key = `${start}-${clampedEnd}`;
            if (this._pendingRanges.has(key)) return;
            this._pendingRanges.add(key);
            this.entityLoadRange(start, clampedEnd);
        }
    },

    onEntityRangeLoaded(this: TableAbilityHost, data: RangeLoadedData): void {
        if (!this._virtualEntityMode) return;
        this._entityTotal = data.total;
        if (this._pendingRanges) {
            this._pendingRanges.delete(`${data.start}-${data.end}`);
        }
        const metas = this._columnMetaManager?.getAll() ?? [];
        const selectDisabledFn = this.getData('selectDisabled');
        const computeDisabled = (rowData: any): boolean => {
            if (rowData?._selectDisabled) return true;
            if (typeof selectDisabledFn === 'function') {
                try { return !!selectDisabledFn(rowData); } catch { return false; }
            }
            return false;
        };

        for (let i = 0; i < data.items.length; i++) {
            const rowData = data.items[i];
            if (rowData == null) continue;
            const idx = data.start + i;
            if (idx >= this._virtualData.length) continue;
            this._virtualData[idx] = {
                data: { ...rowData, _rowKey: String(rowData?.id ?? `row-${idx}`), _rowNumber: idx + 1, _selectDisabled: computeDisabled(rowData) },
                columnMetas: metas,
            };
        }

        if (this._scrollUnbind) {
            requestAnimationFrame(() => {
                this._renderVirtualItems();
                this._applyZebraStripes();
            });
        }
    },
} satisfies AbilityDefinition;
