import type { TplNode } from '@/component-core/types/tpl-node-types';

export const BASE_CELL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-cell',
    children: [{ tag: 'span', name: 'content', cls: 'q-cell__text' }],
};
