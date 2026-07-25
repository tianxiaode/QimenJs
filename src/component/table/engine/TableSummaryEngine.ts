/**
 * TableSummaryEngine — 整表统计行引擎
 *
 * 消费 ColumnMetaManager，编译产生整表统计行组件类。
 * 整表统计行固定在表格底部，显示全局聚合值。
 *
 * 有 tableAggregator 的列显示聚合结果，其余列显示为空。
 *
 * @example
 * ```ts
 * const TableSumClass = TableSummaryEngine.compile(metaMgr);
 * const sumRow = new TableSumClass();
 * sumRow.update({ count: 150, salary: 3000000 });
 * ```
 */

import { Component } from '../../../component-core/Component';
import type { ColumnDefOrGroup, ColumnMeta } from '../column-types';
import type { ColumnMetaManager } from './ColumnMetaManager';
import { createRowTpl, createTextCellTpl } from './cell-tpl-helpers';

export class TableSummaryEngine {
    private static _cache = new WeakMap<ColumnDefOrGroup[], any>();

    static compile(mgr: ColumnMetaManager): any {
        const columns = mgr.rawColumns;
        const cached = TableSummaryEngine._cache.get(columns);
        if (cached) return cached;

        const compiled = TableSummaryEngine._doCompile(mgr);
        TableSummaryEngine._cache.set(columns, compiled);
        return compiled;
    }

    private static _doCompile(mgr: ColumnMetaManager): any {
        const metas = mgr.getAll();
        const visibleMetas = metas.filter(m => !m.hidden);
        const tpl = createRowTpl(metas, createTextCellTpl);

        return Component.withTemplate({
            tpl,
            body: {
                type: 'TableSummaryRow',

                onInitState() {
                    return {
                        _columnMetas: visibleMetas as ColumnMeta[],
                    };
                },

                onAfterInit(): void {
                    this.el.classList.add('q-table-row--table-summary');
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
                            if (value !== undefined) {
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
