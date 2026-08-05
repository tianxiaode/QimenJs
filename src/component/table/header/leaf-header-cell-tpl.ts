import type { TplNode } from '@/component-core';
import { createHeaderCellTpl } from './base-header-cell-tpl';

/** 叶子表头单元格模板定义 */
export const LEAF_HEADER_CELL_TPL: TplNode = createHeaderCellTpl({
    tag: 'div',
    name: 'content',
    cls: 'q-header-cell__content',
    children: [
        { tag: 'span', name: 'titleText', cls: 'q-header-cell__title' },
        { tag: 'span', name: 'sortIcon', cls: 'q-header-cell__sort' },
    ],
});
