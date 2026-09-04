import type { TemplateDecl } from '@/component-core';

export const ITEMGROUP_BASE_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-itemgroup',
    children: [
        { tag: 'div', name: 'overflowPrev', classes: 'q-itemgroup__overflow-prev hidden' },
        { tag: 'div', name: 'itemContainer', classes: 'q-itemgroup__items' },
        { tag: 'div', name: 'overflowNext', classes: 'q-itemgroup__overflow-next hidden' },
        { tag: 'div', name: 'overflowMore', classes: 'q-itemgroup__overflow-more hidden' },
    ],
};
