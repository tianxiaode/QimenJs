/**
 * Button 模板定义 — 独立于组件类
 *
 * 通过 ComponentRegistrar 注册，编译产物缓存于注册表。
 */

import type { TplNode } from '@/component-core';

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
