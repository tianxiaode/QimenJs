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
                {
                    tag: 'div',
                    name: 'selectAllBox',
                    classes: 'q_cell__checkbox q-header-cell__select-all',
                },
                { tag: 'span', name: 'title', classes: 'q-header-cell__title' },
                { tag: 'span', name: 'sortIcon', classes: 'q-header-cell__sort' },
            ],
        },
        {
            tag: 'div',
            name: 'menuArea',
            classes: 'q-header-cell__menu-area',
            children: [
                { tag: 'span', name: 'menuIcon', classes: 'q-caret q-header-cell__menu-icon' },
            ],
        },
        { tag: 'div', name: 'resizeHandle', classes: 'q-header-cell__resize' },
    ],
};
