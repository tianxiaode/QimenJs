import type { TemplateDecl } from '@/component-core';
import { createCellTpl } from './base-cell-tpl';

/** 操作单元格模板定义 */
export const ACTION_CELL_TPL: TemplateDecl = createCellTpl({
    type: 'ButtonGroup',
    name: 'actions',
    classes: 'q_cell__actions',
});
