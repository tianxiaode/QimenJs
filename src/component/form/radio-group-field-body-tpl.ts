import type { TplNode } from '@/component-core/types/tpl-node-types';

export const RADIO_GROUP_FIELD_BODY_TPL: TplNode = {
    tag: 'div',
    cls: 'q-radio-group__wrapper',
    children: [
        {
            name: 'options',
            type: 'ItemGroupStatic',
            cls: 'q-radio-group__options',
            initConfig: {
                direction: 'vertical',
                gap: '8px',
            },
        },
    ],
};
