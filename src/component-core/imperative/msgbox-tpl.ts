import type { TplNode } from '@/component-core';

export const MSGBOX_TEMPLATE: TplNode = {
    tag: 'div',
    cls: 'q-msgbox',
    children: [
        { tag: 'div', name: 'header', cls: 'q-msgbox__header' },
        { tag: 'div', name: 'body', cls: 'q-msgbox__body' },
        { tag: 'div', name: 'footer', cls: 'q-msgbox__footer' },
    ],
};
