/**
 * RowComponent — 数据行基础组件
 *
 * 内置行操作逻辑，不绑定模板。由引擎根据列配置编译模板后，
 * 通过 `class XxxRow extends RowComponent {}` + `XxxRow.useTemplate(tpl)` 完成绑定。
 *
 * @example
 * ```ts
 * // 引擎内部：
 * const tpl = createRowTpl(visibleMetas, createCellTpl);
 * const RowClass = class extends RowComponent { _columnMetas = visibleMetas; };
 * RowClass.useTemplate(tpl);
 * const row = new RowClass();
 * row.update(data);
 * ```
 */

import { Component } from '../../../component-core/Component';
import type { ColumnMeta } from '../column-types';

export class RowComponent extends Component {
    _columnMetas: ColumnMeta[] = [];

    onAfterInit(): void {
        this._applyWidths();
    }

    /**
     * 更新行数据，逐列调用 cell.update()
     *
     * @param data - 行数据对象
     */
    update(data: any): void {
        if (!data) return;
        for (const meta of this._columnMetas) {
            const cell = this.nodeMap?.[meta.name]?.component;
            if (cell && typeof cell.update === 'function') {
                cell.update(this._getCellData(meta, data));
            }
        }
    }

    /**
     * 根据列宽度变量设置各列宽度
     */
    _applyWidths(): void {
        for (const meta of this._columnMetas) {
            const node = this.nodeMap?.[meta.name]?.el as HTMLElement | null;
            if (node && meta.width) {
                node.style.width = `var(--q-table-col-${meta.name}-width)`;
                node.style.flexShrink = '0';
            }
        }
    }

    /**
     * 根据列类型提取单元格数据
     */
    _getCellData(meta: ColumnMeta, data: any): any {
        const value = this._getFieldValue(data, meta.field);
        switch (meta.cellType) {
            case 'tree':
                return {
                    value,
                    depth: data._depth ?? 0,
                    leaf: data._leaf ?? true,
                    expanded: data._expanded,
                };
            case 'checkbox':
                return { checked: !!value };
            case 'action':
                return { actions: value };
            default:
                return { value, format: meta.format };
        }
    }

    /**
     * 按点分隔路径取值
     */
    _getFieldValue(obj: any, path: string): any {
        if (!obj) return undefined;
        const keys = path.split('.');
        let val = obj;
        for (const key of keys) {
            val = val?.[key];
            if (val === undefined) break;
        }
        return val;
    }
}
