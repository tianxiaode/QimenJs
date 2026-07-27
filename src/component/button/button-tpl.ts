/**
 * Button 模板定义 — 独立于组件类
 *
 * 通过 TemplateRegistrar 注册，编译产物缓存于注册表。
 */

import type { TplNode } from '@qimenjs/component-core/types/tpl-node-types';
import type { TplEvents } from '@qimenjs/component-core/types/tpl-events';

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

export const BUTTON_EVENTS: TplEvents = {
    '': { click: { emits: ['click'] } },
    dropIcon: { click: { emits: ['dropClick'] } },
};
