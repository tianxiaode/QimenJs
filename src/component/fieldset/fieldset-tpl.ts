import type { TemplateDecl } from '@/component-core';

export const FIELDSET_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-fieldset',
    children: [
        {
            tag: 'div',
            name: 'legend',
            classes: 'q-fieldset__legend',
            children: [
                { tag: 'span', name: 'legendText', classes: 'q-fieldset__legend-text' },
                { tag: 'span', name: 'toggleIcon', classes: 'q-fieldset__toggle-icon hidden' },
            ],
        },
        { tag: 'div', name: 'content', classes: 'q-fieldset__content' },
    ],
};
