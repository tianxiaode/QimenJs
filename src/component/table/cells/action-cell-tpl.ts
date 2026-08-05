import type { TplNode } from '@/component-core';
import { createCellTpl } from './base-cell-tpl';

/** 操作单元格模板定义 */
export const ACTION_CELL_TPL: TplNode = createCellTpl({
    type: 'ButtonGroup',
    name: 'actions',
    cls: 'q_cell__actions',
    initConfig: {
        direction: 'horizontal',
        gap: '4px',
    },
});
