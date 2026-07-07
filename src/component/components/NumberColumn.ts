/**
 * NumberColumn 数字列
 *
 * 专用于数字显示的列，预设右对齐 + 数字格式化。
 * 支持 currency/percent/number/date/boolean 格式。
 *
 * @example
 * ```js
 * { type: 'NumberColumn', field: 'amount', label: '金额', format: 'currency' }
 * { type: 'NumberColumn', field: 'rate', label: '比率', format: 'percent' }
 * { type: 'NumberColumn', field: 'count', label: '数量', format: 'number' }
 * ```
 */

import { ColumnBase } from './ColumnBase';

export class NumberColumn extends ColumnBase {
    constructor(props?: Record<string, any>) {
        super(props);

        this.el.className = 'q-column q-column--number';

        // 数字列默认右对齐
        this._align = 'right';

        // 从 props 覆盖
        if (props?.align) this._align = props.align;
        if (props?.format) this._format = props.format;
    }

    override toDefinition() {
        const def = super.toDefinition();
        def.align = this._align;
        if (this._format) def.format = this._format;
        return def;
    }
}
