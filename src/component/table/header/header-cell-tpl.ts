import type { TemplateDecl } from '@/component-core';

export const HEADER_CELL_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-header-cell',
    children: [
        {
            tag: 'div',
            name: 'content',
            classes: 'q-header-cell__content',
            children: [
                { tag: 'span', name: 'title', classes: 'q-header-cell__title' },
                { tag: 'span', name: 'sortIcon', classes: 'q-header-cell__sort' },
            ],
        },
        { tag: 'span', name: 'menuIcon', classes: 'q-header-cell__menu-icon' },
        { tag: 'span', name: 'resizeHandle', classes: 'q-header-cell__resize' },
    ],
};
