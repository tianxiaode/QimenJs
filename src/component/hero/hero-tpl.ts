import type { TplNode } from '@/component-core';

/** 英雄区模板定义 */
export const HERO_TPL: TplNode = {
    tag: 'div',
    cls: 'q-hero',
    children: [
        { tag: 'h1', name: 'title', cls: 'q-hero__title' },
        { tag: 'h2', name: 'subtitle', cls: 'q-hero__subtitle', hidden: true },
        { tag: 'p', name: 'desc', cls: 'q-hero__desc', hidden: true },
        {
            tag: 'div',
            name: 'actions',
            cls: 'q-hero__actions',
            hidden: true,
            children: [
                {
                    tag: 'button',
                    name: 'actionBtn',
                    cls: 'q-hero__action-btn',
                },
            ],
        },
    ],
};
