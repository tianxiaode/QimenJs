import type { TemplateDecl } from '@/component-core';

export const TAB_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-tab',
    attributes: { role: 'tab' },
    children: [
        { tag: 'span', name: 'icon', classes: 'q-tab__icon hidden' },
        { tag: 'span', name: 'label', classes: 'q-tab__label' },
        { tag: 'span', name: 'close', classes: 'q-tab__close hidden' },
    ],
};
