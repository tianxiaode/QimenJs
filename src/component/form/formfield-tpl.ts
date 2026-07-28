import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const FORMFIELD_TPL: TplNode = {
    tag: 'div',
    cls: 'q-formfield',
    children: [
        {
            tag: 'div',
            name: 'labelGroup',
            cls: 'q-formfield__label-group',
            hidden: true,
            children: [
                { tag: 'label', name: 'label', cls: 'q-formfield__label', i18n: 'label' },
                {
                    tag: 'span',
                    name: 'requiredMark',
                    cls: 'q-formfield__required-mark',
                    hidden: true,
                },
                { tag: 'span', name: 'separator', cls: 'q-formfield__separator' },
            ],
        },
        {
            name: 'fieldBody',
            type: 'InputFieldBody',
            cls: 'q-formfield__wrapper',
        },
        {
            name: 'infoGroup',
            type: 'InputInfoGroup',
        },
    ],
};

export const FORMFIELD_EVENTS: TplEvents = {};
