import type { TplNode } from '@/component-core/types/tpl-node-types';

export const BREADCRUMB_TPL: TplNode = {
    tag: 'nav',
    cls: 'q-breadcrumb',
    attrs: { 'aria-label': 'Breadcrumb' },
    children: [{ tag: 'ol', name: 'items', cls: 'q-breadcrumb__list' }],
};
