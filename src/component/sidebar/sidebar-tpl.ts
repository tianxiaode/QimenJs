import type { TplNode } from '@/component-core/types/tpl-node-types';

export const SIDEBAR_TPL: TplNode = {
    tag: 'aside',
    cls: 'q-sidebar',
    attrs: { role: 'complementary' },
    children: [
        {
            tag: 'div',
            name: 'header',
            cls: 'q-sidebar__header',
            children: [
                { tag: 'span', name: 'title', cls: 'q-sidebar__title' },
                { tag: 'button', name: 'toggle', cls: 'q-sidebar__toggle', hidden: true },
            ],
        },
        { tag: 'nav', name: 'items', cls: 'q-sidebar__nav' },
    ],
};
