import type { TemplateDecl } from '@/component-core';
import { createHeaderCellTpl } from './base-header-cell-tpl';

/** 叶子表头单元格模板定义 */
export const LEAF_HEADER_CELL_TPL: TemplateDecl = createHeaderCellTpl({
    tag: 'div',
    name: 'content',
    classes: 'q-header-cell__content',
    children: [
        { tag: 'span', name: 'titleText', classes: 'q-header-cell__title' },
        { tag: 'span', name: 'sortIcon', classes: 'q-header-cell__sort' },
    ],
});
