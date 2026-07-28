import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

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

export const TEXTAREA_FIELD_BODY_EVENTS: TplEvents = {
    field: {
        input: { emits: ['input'], debounce: 150 },
        focus: { emits: ['focus'] },
        blur: { emits: ['blur'] },
        change: { emits: ['change'], debounce: 150 },
    },
};
