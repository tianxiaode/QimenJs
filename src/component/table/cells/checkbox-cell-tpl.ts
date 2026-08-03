import type { TplNode } from '@/component-core';
import { createCellTpl } from './base-cell-tpl';

export const CHECKBOX_CELL_TPL: TplNode = createCellTpl({
    tag: 'span',
    name: 'box',
    cls: 'q_cell__checkbox',
});
