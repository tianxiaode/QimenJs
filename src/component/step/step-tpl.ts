import type { TplNode } from '@/component-core/types/tpl-node-types';

export const STEP_TPL: TplNode = {
    tag: 'div',
    cls: 'q-step',
    attrs: { role: 'navigation' },
    children: [{ tag: 'div', name: 'items', cls: 'q-step__items' }],
};
