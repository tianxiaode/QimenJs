/**
 * CellBase 单元格基类组件
 *
 * 表格单元格的基类，派生类可直接使用。
 * 注入基础能力：TextAbility(内容), DisableAbility(禁用), StyleAbility(样式, 已在 BASE_ABILITIES)
 *
 * 派生示例：
 * ```typescript
 * class LinkCell extends CellBase {
 *     static override readonly abilities = [...CellBase.abilities, ClickAbility];
 *     // 渲染为 <a> 链接
 * }
 * ```
 *
 * @example
 * ```js
 * // 在 Table 的列定义中指定单元格类型
 * { field: 'name', label: '姓名', cellType: 'LinkCell' }
 * ```
 */

import { ComponentBase } from '@qimenjs/component-core';
import { TextAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';
import type { ColumnDefinition } from '@qimenjs/component-abilities';

export class CellBase extends ComponentBase {
    static override readonly abilities = [TextAbility, DisableAbility];

    /** 所属行数据 */
    private _rowData: Record<string, any> = {};

    /** 所属列定义 */
    private _columnDef: ColumnDefinition | null = null;

    /** 字段名 */
    private _field: string = '';

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-cell';

        if (props?.field) this._field = props.field;
        if (props?.rowData) this._rowData = props.rowData;
        if (props?.columnDef) this._columnDef = props.columnDef;
    }

    /** rowData getter/setter */
    get rowData(): Record<string, any> {
        return this._rowData;
    }
    set rowData(value: Record<string, any>) {
        this._rowData = value;
        this.renderCell();
    }

    /** columnDef getter/setter */
    get columnDef(): ColumnDefinition | null {
        return this._columnDef;
    }
    set columnDef(value: ColumnDefinition | null) {
        this._columnDef = value;
        this.renderCell();
    }

    /** field getter/setter */
    get field(): string {
        return this._field;
    }
    set field(value: string) {
        this._field = value;
    }

    /** 原始值 */
    get rawValue(): any {
        return this._rowData[this._field];
    }

    /**
     * 渲染单元格内容
     *
     * 默认实现：使用 textContent 显示原始值。
     * 派生类可重写此方法实现自定义渲染。
     */
    renderCell(): void {
        if (!this.el) return;

        const value = this.rawValue;

        // 应用列配置
        if (this._columnDef) {
            // 对齐
            if (this._columnDef.align) {
                this.el.style.textAlign = this._columnDef.align;
            }

            // 列宽
            if (this._columnDef.width) {
                this.el.style.width = typeof this._columnDef.width === 'number'
                    ? `${this._columnDef.width}px`
                    : this._columnDef.width;
            }

            // 条件样式
            if (this._columnDef.cellStyle) {
                Object.assign(this.el.style, this._columnDef.cellStyle);
            }

            // 条件 class
            if (this._columnDef.cellClass) {
                this.addClass(this._columnDef.cellClass);
            }
            if (typeof this._columnDef.cellClassWhen === 'function') {
                const extra = this._columnDef.cellClassWhen(value, this._rowData, this._columnDef);
                if (extra) this.addClass(extra);
            }
        }

        // 设置文本内容（textContent 避免 XSS）
        this.el.textContent = value ?? '';
    }

    override update(props?: Record<string, any>): void {
        if (props?.rowData) this._rowData = props.rowData;
        if (props?.columnDef) this._columnDef = props.columnDef;
        this.renderCell();
    }
}
