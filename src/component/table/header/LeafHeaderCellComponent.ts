/**
 * LeafHeaderCellComponent 叶子表头单元格组件
 *
 * 最底层列的表头单元格，提供：
 * - 排序图标（sortable 时显示，点击切换 asc/desc/none）
 * - 拖拽调整列宽（resizable 时显示 resize 手柄）
 * - 列拖拽 reorder（reorderable 时整个 cell 可拖）
 * - 排序 → emit('sortChange')
 * - 列宽变更 → emit('resize')
 * - 列位置变更 → emit('reorder')
 */

import { BaseHeaderCellComponent } from './BaseHeaderCellComponent';
import type { SortDirection } from '../column-types';
import type { TemplateDecl, DragOptions, DropOptions } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { LEAF_HEADER_CELL_TPL } from './leaf-header-cell-tpl';

type SortState = 'none' | 'asc' | 'desc';

const LeafHeaderCellComponentDefs: Definitions = {
    options: {
        sortable: false,
        resizable: true,
        reorderable: false,
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

    drop?: boolean | DropOptions = {
        accept: ['q-header-cell'],
        activeClass: 'q-header-cell--drop-target',
    };

    _sortState: SortState = 'none';
    _resizeStartWidth: number = 0;
    _isReorderDrag: boolean = false;

    onAfterInit(): void {
        super.onAfterInit();
        this._applySortIcon();
        this._applyResizable();
        this._applyReorderable();
    }

    _onSortableOptionChange(_value: boolean): void {
        this._applySortIcon();
    }

    _onResizableOptionChange(_value: boolean): void {
        this._applyResizable();
    }

    _onReorderableOptionChange(_value: boolean): void {
        this._applyReorderable();
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
            this.setStyles({ display: 'none' }, 'sortIcon');
            return;
        }
        this.setStyles({ display: '' }, 'sortIcon');
        this.setNodeCls(`q-header-cell__sort q-header-cell__sort--${this._sortState}`, 'sortIcon');
    }

    _applyResizable(): void {
        this.setStyles({ display: this.resizable ? '' : 'none' }, 'resizeHandle');
    }

    _applyReorderable(): void {
        if (this.reorderable) {
            this.setDraggable(true, {
                axis: 'x',
                type: 'q-header-cell',
                activeClass: 'q-header-cell--dragging',
            });
        } else {
            this.setDraggable(true, {
                axis: 'x',
                activeClass: 'q-header-cell__resize--active',
                handle: 'resizeHandle',
            });
        }
    }

    _onSortClick(): void {
        if (!this.sortable) return;
        const next: SortState =
            this._sortState === 'none' ? 'asc' : this._sortState === 'asc' ? 'desc' : 'none';
        this.sortState = next;

        this.emit('sortChange', {
            colName: this.colName,
            direction: next === 'none' ? null : next,
        });
    }

    onDragStart(ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        const target = ctx.originalEvent?.target as HTMLElement;
        const resizeHandleEl = this.getNodeEl('resizeHandle');
        this._isReorderDrag = this.reorderable && !(resizeHandleEl && resizeHandleEl.contains(target));

        if (this._isReorderDrag) {
            this.emit('reorderStart', { colName: this.colName });
            return;
        }

        if (!this.resizable) return;
        this._resizeStartWidth = this.el.offsetWidth;
    }

    onDragMove(ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        if (this._isReorderDrag) {
            this.emit('reorderMove', { colName: this.colName, dx: ctx.dx });
            return;
        }

        if (!this.resizable) return;
        const newWidth = Math.max(this.minWidth, this._resizeStartWidth + ctx.dx);
        this.emit('resize', {
            colName: this.colName,
            width: newWidth,
        });
    }

    onDragEnd(_ctx: { el: HTMLElement; originalEvent: Event }): void {
        if (this._isReorderDrag) {
            this.emit('reorderEnd', { colName: this.colName });
            this._isReorderDrag = false;
            return;
        }
        this._isReorderDrag = false;
    }

    onSelfDragDrop(ctx: any): void {
        if (!this.reorderable) return;
        const dragData = ctx?.dragData;
        if (dragData && dragData.colName && dragData.colName !== this.colName) {
            this.emit('reorder', { from: dragData.colName, to: this.colName });
        }
    }

    update(data: any): void {
        if (data?.title !== undefined) {
            this.setNodeText(String(data.title), 'title');
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
