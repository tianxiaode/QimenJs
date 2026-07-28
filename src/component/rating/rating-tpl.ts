import type { TplNode } from '@/component-core/types/tpl-node-types';

export const RATING_TPL: TplNode = {
    tag: 'div',
    name: 'stars',
    cls: 'q-rating',
    attrs: { role: 'slider' },
};
