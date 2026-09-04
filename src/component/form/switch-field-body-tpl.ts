import type { TemplateDecl } from '@/component-core';

export const SWITCH_FIELD_BODY_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-switch__wrapper',
    children: [
        {
            tag: 'div',
            name: 'track',
            classes: 'q-switch__track',
            children: [
                { tag: 'div', name: 'thumb', classes: 'q-switch__thumb' },
            ],
        },
    ],
};
