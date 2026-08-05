import type { TplNode } from '@/component-core';
import { createCellTpl } from './base-cell-tpl';

/** 树形单元格模板定义 */
export const TREE_CELL_TPL: TplNode = createCellTpl({
    tag: 'div',
    cls: 'q_cell__tree',
    children: [
        { tag: 'span', name: 'toggle', cls: 'q_cell__toggle' },
        { tag: 'span', name: 'text', cls: 'q_cell__text' },
    ],
});
