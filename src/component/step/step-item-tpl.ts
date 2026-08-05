import type { TplNode } from '@/component-core';

/** 步骤项模板定义 */
export const STEP_ITEM_TPL: TplNode = {
    tag: 'div',
    cls: 'q-step__item',
    attrs: { role: 'listitem' },
    children: [
        {
            tag: 'div',
            name: 'head',
            cls: 'q-step__head',
            children: [
                {
                    tag: 'div',
                    name: 'circle',
                    cls: 'q-step__circle',
                    children: [{ tag: 'span', name: 'number', cls: 'q-step__number' }],
                },
                { tag: 'div', name: 'tail', cls: 'q-step__tail' },
            ],
        },
        {
            tag: 'div',
            name: 'body',
            cls: 'q-step__body',
            children: [
                { tag: 'div', name: 'title', cls: 'q-step__title' },
                { tag: 'div', name: 'desc', cls: 'q-step__description', hidden: true },
            ],
        },
    ],
};
