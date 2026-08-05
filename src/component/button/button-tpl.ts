import type { TplNode } from '@/component-core';

/** 按钮模板定义 */
export const BUTTON_TPL: TplNode = {
    tag: 'div',
    cls: 'q-button',
    children: [
        {
            tag: 'i',
            name: 'icon',
            cls: 'q-button__icon',
        },
        {
            tag: 'span',
            name: 'text',
            cls: 'q-button__text',
        },
        {
            tag: 'i',
            name: 'dropIcon',
            cls: 'q-expand-arrow q-expand-arrow--collapsed',
            hidden: true,
        },
    ],
};
