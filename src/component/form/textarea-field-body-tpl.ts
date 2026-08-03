import type { TplNode } from '@/component-core';

export const TEXTAREA_FIELD_BODY_TPL: TplNode = {
    tag: 'div',
    cls: 'q-textarea__wrapper',
    children: [
        {
            tag: 'textarea',
            name: 'field',
            cls: 'q-textarea__field',
        },
    ],
};
