import type { TemplateDecl } from '@/component-core';

/** 步骤项模板定义 */
export const STEP_ITEM_TPL: TemplateDecl = {
    tag: 'div',
    cls: 'q-step__item',
    attrs: { role: 'listitem' },
    children: [
        {
            tag: 'div',
            name: 'head',
            classes: 'q-step__head',
            children: [
                {
                    tag: 'div',
                    name: 'circle',
                    classes: 'q-step__circle',
                    children: [{ tag: 'span', name: 'number', classes: 'q-step__number' }],
                },
                { tag: 'div', name: 'tail', classes: 'q-step__tail' },
            ],
        },
        {
            tag: 'div',
            name: 'body',
            cls: 'q-step__body',
            children: [
                { tag: 'div', name: 'title', classes: 'q-step__title' },
                { tag: 'div', name: 'desc', classes: 'q-step__description', hidden: true },
            ],
        },
    ],
};
