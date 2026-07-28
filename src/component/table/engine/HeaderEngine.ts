/**
 * HeaderEngine — 表头引擎
 *
 * 消费 ColumnMetaManager，编译产生表头组件类。
 * 支持多级分组表头（ColumnGroupDef 递归）。
 *
 * @example
 * ```ts
 * const HeaderClass = HeaderEngine.compile(metaMgr);
 * const header = new HeaderClass();
 * ```
 */

import { Component } from '../../../component-core/Component';
import type {
    ColumnDefOrGroup,
    ColumnGroupDef,
    ColumnAlign,
    HeaderCellConfig,
    GroupHeaderCellConfig,
    HeaderCellConfigOrGroup,
} from '../column-types';
import type { ColumnMetaManager } from './ColumnMetaManager';

export class HeaderEngine {
    private static _cache = new WeakMap<ColumnDefOrGroup[], any>();

    static compile(mgr: ColumnMetaManager): any {
        const columns = mgr.rawColumns;
        const cached = HeaderEngine._cache.get(columns);
        if (cached) return cached;

        const compiled = HeaderEngine._doCompile(mgr);
        HeaderEngine._cache.set(columns, compiled);
        return compiled;
    }

    private static _doCompile(mgr: ColumnMetaManager): any {
        const rawColumns = mgr.rawColumns;
        const headerConfigs = HeaderEngine._buildHeaderConfigs(rawColumns, mgr);
        const headerDepth = HeaderEngine._calcDepth(rawColumns);

        const tpl = {
            tag: 'div',
            cls: 'q-table-header',
            children: [],
        };

        return Component.withTemplate({
            tpl,
            body: {
                type: 'TableHeader',

                onInitState() {
                    return {
                        _headerConfigs: headerConfigs as HeaderCellConfigOrGroup[],
                        _headerDepth: headerDepth as number,
                    };
                },

                onAfterInit(this: any): void {
                    this._createHeaderCells();
                },

                _createHeaderCells(this: any): void {
                    const container = this.el;
                    if (!container) return;
                    HeaderEngine._renderHeaderCells(this._headerConfigs, container, this);
                },
            },
        });
    }

    private static _buildHeaderConfigs(
        columns: ColumnDefOrGroup[],
        mgr: ColumnMetaManager
    ): HeaderCellConfigOrGroup[] {
        const configs: HeaderCellConfigOrGroup[] = [];

        for (const col of columns) {
            if (HeaderEngine._isGroup(col)) {
                configs.push(HeaderEngine._buildGroupConfig(col, mgr));
            } else {
                const meta = mgr.get(col.name);
                if (!meta || meta.hidden) continue;
                configs.push({
                    name: meta.name,
                    title: meta.title,
                    widthVar: `--q-table-col-${meta.name}-width`,
                    sortable: meta.sortable,
                    resizable: meta.resizable,
                    align: meta.align,
                    headerTpl: meta.headerTpl,
                });
            }
        }

        return configs;
    }

    private static _buildGroupConfig(
        group: ColumnGroupDef,
        mgr: ColumnMetaManager
    ): GroupHeaderCellConfig {
        const childNames = HeaderEngine._collectLeafNames(group.children, mgr);

        return {
            name: group.name,
            title: group.title,
            childNames,
            children: HeaderEngine._buildHeaderConfigs(group.children, mgr),
        };
    }

    private static _collectLeafNames(
        columns: ColumnDefOrGroup[],
        mgr: ColumnMetaManager
    ): string[] {
        const names: string[] = [];
        for (const col of columns) {
            if (HeaderEngine._isGroup(col)) {
                names.push(...HeaderEngine._collectLeafNames(col.children, mgr));
            } else {
                const meta = mgr.get(col.name);
                if (meta && !meta.hidden) names.push(meta.name);
            }
        }
        return names;
    }

    private static _calcDepth(columns: ColumnDefOrGroup[]): number {
        let max = 1;
        for (const col of columns) {
            if (HeaderEngine._isGroup(col)) {
                max = Math.max(max, 1 + HeaderEngine._calcDepth(col.children));
            }
        }
        return max;
    }

    private static _isGroup(col: ColumnDefOrGroup): col is ColumnGroupDef {
        return 'children' in col && Array.isArray((col as ColumnGroupDef).children);
    }

    private static _renderHeaderCells(
        configs: HeaderCellConfigOrGroup[],
        container: HTMLElement,
        component: any
    ): void {
        for (const config of configs) {
            const isGroup = 'childNames' in config;
            const cellType = isGroup ? 'GroupHeaderCell' : 'LeafHeaderCell';
            const { TemplateRegistrar } = require('../../../component-core');
            const CellClass = TemplateRegistrar.getInstance().get(cellType);
            if (!CellClass) continue;

            const instance = new CellClass(config);
            container.appendChild(instance.el);
        }
    }
}
