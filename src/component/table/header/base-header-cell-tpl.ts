import type { TplNode } from '@/component-core/types/tpl-node-types';

export const BASE_HEADER_CELL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-header-cell',
    children: [
        {
            tag: 'div',
            name: 'content',
            cls: 'q-header-cell__content',
            children: [{ tag: 'span', name: 'title', cls: 'q-header-cell__title' }],
        },
        { tag: 'span', name: 'resizeHandle', cls: 'q-header-cell__resize' },
    ],
};
