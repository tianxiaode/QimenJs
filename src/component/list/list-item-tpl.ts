import type { TplNode } from '@/component-core';

/** 列表项模板定义 */
export const LIST_ITEM_TPL: TplNode = {
    tag: 'div',
    cls: 'q-list__item',
    attrs: { role: 'listitem' },
    children: [
        { tag: 'div', name: 'mark', cls: 'q-list__mark' },
        {
            tag: 'div',
            name: 'content',
            cls: 'q-list__content',
            children: [
                { tag: 'div', name: 'label', cls: 'q-list__label' },
                { tag: 'div', name: 'desc', cls: 'q-list__desc', hidden: true },
            ],
        },
    ],
};
