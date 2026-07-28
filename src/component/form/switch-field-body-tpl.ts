import type { TplNode } from '@/component-core/types/tpl-node-types';

export const SWITCH_FIELD_BODY_TPL: TplNode = {
    tag: 'div',
    cls: 'q-switch__wrapper',
    children: [
        {
            tag: 'div',
            name: 'track',
            cls: 'q-switch__track',
            children: [
                {
                    tag: 'div',
                    name: 'thumb',
                    cls: 'q-switch__thumb',
                },
            ],
        },
    ],
};
