import type { TplNode } from '@/component-core/types/tpl-node-types';

export const ITEMGROUP_BASE_TPL: TplNode = {
    tag: 'div',
    cls: 'q-itemgroup',
    children: [{ tag: 'div', name: 'itemContainer', cls: 'q-itemgroup__items' }],
};
