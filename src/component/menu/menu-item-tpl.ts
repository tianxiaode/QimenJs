import type { TemplateDecl } from '@/component-core';

export const MENU_ITEM_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-menu-item',
    children: [
        {
            tag: 'div',
            name: 'content',
            classes: 'q-menu-item__content',
            children: [
                { tag: 'i', name: 'icon', classes: 'q-menu-item__icon' },
                { tag: 'span', name: 'text', classes: 'q-menu-item__text' },
                { tag: 'span', name: 'shortcut', classes: 'q-menu-item__shortcut' },
                {
                    tag: 'div',
                    name: 'expand',
                    classes: 'q-expand-arrow q-expand-arrow--collapsed hidden',
                    children: [{ tag: 'i' }],
                },
            ],
        },
    ],
};
