import type { TplNode } from '@/component-core/types/tpl-node-types';

export const TOGGLE_ICON_TPL: TplNode = {
    tag: 'div',
    cls: 'q-toggle-icon',
    children: [{ tag: 'i', name: 'icon', cls: 'q-toggle-icon__icon' }],
};
