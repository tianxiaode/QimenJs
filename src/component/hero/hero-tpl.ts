import type { TemplateDecl } from '@/component-core';

export const HERO_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-hero',
    children: [
        { tag: 'h1', name: 'title', classes: 'q-hero__title' },
        { tag: 'h2', name: 'subtitle', classes: 'q-hero__subtitle hidden' },
        { tag: 'p', name: 'desc', classes: 'q-hero__desc hidden' },
        {
            tag: 'div',
            name: 'actions',
            classes: 'q-hero__actions hidden',
            children: [
                { tag: 'button', name: 'actionBtn', classes: 'q-hero__action-btn' },
            ],
        },
    ],
};
