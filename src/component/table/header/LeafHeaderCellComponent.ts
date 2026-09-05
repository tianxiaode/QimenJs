/**
 * LeafHeaderCellComponent 叶子表头单元格组件
 *
 * 最底层列的表头单元格，提供：
 * - 排序图标（sortable 时显示，点击切换 asc/desc/none）
 * - 拖拽调整列宽（resizable 时显示 resize 手柄，走 attachDrag）
 * - 排序 → entityEmit（实体事件，数据层响应）
 * - 列宽变更 → emit('resize')（组件事件，Table 层更新 CSS 变量）
 */

import { BaseHeaderCellComponent } from './BaseHeaderCellComponent';
import type { SortDirection } from '../column-types';
import type { TplNode, DragOptions } from '@qimenjs/component-core';
import { LEAF_HEADER_CELL_TPL } from './leaf-header-cell-tpl';

type SortState = 'none' | 'asc' | 'desc';

class LeafHeaderCellComponent extends BaseHeaderCellComponent {
    get tpl(): TplNode {
        return LEAF_HEADER_CELL_TPL;
    }

    drag?: boolean | DragOptions = {
        axis: 'x',
        activeClass: 'q-header-cell__resize--active',
        handle: 'resizeHandle',
    };

    _sortable: boolean = false;
    _resizable: boolean = true;
    _sortState: SortState = 'none';
    _resizeStartWidth: number = 0;

    onAfterInit(props?: Record<string, any>): void {
        super.onAfterInit(props);
        if (props?.sortable !== undefined) this._sortable = props.sortable;
        if (props?.resizable !== undefined) this._resizable = props.resizable;
        this._applySortIcon();
        this._applyResizable();
    }

    get sortState(): SortState {
        return this._sortState;
    }
    set sortState(v: SortState) {
        this._sortState = v;
        this._applySortIcon();
    }

    _applySortIcon(): void {
        if (!this._sortable) {
            this.setNodeStyle({ display: 'none' }, 'sortIcon');
            return;
        }
        this.setNodeStyle({ display: '' }, 'sortIcon');
        this.setNodeCls(`q-header-cell__sort q-header-cell__sort--${this._sortState}`, 'sortIcon');
    }

    _applyResizable(): void {
        this.setNodeStyle({ display: this._resizable ? '' : 'none' }, 'resizeHandle');
    }

    _onSortClick(): void {
        if (!this._sortable) return;
        const next: SortState =
            this._sortState === 'none' ? 'asc' : this._sortState === 'asc' ? 'desc' : 'none';
        this.sortState = next;

        if (next !== 'none') {
            this.entityEmit('sort', { direction: next as SortDirection }, { source: this._colName });
        } else {
            this.entityEmit('sort', { direction: null }, { source: this._colName });
        }

        this.emit('sortChange', {
            colName: this._colName,
            direction: next === 'none' ? null : next,
        });
    }

    onDragStart(_ctx: {
        dx: number;
        dy: number;
        el: HTMLElement;
        originalEvent: Event;
    }): void {
        if (!this._resizable) return;
        this._resizeStartWidth = this.el.offsetWidth;
    }

    onDragMove(ctx: {
        dx: number;
        dy: number;
        el: HTMLElement;
        originalEvent: Event;
    }): void {
        if (!this._resizable) return;
        const newWidth = Math.max(this._minWidth, this._resizeStartWidth + ctx.dx);
        this.emit('resize', {
            colName: this._colName,
            width: newWidth,
        });
    }

    onDragEnd(_ctx: { el: HTMLElement; originalEvent: Event }): void {}

    update(data: any): void {
        if (data?.title !== undefined) {
            this.setNodeProp('text', String(data.title), 'titleText');
        }
        if (data?.sortState !== undefined) {
            this.sortState = data.sortState;
        }
    }
}

export { LeafHeaderCellComponent };
/** 叶子表头单元格实例类型 */
export type LeafHeaderCellComponentInstance = InstanceType<typeof LeafHeaderCellComponent>;
