/**
 * TableComponent 表格组件
 *
 * abilities: [EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ChildrenAbility]
 * 支持虚拟列表、排序、列定义
 */

import { ComponentBase } from '../ComponentBase';
import { EntityAbility } from '../abilities/EntityAbility';
import { VirtualListAbility } from '../abilities/VirtualListAbility';
import { SortAbility } from '../abilities/SortAbility';
import { ColumnAbility } from '../abilities/ColumnAbility';
import { ChildrenAbility } from '../abilities/ChildrenAbility';

export class TableComponent extends ComponentBase {
    static override readonly abilities = [EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ChildrenAbility];

    /** 行高（虚拟列表用） */
    private _rowHeight: number = 40;

    /** 容器高度 */
    private _containerHeight: number = 400;

    /** 缓冲行数 */
    private _bufferCount: number = 2;

    /** 滚动位置 */
    private _scrollTop: number = 0;

    /** 表头元素 */
    private headerEl: HTMLElement | null = null;

    /** 表体容器 */
    private bodyEl: HTMLElement | null = null;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-table';

        this.el.innerHTML = `
            <div class="q-table__header" data-ref="header"></div>
            <div class="q-table__body" data-ref="body" style="overflow-y: auto;"></div>
        `;

        this.headerEl = this.el.querySelector('[data-ref="header"]') as HTMLElement;
        this.bodyEl = this.el.querySelector('[data-ref="body"]') as HTMLElement;

        // 设置初始属性
        if (props?.rowHeight) this._rowHeight = props.rowHeight;
        if (props?.containerHeight) this._containerHeight = props.containerHeight;
        if (props?.columns) this.columns = props.columns;

        // 设置容器高度
        if (this.bodyEl) {
            this.bodyEl.style.height = `${this._containerHeight}px`;
            this.bodyEl.addEventListener('scroll', () => {
                this._scrollTop = this.bodyEl!.scrollTop;
                this.renderRows();
            });
        }

        // 渲染表头
        this.renderHeader();
    }

    /** rowHeight getter/setter */
    get rowHeight(): number {
        return this._rowHeight;
    }
    set rowHeight(value: number) {
        this._rowHeight = value;
        this.renderRows();
    }

    /** 可见行数 */
    get visibleCount(): number {
        if (this._rowHeight <= 0) return 0;
        return Math.ceil(this._containerHeight / this._rowHeight);
    }

    /** 起始索引 */
    get startIndex(): number {
        if (this._rowHeight <= 0) return 0;
        return Math.max(0, Math.floor(this._scrollTop / this._rowHeight) - this._bufferCount);
    }

    /** 总高度 */
    get totalHeight(): number {
        const data = this.mgr?.items || [];
        return data.length * this._rowHeight;
    }

    override update(props?: Record<string, any>): void {
        if (props?.columns) this.columns = props.columns;
        this.renderHeader();
        this.renderRows();
    }

    /** 渲染表头（使用 textContent 避免 XSS） */
    private renderHeader(): void {
        if (!this.headerEl) return;

        const cols = this.columns || [];
        this.headerEl.innerHTML = '';

        const rowEl = document.createElement('div');
        rowEl.className = 'q-table__header-row q-flex';

        for (const col of cols) {
            const cellEl = document.createElement('div');
            cellEl.className = 'q-table__header-cell';
            cellEl.style.flex = '1';
            cellEl.textContent = col.label || col.field || '';
            rowEl.appendChild(cellEl);
        }

        this.headerEl.appendChild(rowEl);
    }

    /** 渲染行 */
    private renderRows(): void {
        if (!this.bodyEl) return;

        const data = this.mgr?.items || [];
        const cols = this.columns || [];
        const start = this.startIndex;
        const count = this.visibleCount + this._bufferCount * 2;
        const end = Math.min(start + count, data.length);

        // 设置总高度占位
        this.bodyEl.style.position = 'relative';
        this.bodyEl.innerHTML = '';

        const spacer = document.createElement('div');
        spacer.style.height = `${this.totalHeight}px`;
        spacer.style.position = 'relative';
        this.bodyEl.appendChild(spacer);

        // 渲染可见行
        for (let i = start; i < end; i++) {
            const row = data[i];
            const rowEl = document.createElement('div');
            rowEl.className = 'q-table__row q-flex';
            rowEl.style.position = 'absolute';
            rowEl.style.top = `${i * this._rowHeight}px`;
            rowEl.style.height = `${this._rowHeight}px`;
            rowEl.style.width = '100%';

            for (const col of cols) {
                const cellEl = document.createElement('div');
                cellEl.className = 'q-table__cell';
                cellEl.style.flex = '1';
                cellEl.textContent = row[col.field] ?? '';
                rowEl.appendChild(cellEl);
            }

            spacer.appendChild(rowEl);
        }
    }
}
