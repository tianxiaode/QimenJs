import type { TplNode } from '@/component-core/types/tpl-node-types';

export const LABEL_TPL: TplNode = {
    tag: 'label',
    name: 'content',
    cls: 'q-label',
    i18n: 'labelText',
    children: [
        {
            tag: 'span',
            name: 'requiredMark',
            cls: 'q-label__required-mark',
            hidden: true,
        },
    ],
};
