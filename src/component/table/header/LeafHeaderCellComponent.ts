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
import type { TemplateDecl, DragOptions } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { LEAF_HEADER_CELL_TPL } from './leaf-header-cell-tpl';

type SortState = 'none' | 'asc' | 'desc';

const LeafHeaderCellComponentDefs: Definitions = {
    options: {
        sortable: false,
        resizable: true,
    },
} as const;

class LeafHeaderCellComponent extends BaseHeaderCellComponent {
    get tpl(): TemplateDecl {
        return LEAF_HEADER_CELL_TPL;
    }

    drag?: boolean | DragOptions = {
        axis: 'x',
        activeClass: 'q-header-cell__resize--active',
        handle: 'resizeHandle',
    };

    _sortState: SortState = 'none';
    _resizeStartWidth: number = 0;

    onAfterInit(): void {
        super.onAfterInit();
        this._applySortIcon();
        this._applyResizable();
    }

    _onSortableOptionChange(_value: boolean): void {
        this._applySortIcon();
    }

    _onResizableOptionChange(_value: boolean): void {
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
        if (!this.sortable) {
            this.setNodeStyle({ display: 'none' }, 'sortIcon');
            return;
        }
        this.setNodeStyle({ display: '' }, 'sortIcon');
        this.setNodeCls(`q-header-cell__sort q-header-cell__sort--${this._sortState}`, 'sortIcon');
    }

    _applyResizable(): void {
        this.setNodeStyle({ display: this.resizable ? '' : 'none' }, 'resizeHandle');
    }

    _onSortClick(): void {
        if (!this.sortable) return;
        const next: SortState =
            this._sortState === 'none' ? 'asc' : this._sortState === 'asc' ? 'desc' : 'none';
        this.sortState = next;

        if (next !== 'none') {
            this.entityEmit('sort', { direction: next as SortDirection }, { source: this.colName });
        } else {
            this.entityEmit('sort', { direction: null }, { source: this.colName });
        }

        this.emit('sortChange', {
            colName: this.colName,
            direction: next === 'none' ? null : next,
        });
    }

    onDragStart(_ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        if (!this.resizable) return;
        this._resizeStartWidth = this.el.offsetWidth;
    }

    onDragMove(ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        if (!this.resizable) return;
        const newWidth = Math.max(this.minWidth, this._resizeStartWidth + ctx.dx);
        this.emit('resize', {
            colName: this.colName,
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

LeafHeaderCellComponent.define(LeafHeaderCellComponentDefs);

export { LeafHeaderCellComponent };
/** 叶子表头单元格实例类型 */
export type LeafHeaderCellComponentInstance = InstanceType<typeof LeafHeaderCellComponent>;
