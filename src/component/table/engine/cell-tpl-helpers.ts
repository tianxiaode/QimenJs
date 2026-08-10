/**
 * cell-tpl-helpers — 共享的单元格模板工具函数
 *
 * TableEngine 复用这些函数生成 cell TplNode，避免重复逻辑。
 */

import type { TplDecl } from '../../../component-core/types/tpl';
import type { ColumnMeta, CellType } from '../column-types';

const CELL_TYPE_COMPONENT_MAP: Record<CellType, string> = {
    text: 'TextCell',
    tree: 'TreeCell',
    checkbox: 'CheckboxCell',
    action: 'ActionCell',
};

/** 创建单元格模板 */
export function createCellTpl(meta: ColumnMeta): TplDecl {
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

/** 创建文本单元格模板 */
export function createTextCellTpl(meta: ColumnMeta): TplDecl {
    return {
        type: 'TextCell',
        name: meta.name,
        initConfig: {
            align: meta.align,
            ...(meta.format ? { format: meta.format } : {}),
        },
    };
}

/** 创建行模板 */
export function createRowTpl(
    metas: ColumnMeta[],
    cellTplFn: (m: ColumnMeta) => TplDecl = createCellTpl
): TplDecl {
    return {
        tag: 'div',
        cls: 'q-table-row',
        children: metas.filter(m => !m.hidden).map(m => cellTplFn(m)),
    };
}
