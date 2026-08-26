/**
 * TableEngine — 表格统一编译引擎
 *
 * 消费 ColumnMetaManager，一次编译产出全部表格组件类。
 * 同列定义复用同类，引擎内部维护 key → CompiledSet 映射。
 *
 * 产出五类组件：
 * - RowClass          extends RowComponent
 * - HeaderClass       extends HeaderComponent
 * - EditClass         extends EditOverlayComponent
 * - GroupSumClass     extends GroupSummaryRowComponent
 * - TableSumClass     extends TableSummaryRowComponent
 *
 * @example
 * ```ts
 * const compiled = TableEngine.compile(metaMgr);
 * const row = new compiled.RowClass();
 * row.update(data);
 *
 * const header = new compiled.HeaderClass();
 * const overlay = new compiled.EditClass();
 * overlay.activate('name', '张三');
 * ```
 */

import type {
    ColumnDefOrGroup,
    ColumnGroupDef,
    ColumnMeta,
    EditType,
    HeaderCellConfigOrGroup,
    GroupHeaderCellConfig,
} from '../column-types';
import type { ColumnMetaManager } from './ColumnMetaManager';
import { createRowTpl, createCellTpl, createTextCellTpl } from './cell-tpl-helpers';
import { RowComponent } from '../row/RowComponent';
import { HeaderComponent } from '../header/HeaderComponent';
import { EditOverlayComponent } from '../edit-overlay/EditOverlayComponent';
import { GroupSummaryRowComponent } from '../group-summary/GroupSummaryRowComponent';
import { TableSummaryRowComponent } from '../table-summary/TableSummaryRowComponent';
import { GroupHeaderCellComponent } from '../header/GroupHeaderCellComponent';
import { LeafHeaderCellComponent } from '../header/LeafHeaderCellComponent';

const EDIT_TYPE_INPUT_MAP: Record<EditType, string> = {
    text: 'text',
    number: 'number',
    date: 'date',
    select: 'select',
    custom: 'text',
};

/**
 * 编译产物集
 */
export interface TableCompiledSet {
    /** 数据行组件类（extends RowComponent） */
    RowClass: any;
    /** 表头组件类（extends HeaderComponent） */
    HeaderClass: any;
    /** 编辑浮层组件类（extends EditOverlayComponent） */
    EditClass: any;
    /** 分组统计行组件类（extends GroupSummaryRowComponent） */
    GroupSumClass: any;
    /** 整表统计行组件类（extends TableSummaryRowComponent） */
    TableSumClass: any;
}

export class TableEngine {
    private static _registry = new Map<string, TableCompiledSet>();

    /**
     * 编译列定义，返回全部表格组件类
     *
     * 同列定义 → 同 key → 命中已有 CompiledSet 直接返回；
     * 不同列定义 → 编译模板 → 派生各类 → useTemplate 注册 → 缓存。
     *
     * @param mgr - 列元数据管理器
     * @returns 编译产物集
     */
    static compile(mgr: ColumnMetaManager): TableCompiledSet {
        const key = TableEngine._deriveKey(mgr);
        const existing = TableEngine._registry.get(key);
        if (existing) return existing;

        const compiled = TableEngine._doCompile(mgr);
        TableEngine._registry.set(key, compiled);
        return compiled;
    }

    /**
     * 根据可见列名生成确定性 key
     */
    private static _deriveKey(mgr: ColumnMetaManager): string {
        return mgr
            .getAll()
            .filter(m => !m.hidden)
            .map(m => m.name)
            .join('_');
    }

    private static _doCompile(mgr: ColumnMetaManager): TableCompiledSet {
        const metas = mgr.getAll();
        const visibleMetas = metas.filter(m => !m.hidden);
        const editableMetas = mgr.getEditable();
        const rawColumns = mgr.rawColumns;

        // ── 数据行 ──
        const rowTpl = createRowTpl(visibleMetas, createCellTpl);
        const RowClass = class extends RowComponent {
            _columnMetas = visibleMetas as ColumnMeta[];
        };
        RowClass.useTemplate(rowTpl);

        // ── 表头 ──
        const headerConfigs = TableEngine._buildHeaderConfigs(rawColumns, mgr);
        const headerDepth = TableEngine._calcDepth(rawColumns);
        const HeaderClass = class extends HeaderComponent {
            _headerConfigs = headerConfigs as HeaderCellConfigOrGroup[];
            _headerDepth = headerDepth as number;
        };
        HeaderClass.useTemplate({ tag: 'div', cls: 'q-table-header', children: [] });

        // ── 编辑浮层 ──
        let EditClass: any;
        if (editableMetas.length === 0) {
            EditClass = class extends EditOverlayComponent {};
            EditClass.useTemplate({ tag: 'div', cls: 'q-edit-overlay' });
        } else {
            const editTpl = TableEngine._buildEditOverlayTpl(editableMetas);
            EditClass = class extends EditOverlayComponent {
                _editableMetas = editableMetas as ColumnMeta[];
            };
            EditClass.useTemplate(editTpl);
        }

        // ── 分组统计行 ──
        const groupSumTpl = createRowTpl(visibleMetas, createTextCellTpl);
        const GroupSumClass = class extends GroupSummaryRowComponent {
            _columnMetas = visibleMetas as ColumnMeta[];
        };
        GroupSumClass.useTemplate(groupSumTpl);

        // ── 整表统计行 ──
        const tableSumTpl = createRowTpl(visibleMetas, createTextCellTpl);
        const TableSumClass = class extends TableSummaryRowComponent {
            _columnMetas = visibleMetas as ColumnMeta[];
        };
        TableSumClass.useTemplate(tableSumTpl);

        return { RowClass, HeaderClass, EditClass, GroupSumClass, TableSumClass };
    }

