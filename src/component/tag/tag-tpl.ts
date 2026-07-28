/**
 * Tag 模板定义 — 独立于组件类
 *
 * 通过 TemplateRegistrar 注册，编译产物缓存于注册表。
 */

import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const TAG_TPL: TplNode = {
    tag: 'span',
    cls: 'q-tag',
    children: [
        { tag: 'i', name: 'icon', cls: 'q-tag__icon', hidden: true },
        { tag: 'span', name: 'text', cls: 'q-tag__text' },
        {
            tag: 'span',
            name: 'closeBtn',
            cls: 'q-tag__close',
            hidden: true,
        },
    ],
};

export const TAG_EVENTS: TplEvents = {
    closeBtn: { click: { handler: true, emits: ['close'] } },
};
