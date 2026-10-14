import type { AbilityDefinition } from '@/composable';
import type {
    ColumnDef,
    ColumnDefOrGroup,
    ColumnGroupDef,
    ColumnMeta,
} from '../column-types';
import type { TableAbilityHost } from './types';

/**
 * TableColumnAbility — 列样式、固定列偏移、列宽、列可见性与移动
 *
 * 列宽/排序写入 --q-table-col-{name}-width/order CSS 变量；
 * fixed left/right 列按累积宽度写入 --q-table-col-{name}-fixed-offset；
 * rownumber 列宽随总行数位数自适应；hideColumn/showColumn 走
 * componentEmit 广播（header/rows/summary 共享 eventKey 总线）。
 */
export const TableColumnAbility = {
    _onColumnResize(this: TableAbilityHost, data: any): void {
        const colName = data?.colName ?? data?.actionData?.colName;
        const width = data?.actionData?.width ?? data?.width;
        if (!colName || width === undefined) return;
        this.el.style.setProperty(`--q-table-col-${colName}-width`, `${width}px`);
        if (this._columnMetaManager) {
            const meta = this._columnMetaManager.get(colName);
            if (meta) meta.width = `${width}px`;
            this._applyFixedColumnOffsets(this._columnMetaManager.getAll());
        }
    },

    _prepareColumnsForHeader(this: TableAbilityHost, columns: ColumnDefOrGroup[]): ColumnDefOrGroup[] {
        return columns.map(col => {
            if ('children' in col && Array.isArray((col as ColumnGroupDef).children)) {
                const group = col as ColumnGroupDef;
                return { ...group, children: this._prepareColumnsForHeader(group.children) };
            }
            const leaf = col as ColumnDef;
            if (leaf.cellType === 'rownumber') {
                return { ...leaf, name: '_rownum', title: leaf.title ?? '#' };
            }
            return leaf;
        });
    },

    _applyColumnStyles(this: TableAbilityHost): void {
        if (!this._columnMetaManager) return;
        const metas = this._columnMetaManager.getAll();
        if (!this.getColumnOrderCount()) {
            this.initColumnOrder({ useCssVar: true, cssVarPrefix: '--q-table-col-' });
        }
        const data = this.hasEntity() ? this.getEntityItems() : (this.getData('data') ?? []);
        const totalRows = this._isGroupedData(data)
            ? data.reduce((sum: number, g: any) => sum + (g.groupItems?.length ?? 0), 0)
            : data.length;
        for (let i = 0; i < metas.length; i++) {
            const meta = metas[i];
            let width = meta.width;
            if (meta.cellType === 'rownumber') {
                width = this._computeRowNumberWidth(totalRows, meta.width);
            }
            if (width) {
                this.el.style.setProperty(`--q-table-col-${meta.name}-width`, width);
            }
            this.registerColumnEntry(meta.name, null, i, { isLeaf: true });
        }
        this._applyFixedColumnOffsets(metas);
        this._setGroupColumnOrderVars();
        this._applyRowBgVars();
    },

    _applyFixedColumnOffsets(this: TableAbilityHost, metas: ColumnMeta[]): void {
        let leftOffset = 0;
        let rightOffset = 0;
        const leftFixed: ColumnMeta[] = [];
        const rightFixed: ColumnMeta[] = [];
        for (const meta of metas) {
            if (meta.fixed === 'left') leftFixed.push(meta);
            else if (meta.fixed === 'right') rightFixed.push(meta);
        }
        for (const meta of leftFixed) {
            this.el.style.setProperty(`--q-table-col-${meta.name}-fixed-offset`, `${leftOffset}px`);
            const w = this._resolveFixedWidth(meta);
            if (w) leftOffset += w;
        }
        for (let i = rightFixed.length - 1; i >= 0; i--) {
            const meta = rightFixed[i];
            this.el.style.setProperty(`--q-table-col-${meta.name}-fixed-offset`, `${rightOffset}px`);
            const w = this._resolveFixedWidth(meta);
            if (w) rightOffset += w;
        }
    },

    _resolveFixedWidth(this: TableAbilityHost, meta: ColumnMeta): number {
        if (meta.cellType === 'rownumber') {
            const data = this.hasEntity() ? this.getEntityItems() : (this.getData('data') ?? []);
            const totalRows = this._isGroupedData(data)
                ? data.reduce((sum: number, g: any) => sum + (g.groupItems?.length ?? 0), 0)
                : data.length;
            const w = this._computeRowNumberWidth(totalRows, meta.width);
            return parseInt(w, 10) || 0;
        }
        if (meta.width && meta.width !== 'auto') {
            return parseInt(meta.width, 10) || 0;
        }
        return 0;
    },

    _computeRowNumberWidth(this: TableAbilityHost, totalRows: number, userWidth?: string): string {
        if (userWidth && userWidth !== 'auto') return userWidth;
        const digits = Math.max(1, String(totalRows).length);
        return `${32 + digits * 8}px`;
    },

    _setGroupColumnOrderVars(this: TableAbilityHost): void {
        const columns = this.getData('columns') || [];
        const step = this.step ?? 100;
        this._traverseGroupOrders(columns, 0, step);
    },

    _traverseGroupOrders(
        this: TableAbilityHost,
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
                this.el.style.setProperty(`--q-table-col-${group.name}-order`, String(groupOrder));
            } else {
                leafIndex++;
            }
        }
        return leafIndex;
    },

    _updateItemsColumnMetas(this: TableAbilityHost): void {
        const metas = this._columnMetaManager!.getAll();
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const item of items) {
            if (typeof item.update === 'function') {
                item.update({ columnMetas: metas });
            }
        }
    },

    _isReorderOnly(this: TableAbilityHost, oldMetas: ColumnMeta[], newMetas: ColumnMeta[]): boolean {
        if (oldMetas.length !== newMetas.length) return false;
        const oldNames = new Set(oldMetas.map(m => m.name));
        for (const m of newMetas) {
            if (!oldNames.has(m.name)) return false;
        }
        return true;
    },

    hideColumn(this: TableAbilityHost, name: string): void {
        this.componentEmit('hideColumn', { colName: name });
    },

    showColumn(this: TableAbilityHost, name: string): void {
        this.componentEmit('showColumn', { colName: name });
    },

    _onHideColumn(this: TableAbilityHost, data: any): void {
        const colName = data?.colName;
        if (!colName) return;
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const item of items) {
            if (typeof item.hideColumn === 'function') item.hideColumn(colName);
        }
    },

    _onShowColumn(this: TableAbilityHost, data: any): void {
        const colName = data?.colName;
        if (!colName) return;
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const item of items) {
            if (typeof item.showColumn === 'function') item.showColumn(colName);
        }
    },

    moveColumn(this: TableAbilityHost, from: number, to: number): void {
        if (this._header && typeof this._header.moveColumn === 'function') {
            this._header.moveColumn(from, to);
        }
    },
} satisfies AbilityDefinition;
