import type { TemplateDecl } from '@/component-core';

export const BREADCRUMB_TPL: TemplateDecl = {
    tag: 'nav',
    classes: 'q-breadcrumb',
    attributes: { 'aria-label': 'Breadcrumb' },
    children: [{ tag: 'ol', name: 'items', classes: 'q-breadcrumb__list' }],
};
