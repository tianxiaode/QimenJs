import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const INPUT_FIELD_BODY_TPL: TplNode = {
    tag: 'div',
    cls: 'q-input__wrapper',
    children: [
        {
            tag: 'span',
            name: 'prefix',
            cls: 'q-input__prefix',
            hidden: true,
        },
        {
            tag: 'input',
            name: 'field',
            cls: 'q-input__field',
        },
        {
            name: 'actions',
            type: 'ItemGroupStatic',
            cls: 'q-input__actions',
            hidden: true,
            initConfig: {
                direction: 'horizontal',
                gap: '4px',
            },
        },
        {
            tag: 'div',
            name: 'suffix',
            cls: 'q-input__slot q-input__slot--suffix',
            hidden: true,
        },
        {
            tag: 'div',
            name: 'dropdownIcon',
            cls: 'q-input__slot q-input__slot--dropdown',
            hidden: true,
        },
    ],
};

export const INPUT_FIELD_BODY_EVENTS: TplEvents = {
    field: {
        input: { emits: ['input'], debounce: 150 },
        focus: { emits: ['focus'] },
        blur: { emits: ['blur'] },
        change: { emits: ['change'], debounce: 150 },
        keydown: { emits: ['keydown'] },
    },
    actions: {
        $items: {
            Icon: { click: { emits: ['actionClick'] } },
        },
    },
};