    // ══════════════════════════════════════════════════════════
    // 表头辅助
    // ══════════════════════════════════════════════════════════

    static _buildHeaderConfigs(
        columns: ColumnDefOrGroup[],
        mgr: ColumnMetaManager
    ): HeaderCellConfigOrGroup[] {
        const configs: HeaderCellConfigOrGroup[] = [];
        for (const col of columns) {
            if (TableEngine._isGroup(col)) {
                configs.push(TableEngine._buildGroupConfig(col, mgr));
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
        const childNames = TableEngine._collectLeafNames(group.children, mgr);
        return {
            name: group.name,
            title: group.title,
            childNames,
            children: TableEngine._buildHeaderConfigs(group.children, mgr),
        };
    }

    private static _collectLeafNames(
        columns: ColumnDefOrGroup[],
        mgr: ColumnMetaManager
    ): string[] {
        const names: string[] = [];
        for (const col of columns) {
            if (TableEngine._isGroup(col)) {
                names.push(...TableEngine._collectLeafNames(col.children, mgr));
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
            if (TableEngine._isGroup(col)) {
                max = Math.max(max, 1 + TableEngine._calcDepth(col.children));
            }
        }
        return max;
    }

    private static _isGroup(col: ColumnDefOrGroup): col is ColumnGroupDef {
        return 'children' in col && Array.isArray((col as ColumnGroupDef).children);
    }

    /**
     * 渲染表头单元格（供 HeaderComponent._createHeaderCells 调用）
     */
    static _renderHeaderCells(
        configs: HeaderCellConfigOrGroup[],
        container: HTMLElement,
        _component: any
    ): void {
        for (const config of configs) {
            const isGroup = 'childNames' in config;
            const cellType = isGroup ? 'GroupHeaderCell' : 'LeafHeaderCell';
            const CellClass = isGroup ? GroupHeaderCellComponent : LeafHeaderCellComponent;
            if (!CellClass) continue;
            const instance = new CellClass(config);
            container.appendChild(instance.el);
        }
    }

    // ══════════════════════════════════════════════════════════
    // 编辑浮层辅助
    // ══════════════════════════════════════════════════════════

    private static _buildEditOverlayTpl(metas: ColumnMeta[]): any {
        const slotChildren = metas.map(meta => ({
            tag: 'div',
            name: `slot_${meta.name}`,
            cls: 'q-edit-overlay__slot',
            style: { display: 'none' },
            children: TableEngine._buildEditorNode(meta),
        }));

        return {
            tag: 'div',
            cls: 'q-edit-overlay',
            children: [
                ...slotChildren,
                {
                    tag: 'div',
                    name: 'actions',
                    cls: 'q-edit-overlay__actions',
                    children: [
                        { tag: 'span', name: 'save', cls: 'q-edit-overlay__save' },
                        { tag: 'span', name: 'cancel', cls: 'q-edit-overlay__cancel' },
                    ],
                },
                {
                    tag: 'div',
                    name: 'error',
                    cls: 'q-edit-overlay__error',
                    style: { display: 'none' },
                },
            ],
        };
    }

    private static _buildEditorNode(meta: ColumnMeta): any[] {
        if (meta.editType === 'custom' && meta.editComponent) {
            return [
                {
                    type: meta.editComponent,
                    name: `input_${meta.name}`,
                    initConfig: { align: meta.align },
                },
            ];
        }

        if (meta.editType === 'select') {
            return [
                {
                    type: 'SelectCell',
                    name: `input_${meta.name}`,
                    initConfig: { align: meta.align },
                },
            ];
        }

        const inputType = EDIT_TYPE_INPUT_MAP[meta.editType] || 'text';
        return [
            {
                tag: 'input',
                name: `input_${meta.name}`,
                cls: 'q-edit-overlay__input',
                attrs: { type: inputType },
            },
        ];
    }
}
