/**
 * RowEngine — 数据行引擎
 *
 * 消费 ColumnMetaManager，编译产生数据行组件类。
 * 行组件：展示态，纯数据渲染，cell.update() 驱动。
 *
 * @example
 * ```ts
 * const RowClass = RowEngine.compile(metaMgr);
 * const row = new RowClass();
 * row.update(data);
 * ```
 */

import { Component } from '../../../component-core/Component';
import type { ColumnDefOrGroup, ColumnMeta } from '../column-types';
import type { ColumnMetaManager } from './ColumnMetaManager';
import { createRowTpl, createCellTpl } from './cell-tpl-helpers';

export class RowEngine {
    private static _cache = new WeakMap<ColumnDefOrGroup[], any>();

    static compile(mgr: ColumnMetaManager): any {
        const columns = mgr.rawColumns;
        const cached = RowEngine._cache.get(columns);
        if (cached) return cached;

        const compiled = RowEngine._doCompile(mgr);
        RowEngine._cache.set(columns, compiled);
        return compiled;
    }

    private static _doCompile(mgr: ColumnMetaManager): any {
        const metas = mgr.getAll();
        const visibleMetas = metas.filter(m => !m.hidden);
        const tpl = createRowTpl(metas, createCellTpl);

        return Component.withTemplate({
            tpl,
            body: {
                type: 'TableRow',

                onInitState() {
                    return {
                        _columnMetas: visibleMetas as ColumnMeta[],
                    };
                },

                onAfterInit(): void {
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
                            cell.update(this._getCellData(meta, data));
                        }
                    }
                },

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
                },

                _getFieldValue(obj: any, path: string): any {
                    if (!obj) return undefined;
                    const keys = path.split('.');
                    let val = obj;
                    for (const key of keys) {
                        val = val?.[key];
                        if (val === undefined) break;
                    }
                    return val;
                },
            },
        });
    }
}
