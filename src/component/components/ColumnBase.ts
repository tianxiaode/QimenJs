/**
 * ColumnBase 列基类组件
 *
 * 表格列的基类，派生类可直接使用，避免重复配置。
 * 注入基础能力：TextAbility(列头文本), VisibleAbility(显隐), DisableAbility(禁用), SortAbility(排序)
 *
 * 派生示例：
 * ```typescript
 * class NumberColumn extends ColumnBase {
 *     static override readonly abilities = [...ColumnBase.abilities, FormatAbility];
 * }
 * ```
 *
 * @example
 * ```js
 * // 布局定义中使用
 * { type: 'Column', field: 'name', label: '姓名', width: 120, sortable: true }
 * { type: 'Column', field: 'amount', label: '金额', hidden: true }
 * ```
 */

import { ComponentBase } from '@qimenjs/component-core';
import { TextAbility } from '@qimenjs/component-abilities';
import { VisibleAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';
import { SortAbility } from '@qimenjs/component-abilities';
import type { ColumnDefinition } from '@qimenjs/component-abilities';

export class ColumnBase extends ComponentBase {
    static override readonly abilities = [TextAbility, VisibleAbility, DisableAbility, SortAbility];

    /** 列字段名 */
    protected _field: string = '';

    /** 列宽 */
    protected _width: number | string = '';

    /** 对齐方式 */
    protected _align: 'left' | 'center' | 'right' = 'left';

    /** 格式化类型 */
    protected _format: string = '';

    /** 自定义渲染函数 */
    protected _renderer: ((value: any, row: Record<string, any>, col: ColumnDefinition) => string) | null = null;

    /** 条件禁用函数 */
    protected _disabledWhen: ((value: any, row: Record<string, any>, col: ColumnDefinition) => boolean) | null = null;

    /** 条件样式函数 */
    protected _cellClassWhen: ((value: any, row: Record<string, any>, col: ColumnDefinition) => string) | null = null;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-column';

        // 从 props 初始化
        if (props?.field) this._field = props.field;
        if (props?.width) this._width = props.width;
        if (props?.align) this._align = props.align;
        if (props?.format) this._format = props.format;
        if (props?.renderer) this._renderer = props.renderer;
        if (props?.disabledWhen) this._disabledWhen = props.disabledWhen;
        if (props?.cellClassWhen) this._cellClassWhen = props.cellClassWhen;
    }

    /** field getter/setter */
    get field(): string {
        return this._field;
    }
    set field(value: string) {
        this._field = value;
    }

    /** width getter/setter */
    get width(): number | string {
        return this._width;
    }
    set width(value: number | string) {
        this._width = value;
    }

    /** align getter/setter */
    get align(): 'left' | 'center' | 'right' {
        return this._align;
    }
    set align(value: 'left' | 'center' | 'right') {
        this._align = value;
    }

    /** format getter/setter */
    get format(): string {
        return this._format;
    }
    set format(value: string) {
        this._format = value;
    }

    /** renderer getter/setter */
    get renderer(): ((value: any, row: Record<string, any>, col: ColumnDefinition) => string) | null {
        return this._renderer;
    }
    set renderer(value: ((value: any, row: Record<string, any>, col: ColumnDefinition) => string) | null) {
        this._renderer = value;
    }

    /** disabledWhen getter/setter */
    get disabledWhen(): ((value: any, row: Record<string, any>, col: ColumnDefinition) => boolean) | null {
        return this._disabledWhen;
    }
    set disabledWhen(value: ((value: any, row: Record<string, any>, col: ColumnDefinition) => boolean) | null) {
        this._disabledWhen = value;
    }

    /** cellClassWhen getter/setter */
    get cellClassWhen(): ((value: any, row: Record<string, any>, col: ColumnDefinition) => string) | null {
        return this._cellClassWhen;
    }
    set cellClassWhen(value: ((value: any, row: Record<string, any>, col: ColumnDefinition) => string) | null) {
        this._cellClassWhen = value;
    }

    /**
     * 导出为 ColumnDefinition 对象
     *
     * 供 TableComponent 的 columns 使用
     */
    toDefinition(): ColumnDefinition {
        const def: ColumnDefinition = {
            field: this._field,
            label: this.text || this._field,
            width: this._width || undefined,
            align: this._align,
            hidden: !this.visible,
            sortable: this.sortField === this._field,
            format: this._format || undefined,
        };

        if (this._renderer) def.renderer = this._renderer;
        if (this._disabledWhen) def.disabledWhen = this._disabledWhen;
        if (this._cellClassWhen) def.cellClassWhen = this._cellClassWhen;
        if (this.disabled) def.cellDisabled = true;

        return def;
    }
}
