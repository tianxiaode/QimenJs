import type { TplNode } from '@/component-core';
import { createCellTpl } from './base-cell-tpl';

export const ACTION_CELL_TPL: TplNode = createCellTpl({
    type: 'ButtonGroup',
    name: 'actions',
    cls: 'q_cell__actions',
    initConfig: {
        direction: 'horizontal',
        gap: '4px',
    },
});
