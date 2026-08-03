import type { TplNode } from '@/component-core';

export const RATING_TPL: TplNode = {
    tag: 'div',
    name: 'stars',
    cls: 'q-rating',
    attrs: { role: 'slider' },
};
