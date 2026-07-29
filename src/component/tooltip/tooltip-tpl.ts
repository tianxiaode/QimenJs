import type { TplNode } from '@/component-core/types/tpl-node-types';

export const TOOLTIP_TPL: TplNode = {
    tag: 'div',
    children: [
        { tag: 'span', name: 'text', cls: 'q-tooltip__content' },
        { tag: 'div', name: 'arrow', cls: 'q-arrow' },
    ],
};
