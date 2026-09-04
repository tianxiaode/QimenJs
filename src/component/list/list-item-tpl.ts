import type { TemplateDecl } from '@/component-core';

export const LIST_ITEM_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-list__item',
    attributes: { role: 'listitem' },
    children: [
        { tag: 'div', name: 'mark', classes: 'q-list__mark' },
        {
            tag: 'div',
            name: 'content',
            classes: 'q-list__content',
            children: [
                { tag: 'div', name: 'label', classes: 'q-list__label' },
                { tag: 'div', name: 'desc', classes: 'q-list__desc hidden' },
            ],
        },
    ],
};
