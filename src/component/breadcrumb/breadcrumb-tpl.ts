import type { TplNode } from '@/component-core';

/** 面包屑模板定义 */
export const BREADCRUMB_TPL: TplNode = {
    tag: 'nav',
    cls: 'q-breadcrumb',
    attrs: { 'aria-label': 'Breadcrumb' },
    children: [{ tag: 'ol', name: 'items', cls: 'q-breadcrumb__list' }],
};
