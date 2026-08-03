import type { TplNode } from '@/component-core';

export const BREADCRUMB_TPL: TplNode = {
    tag: 'nav',
    cls: 'q-breadcrumb',
    attrs: { 'aria-label': 'Breadcrumb' },
    children: [{ tag: 'ol', name: 'items', cls: 'q-breadcrumb__list' }],
};
