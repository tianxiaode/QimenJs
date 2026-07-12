/**
 * TableComponent 表格组件
 *
 * abilities: [ElementEventAbility, EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ColumnManageAbility, ChildrenAbility]
 * 支持虚拟列表、排序、列定义、列管理、选择、事件桥接（基类已包含 EventBridgeAbility）
 * ElementEventAbility 自动绑定模板中 data-event 声明的事件
 *
 * 事件处理（由 ElementEventAbility 自动绑定）：
 * - onBodyScroll — table:bodyScroll 的 scroll 事件（方法名从 data-content 推导）
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { ElementEventAbility } from '@qimenjs/component-abilities';
import { EntityAbility } from '@qimenjs/component-abilities';
import { VirtualListAbility } from '@qimenjs/component-abilities';
import { SortAbility } from '@qimenjs/component-abilities';
import { ColumnAbility, type ColumnDefinition } from '@qimenjs/component-abilities';
import { ColumnManageAbility } from '@qimenjs/component-abilities';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { TABLE_EVENTS, ENTITY_EVENTS, SELECTION_EVENTS } from '../events';
import { TABLE_TEMPLATE } from '@qimenjs/component-core';

const TableBase = TemplateComponent.withTemplate(TABLE_TEMPLATE);

export class TableComponent extends TableBase {
    static readonly abilities = [ElementEventAbility, EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ColumnManageAbility, ChildrenAbility];

    /** 行高（虚拟列表用） */
    private _rowHeight: number = 40;

    /** 容器高度 */
    private _containerHeight: number = 400;

    /** 缓冲行数 */
    private _bufferCount: number = 2;

    /** 滚动位置 */
    private _scrollTop: number = 0;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-table');

        // 设置初始属性
        if (props?.rowHeight) this._rowHeight = props.rowHeight;
        if (props?.containerHeight) this._containerHeight = props.containerHeight;
        if (props?.columns) this.columns = props.columns;

        // 设置容器高度
        const bodyEntry = this.nodeMap['table']?.['bodyScroll'];
        if (bodyEntry?.el) {
            bodyEntry.el.style.height = `${this._containerHeight}px`;
        }

        // 渲染表头
        this.renderHeader();
    }

    onBodyScroll(_event: Event, el: HTMLElement): void {
        this._scrollTop = el.scrollTop;
        this.renderRows();
    }

    get rowHeight(): number {
        return this._rowHeight;
    }
    set rowHeight(value: number) {
        this._rowHeight = value;
        this.renderRows();
    }

    get visibleCount(): number {
        if (this._rowHeight <= 0) return 0;
        return Math.ceil(this._containerHeight / this._rowHeight);
    }

    get startIndex(): number {
        if (this._rowHeight <= 0) return 0;
        return Math.max(0, Math.floor(this._scrollTop / this._rowHeight) - this._bufferCount);
    }

    get totalHeight(): number {
        const data = this.mgr?.items || [];
        return data.length * this._rowHeight;
    }

    update(props?: Record<string, any>): void {
        if (props?.columns) this.columns = props.columns;
        this.renderHeader();
        this.renderRows();
    }

    private renderHeader(): void {
        const headerEl = this.nodeMap['table']?.['headerRow']?.el;
        if (!headerEl) return;

        const cols = this.getVisibleColumns?.() || this.columns || [];
        headerEl.innerHTML = '';

        const rowEl = document.createElement('div');
        rowEl.className = 'q-table__header-row q-flex';

        for (const col of cols as ColumnDefinition[]) {
            const cellEl = document.createElement('div');
            cellEl.className = 'q-table__header-cell';
            if (col.headerClass) cellEl.classList.add(...col.headerClass.split(/\s+/));
            cellEl.style.flex = '1';
            if (col.width) {
                cellEl.style.width = typeof col.width === 'number' ? `${col.width}px` : col.width;
                cellEl.style.flex = 'none';
            }
            if (col.align) cellEl.style.textAlign = col.align;
            if (col.headerStyle) Object.assign(cellEl.style, col.headerStyle);
            cellEl.textContent = col.label || col.field || '';
            rowEl.appendChild(cellEl);
        }

        headerEl.appendChild(rowEl);
    }

    private renderRows(): void {
        const bodyEl = this.nodeMap['table']?.['bodyScroll']?.el;
        if (!bodyEl) return;

        const data = this.mgr?.items || [];
        const cols = this.columns || [];
        const start = this.startIndex;
        const count = this.visibleCount + this._bufferCount * 2;
        const end = Math.min(start + count, data.length);

        bodyEl.style.position = 'relative';
        bodyEl.innerHTML = '';

        const spacer = document.createElement('div');
        spacer.style.height = `${this.totalHeight}px`;
        spacer.style.position = 'relative';
        bodyEl.appendChild(spacer);

        for (let i = start; i < end; i++) {
            const row = data[i];
            const rowEl = document.createElement('div');
            rowEl.className = 'q-table__row q-flex';
            rowEl.style.position = 'absolute';
            rowEl.style.top = `${i * this._rowHeight}px`;
            rowEl.style.height = `${this._rowHeight}px`;
            rowEl.style.width = '100%';

            for (const col of cols as ColumnDefinition[]) {
                if (col.hidden) continue;
                if (typeof col.hiddenWhen === 'function' && col.hiddenWhen(row, col)) continue;

                const cellEl = document.createElement('div');
                cellEl.className = 'q-table__cell';

                const cellClass = this.getCellClass?.(col, row);
                if (cellClass) cellEl.classList.add(...cellClass.split(/\s+/));

                cellEl.style.flex = '1';
                if (col.width) {
                    cellEl.style.width = typeof col.width === 'number' ? `${col.width}px` : col.width;
                    cellEl.style.flex = 'none';
                }
                if (col.align) cellEl.style.textAlign = col.align;
                if (col.cellStyle) Object.assign(cellEl.style, col.cellStyle);

                if (this.isCellDisabled?.(col, row)) {
                    cellEl.classList.add('q-cell--disabled');
                    cellEl.setAttribute('aria-disabled', 'true');
                }

                const displayValue = this.formatCellValue?.(col, row) ?? row[col.field] ?? '';
                cellEl.textContent = displayValue;

                rowEl.appendChild(cellEl);
            }

            spacer.appendChild(rowEl);
        }
    }

    onPageChange(e: any): void {
        if (e?.page) {
            if (this.mgr && typeof this.mgr.loadPage === 'function') {
                this.mgr.loadPage(e.page, e.pageSize);
            }
            this.emit?.(TABLE_EVENTS.PAGE_CHANGE, e);
        }
    }

    onSelectionChange(e: any): void {
        if (e?.selectedIds) {
            this.selectedIds = new Set(e.selectedIds);
        }
        this.emit?.(TABLE_EVENTS.SELECTION_CHANGE, e);
    }

    onCreate(e: any): void {
        this.emit?.(TABLE_EVENTS.CREATE, e);
    }

    onEdit(e: any): void {
        this.emit?.(TABLE_EVENTS.EDIT, e);
    }

    onDelete(e: any): void {
        this.emit?.(TABLE_EVENTS.DELETE, e);
    }

    onRefresh(e: any): void {
        if (this.mgr && typeof this.mgr.reload === 'function') {
            this.mgr.reload();
        }
        this.renderHeader();
        this.renderRows();
        this.emit?.(TABLE_EVENTS.REFRESH, e);
    }

    onImport(e: any): void {
        this.emit?.(TABLE_EVENTS.IMPORT, e);
    }

    onExport(e: any): void {
        this.emit?.(TABLE_EVENTS.EXPORT, e);
    }

    onSave(e: any): void {
        this.emit?.(TABLE_EVENTS.SAVE, e);
    }
}
