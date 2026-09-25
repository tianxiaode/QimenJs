/**
 * LeafHeaderCellComponent 叶子表头单元格组件
 *
 * 最底层列的表头单元格，提供：
 * - 排序图标（sortable 时显示，点击切换 asc/desc/none）
 * - 拖拽调整列宽（resizable 时显示 resize 手柄）
 * - 排序 → emit('sortChange')
 * - 列宽变更 →: emit('resize')
 */

import { BaseHeaderCellComponent } from './BaseHeaderCellComponent';
import type { TemplateDecl, DragOptions } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { LEAF_HEADER_CELL_TPL } from './leaf-header-cell-tpl';

type SortState = 'none' | 'asc' | 'desc';

const SORT_CLS_PREFIX = 'q-header-cell__sort--';

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
            this.setStyles({ display: 'none' }, 'sortIcon');
            return;
        }
        this.setStyles({ display: '' }, 'sortIcon');
        this.removeCls([`${SORT_CLS_PREFIX}none`, `${SORT_CLS_PREFIX}asc`, `${SORT_CLS_PREFIX}desc`], 'sortIcon');
        this.addCls(`${SORT_CLS_PREFIX}${this._sortState}`, 'sortIcon');
    }

    _applyResizable(): void {
        this.setStyles({ display: this.resizable ? '' : 'none' }, 'resizeHandle');
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
