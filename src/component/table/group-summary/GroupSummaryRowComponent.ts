/**
 * GroupSummaryRowComponent — 分组统计行基础组件
 *
 * 内置分组统计行操作逻辑，不绑定模板。由引擎根据列配置编译模板后，
 * 通过 `class XxxGroupSummary extends GroupSummaryRowComponent {}` + `useTemplate(tpl)` 完成绑定。
 *
 * @example
 * ```ts
 * const GroupSumClass = class extends GroupSummaryRowComponent {
 *     _columnMetas = visibleMetas;
 * };
 * GroupSumClass.useTemplate(tpl);
 * const sumRow = new GroupSumClass();
 * sumRow.update({ label: '技术部', count: 25 });
 * ```
 */

import { Component } from '../../../component-core/Component';
import type { ColumnMeta } from '../column-types';
import './groupsummaryrow.css';

export class GroupSummaryRowComponent extends Component {
    _columnMetas: ColumnMeta[] = [];

    onAfterInit(): void {
        this.addCls('q-table-row--group-summary');
        this._applyWidths();
    }

    /**
     * 更新分组统计数据
     *
     * @param data - 分组聚合数据
     */
    update(data: any): void {
        if (!data) return;
        for (const meta of this._columnMetas) {
            const cell = this.getNode(meta.name);
            if (cell && typeof cell.update === 'function') {
                const value = data[meta.name];
                if (meta.groupAggregator === 'label') {
                    cell.update({ value: value ?? '' });
                } else if (value !== undefined) {
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
