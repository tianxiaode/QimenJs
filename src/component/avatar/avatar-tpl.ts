/**
 * Avatar 模板定义 — 独立于组件类
 */

import type { TplNode } from '@/component-core';

export const AVATAR_TPL: TplNode = {
    tag: 'div',
    cls: 'q-avatar',
    children: [
        { tag: 'img', name: 'image', cls: 'q-avatar__image', hidden: true },
        { tag: 'span', name: 'text', cls: 'q-avatar__text', hidden: true },
        { tag: 'i', name: 'icon', cls: 'q-avatar__icon', hidden: true },
    ],
};
