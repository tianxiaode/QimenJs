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

                onAfterInit(this: any): void {
                    this.addCls('q-table-row--group-summary');
                    this._applyWidths();
                },

                _applyWidths(this: any): void {
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
                },

                update(this: any, data: any): void {
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
                },
            },
        });
    }
}
