import type { TplNode } from '@/component-core/types/tpl-node-types';
import { createHeaderCellTpl } from './base-header-cell-tpl';

export const GROUP_HEADER_CELL_TPL: TplNode = createHeaderCellTpl({
    tag: 'div',
    name: 'groupBody',
    cls: 'q-header-cell__group-body',
    children: [
        { tag: 'span', name: 'title', cls: 'q-header-cell__title' },
        { tag: 'div', name: 'children', cls: 'q-header-cell__children' },
    ],
});
