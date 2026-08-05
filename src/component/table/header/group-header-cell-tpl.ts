import type { TplNode } from '@/component-core';
import { createHeaderCellTpl } from './base-header-cell-tpl';

/** 分组表头单元格模板定义 */
export const GROUP_HEADER_CELL_TPL: TplNode = createHeaderCellTpl({
    tag: 'div',
    name: 'groupBody',
    cls: 'q-header-cell__group-body',
    children: [
        { tag: 'span', name: 'title', cls: 'q-header-cell__title' },
        { tag: 'div', name: 'children', cls: 'q-header-cell__children' },
    ],
});
