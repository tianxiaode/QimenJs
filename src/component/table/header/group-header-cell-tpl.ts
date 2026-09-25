import type { TemplateDecl } from '@/component-core';

export const GROUP_HEADER_CELL_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-header-cell q-header-cell--group',
    children: [
        {
            tag: 'div',
            name: 'groupBody',
            classes: 'q-header-cell__group-body',
            children: [
                { tag: 'span', name: 'title', classes: 'q-header-cell__title' },
                { tag: 'div', name: 'children', classes: 'q-header-cell__children' },
            ],
        },
        { tag: 'span', name: 'resizeHandle', classes: 'q-header-cell__resize' },
    ],
};
