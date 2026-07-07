/**
 * IdColumn ID列
 *
 * 专用于 ID 字段的列，预设窄宽度 + 居中 + 不可排序 + 默认隐藏。
 *
 * @example
 * ```js
 * { type: 'IdColumn', field: 'id', label: 'ID' }
 * { type: 'IdColumn', field: 'id', label: 'ID', hidden: false }  // 强制显示
 * ```
 */

import { ColumnBase } from './ColumnBase';

export class IdColumn extends ColumnBase {
    constructor(props?: Record<string, any>) {
        super(props);

        this.el.className = 'q-column q-column--id';

        // ID列默认配置
        this._width = 60;
        this._align = 'center';

        // 从 props 覆盖
        if (props?.width) this._width = props.width;
        if (props?.align) this._align = props.align;

        // ID列默认不可排序
        if (this.visible) {
            // 默认隐藏，除非显式设置 hidden: false
            if (props?.hidden === false) {
                this.visible = true;
            } else if (props?.hidden === undefined) {
                this.visible = false;
            }
        }
    }

    override toDefinition() {
        const def = super.toDefinition();
        def.width = this._width;
        def.align = this._align;
        def.sortable = false;
        return def;
    }
}
