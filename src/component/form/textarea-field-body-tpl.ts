import type { TemplateDecl } from '@/component-core';

export const TEXTAREA_FIELD_BODY_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-textarea__wrapper',
    children: [
        {
            tag: 'textarea',
            name: 'field',
            classes: 'q-textarea__field',
        },
    ],
};
