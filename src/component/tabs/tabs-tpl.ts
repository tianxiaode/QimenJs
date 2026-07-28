import type { TplNode } from '@/component-core/types/tpl-node-types';

export const TABS_TPL: TplNode = {
    tag: 'div',
    cls: 'q-tabs',
    children: [
        { tag: 'div', name: 'tabBar', cls: 'q-tabs__bar' },
        { tag: 'div', name: 'items', cls: 'q-tabs__content' },
    ],
};
