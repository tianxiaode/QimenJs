/**
 * LeafHeaderCellComponent 叶子表头单元格组件
 *
 * 最底层列的表头单元格，提供：
 * - 排序图标（sortable 时显示，点击切换 asc/desc/none）
 * - 拖拽调整列宽（resizable 时显示 resize 手柄，走 body.drags 声明式）
 * - 排序 → entityEmit（实体事件，数据层响应）
 * - 列宽变更 → emit('resize')（组件事件，Table 层更新 CSS 变量）
 */

import { BaseHeaderCellComponent } from './BaseHeaderCellComponent';
import type { ColumnAlign, SortDirection } from '../column-types';

export interface LeafHeaderCellProps {
    colName: string;
    title?: string;
    align?: ColumnAlign;
    sortable?: boolean;
    resizable?: boolean;
    minWidth?: number;
}

type SortState = 'none' | 'asc' | 'desc';

export let LeafHeaderCellComponent = BaseHeaderCellComponent.replace({

    tplReplaces: {
        content: {
            tag: 'div',
            name: 'content',
            cls: 'q-header-cell__content',
            children: [
                { tag: 'span', name: 'titleText', cls: 'q-header-cell__title' },
                { tag: 'span', name: 'sortIcon', cls: 'q-header-cell__sort' },
            ],
        },
    },

    body: {
        drags: {
            resizeHandle: { axis: 'x', activeClass: 'q-header-cell__resize--active' },
        },

        _sortable: false as boolean,
        _resizable: true as boolean,
        _sortState: 'none' as SortState,
        _resizeStartWidth: 0 as number,

        onAfterInit(props?: LeafHeaderCellProps): void {
            const self = this as any;
            if (props?.sortable !== undefined) self._sortable = props.sortable;
            if (props?.resizable !== undefined) self._resizable = props.resizable;
            self._applySortIcon();
            self._applyResizable();
        },

        get sortState(): SortState {
            const self = this as any;
            return self._sortState;
        },
        set sortState(v: SortState) {
            const self = this as any;
            self._sortState = v;
            self._applySortIcon();
        },

        _applySortIcon(): void {
            const self = this as any;
            const icon = self.nodeMap?.sortIcon?.el as HTMLElement | null;
            if (!icon) return;
            if (!self._sortable) {
                icon.style.display = 'none';
                return;
            }
            icon.style.display = '';
            icon.className = `q-header-cell__sort q-header-cell__sort--${self._sortState}`;
        },

        _applyResizable(): void {
            const self = this as any;
            const handle = self.nodeMap?.resizeHandle?.el as HTMLElement | null;
            if (!handle) return;
            handle.style.display = self._resizable ? '' : 'none';
        },

        _onSortClick(): void {
            const self = this as any;
            if (!self._sortable) return;
            const next: SortState =
                self._sortState === 'none' ? 'asc' : self._sortState === 'asc' ? 'desc' : 'none';
            self.sortState = next;

            if (next !== 'none') {
                self.entityEmit({
                    source: self._colName,
                    type: 'sort',
                    data: { direction: next as SortDirection },
                });
            } else {
                self.entityEmit({
                    source: self._colName,
                    type: 'sort',
                    data: { direction: null },
                });
            }

            self.emit('sortChange', {
                colName: self._colName,
                direction: next === 'none' ? null : next,
            });
        },

        onResizeHandleDragStart(ctx: {
            dx: number;
            dy: number;
            el: HTMLElement;
            originalEvent: Event;
        }): void {
            const self = this as any;
            if (!self._resizable) return;
            self._resizeStartWidth = self.el.offsetWidth;
        },

        onResizeHandleDragMove(ctx: {
            dx: number;
            dy: number;
            el: HTMLElement;
            originalEvent: Event;
        }): void {
            const self = this as any;
            if (!self._resizable) return;
            const newWidth = Math.max(self._minWidth, self._resizeStartWidth + ctx.dx);
            self.emit('resize', {
                colName: self._colName,
                width: newWidth,
            });
        },

        onResizeHandleDragEnd(_ctx: { el: HTMLElement; originalEvent: Event }): void {},

        update(data: any): void {
            const self = this as any;
            if (data?.title !== undefined) {
                self.setNodeProp('text', String(data.title), 'titleText');
            }
            if (data?.sortState !== undefined) {
                self.sortState = data.sortState;
            }
        },
    },
});

export type LeafHeaderCellComponentType = InstanceType<typeof LeafHeaderCellComponent>;
