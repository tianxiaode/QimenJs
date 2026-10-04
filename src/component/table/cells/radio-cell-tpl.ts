import type { TplNode } from '@/component-core';
import { createCellTpl } from './base-cell-tpl';

/** 单选框单元格模板定义 */
export const RADIO_CELL_TPL: TplNode = createCellTpl({
    tag: 'span',
    name: 'box',
    cls: 'q_cell__radio',
});
