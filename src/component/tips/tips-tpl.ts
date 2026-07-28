import type { TplNode } from '@/component-core/types/tpl-node-types';

export const TIPS_TPL: TplNode = {
    tag: 'div',
    children: [
        { tag: 'span', name: 'text', cls: 'q-tips__content' },
        { tag: 'div', name: 'arrow', cls: 'q-arrow' },
    ],
};
