/**
 * GroupSummaryEngine — 分组统计行引擎
 *
 * 消费 ColumnMetaManager，编译产生分组统计行组件类。
 * 分组统计行出现在每组数据之后，显示聚合值。
 *
 * 有 groupAggregator 的列显示聚合结果，其余列显示为空。
 * groupAggregator='label' 的列显示分组标签文本。
 *
 * @example
 * ```ts
 * const GroupSumClass = GroupSummaryEngine.compile(metaMgr);
 * const sumRow = new GroupSumClass();
 * sumRow.update({ label: '技术部', count: 25, salary: 500000 });
 * ```
 */

import { Component } from '../../../component-core/Component';
import type { ColumnDefOrGroup, ColumnMeta } from '../column-types';
import type { ColumnMetaManager } from './ColumnMetaManager';
import { createRowTpl, createTextCellTpl } from './cell-tpl-helpers';

export class GroupSummaryEngine {
    private static _cache = new WeakMap<ColumnDefOrGroup[], any>();

    static compile(mgr: ColumnMetaManager): any {
        const columns = mgr.rawColumns;
        const cached = GroupSummaryEngine._cache.get(columns);
        if (cached) return cached;

        const compiled = GroupSummaryEngine._doCompile(mgr);
        GroupSummaryEngine._cache.set(columns, compiled);
        return compiled;
    }

    private static _doCompile(mgr: ColumnMetaManager): any {
        const metas = mgr.getAll();
        const visibleMetas = metas.filter(m => !m.hidden);
        const tpl = createRowTpl(metas, createTextCellTpl);

        return Component.withTemplate({
            tpl,
            body: {
                type: 'GroupSummaryRow',

                onInitState() {
                    return {
                        _columnMetas: visibleMetas as ColumnMeta[],
                    };
                },

                onAfterInit(): void {
                    this.el.classList.add('q-table-row--group-summary');
                    this._applyWidths();
                },

                _applyWidths(): void {
                    for (const meta of this._columnMetas) {
                        const node = this.nodeMap?.[meta.name]?.el as HTMLElement | null;
                        if (node && meta.width) {
                            node.style.width = `var(--q-table-col-${meta.name}-width)`;
                            node.style.flexShrink = '0';
                        }
                    }
                },

                update(data: any): void {
                    if (!data) return;
                    for (const meta of this._columnMetas) {
                        const cell = this.nodeMap?.[meta.name]?.component;
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
                },
            },
        });
    }
}
