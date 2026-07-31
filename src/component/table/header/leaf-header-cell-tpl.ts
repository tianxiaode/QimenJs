import type { TplNode } from '@/component-core/types/tpl-node-types';
import { createHeaderCellTpl } from './base-header-cell-tpl';

export const LEAF_HEADER_CELL_TPL: TplNode = createHeaderCellTpl({
    tag: 'div',
    name: 'content',
    cls: 'q-header-cell__content',
    children: [
        { tag: 'span', name: 'titleText', cls: 'q-header-cell__title' },
        { tag: 'span', name: 'sortIcon', cls: 'q-header-cell__sort' },
    ],
});
