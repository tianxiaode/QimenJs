import type { TplNode } from '@/component-core';

export const MENU_ITEM_TPL: TplNode = {
    tag: 'div',
    children: [
        {
            tag: 'div',
            name: 'content',
            cls: 'q-menu-item__content',
            children: [
                { tag: 'i', name: 'icon', cls: 'q-menu-item__icon' },
                { tag: 'span', name: 'text', cls: 'q-menu-item__text' },
                { tag: 'span', name: 'shortcut', cls: 'q-menu-item__shortcut' },
                {
                    tag: 'div',
                    name: 'expand',
                    cls: 'q-expand-arrow q-expand-arrow--collapsed',
                    hidden: true,
                    children: [{ tag: 'i' }],
                },
            ],
        },
    ],
};
