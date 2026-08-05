/**
 * TableSummaryRowComponent — 整表统计行基础组件
 *
 * 内置整表统计行操作逻辑，不绑定模板。由引擎根据列配置编译模板后，
 * 通过 `class XxxTableSummary extends TableSummaryRowComponent {}` + `useTemplate(tpl)` 完成绑定。
 *
 * @example
 * ```ts
 * const TableSumClass = class extends TableSummaryRowComponent {
 *     _columnMetas = visibleMetas;
 * };
 * TableSumClass.useTemplate(tpl);
 * const sumRow = new TableSumClass();
 * sumRow.update({ count: 150, salary: 3000000 });
 * ```
 */

import { Component } from '../../../component-core/Component';
import type { ColumnMeta } from '../column-types';

export class TableSummaryRowComponent extends Component {
    _columnMetas: ColumnMeta[] = [];

    onAfterInit(): void {
        this.addCls('q-table-row--table-summary');
        this._applyWidths();
    }

    /**
     * 更新整表统计数据
     *
     * @param data - 全局聚合数据
     */
    update(data: any): void {
        if (!data) return;
        for (const meta of this._columnMetas) {
            const cell = this.getNode(meta.name);
            if (cell && typeof cell.update === 'function') {
                const value = data[meta.name];
                if (value !== undefined) {
                    cell.update({ value, format: meta.format });
                } else {
                    cell.update({ value: '' });
                }
            }
        }
    }

    /**
     * 根据列宽度变量设置各列宽度
     */
    _applyWidths(): void {
        for (const meta of this._columnMetas) {
            if (meta.width) {
                this.setNodeStyle(
                    {
                        width: `var(--q-table-col-${meta.name}-width)`,
                        flexShrink: '0',
                    },
                    meta.name
                );
            }
        }
    }
}
