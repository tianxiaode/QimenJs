import type { TplNode } from '@/component-core/types/tpl-node-types';

export const FIELDSET_TPL: TplNode = {
    tag: 'fieldset',
    cls: 'q-fieldset',
    children: [
        {
            tag: 'legend',
            name: 'legend',
            cls: 'q-fieldset__legend',
            i18n: 'legend',
            children: [
                {
                    tag: 'span',
                    name: 'toggleIcon',
                    cls: 'q-fieldset__toggle-icon',
                    hidden: true,
                },
                {
                    tag: 'span',
                    name: 'legendText',
                    cls: 'q-fieldset__legend-text',
                },
            ],
        },
        {
            tag: 'div',
            name: 'content',
            cls: 'q-fieldset__content',
        },
    ],
};
