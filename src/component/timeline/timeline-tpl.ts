import type { TplNode } from '@/component-core/types/tpl-node-types';

export const TIMELINE_TPL: TplNode = {
    tag: 'div',
    cls: 'q-timeline',
    children: [{ tag: 'ul', name: 'items', cls: 'q-timeline__list' }],
};
