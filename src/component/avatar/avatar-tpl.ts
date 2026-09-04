import type { TemplateDecl } from '@/component-core';

export const AVATAR_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-avatar',
    children: [
        { tag: 'img', name: 'image', classes: 'q-avatar__image hidden' },
        { tag: 'span', name: 'text', classes: 'q-avatar__text hidden' },
        { tag: 'i', name: 'icon', classes: 'q-avatar__icon hidden' },
    ],
};
