/**
 * cell-tpl-helpers — 共享的单元格模板工具函数
 *
 * 各引擎（RowEngine、GroupSummaryEngine、TableSummaryEngine）
 * 复用这些函数生成 cell TplNode，避免重复逻辑。
 */

import type { TplNode } from '../../../component-core/types/tpl-node-types';
import type { ColumnMeta, CellType } from '../column-types';

const CELL_TYPE_COMPONENT_MAP: Record<CellType, string> = {
    text: 'TextCell',
    tree: 'TreeCell',
    checkbox: 'CheckboxCell',
    action: 'ActionCell',
};

export function createCellTpl(meta: ColumnMeta): TplNode {
    if (meta.cellTpl) return meta.cellTpl;

    const componentType = CELL_TYPE_COMPONENT_MAP[meta.cellType];
    return {
        type: componentType,
        name: meta.name,
        initConfig: {
            align: meta.align,
            ...(meta.format && meta.cellType === 'text' ? { format: meta.format } : {}),
        },
    };
}

export function createTextCellTpl(meta: ColumnMeta): TplNode {
    return {
        type: 'TextCell',
        name: meta.name,
        initConfig: {
            align: meta.align,
            ...(meta.format ? { format: meta.format } : {}),
        },
    };
}

export function createRowTpl(
    metas: ColumnMeta[],
    cellTplFn: (m: ColumnMeta) => TplNode = createCellTpl
): TplNode {
    return {
        tag: 'div',
        cls: 'q-table-row',
        children: metas.filter(m => !m.hidden).map(m => cellTplFn(m)),
    };
}
