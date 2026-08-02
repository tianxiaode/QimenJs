import type { TplNode } from '@/component-core/types/tpl-node-types';

export const PANEL_NAV_CHILDREN: TplNode['children'] = [
    { tag: 'button', name: 'prevFieldBtn', cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--prev' },
    { tag: 'button', name: 'nextFieldBtn', cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--next' },
    { tag: 'div', name: 'preview', cls: 'q-dtpanel__nav-preview' },
    {
        tag: 'button',
        name: 'confirmBtn',
        cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--confirm q-dtpanel__nav-confirm',
    },
    {
        tag: 'button',
        name: 'cancelBtn',
        cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--cancel q-dtpanel__nav-cancel',
    },
];
