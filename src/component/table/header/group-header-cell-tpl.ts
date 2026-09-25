import type { TemplateDecl } from '@/component-core';

export const GROUP_HEADER_CELL_TPL: TemplateDecl = {
    tag: 'div',
    cls: 'q-header-cell q-header-cell--group',
    children: [
        {
            tag: 'div',
            name: 'groupBody',
            cls: 'q-header-cell__group-body',
            children: [
                { tag: 'span', name: 'title', cls: 'q-header-cell__title' },
                { tag: 'div', name: 'children', cls: 'q-header-cell__children' },
            ],
        },
        { tag: 'span', name: 'resizeHandle', cls: 'q-header-cell__resize' },
    ],
};
