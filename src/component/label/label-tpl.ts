import type { TplNode } from '@/component-core';

/** 标签模板定义 */
export const LABEL_TPL: TplNode = {
    tag: 'label',
    name: 'content',
    cls: 'q-label',
    i18n: 'labelText',
    children: [
        {
            tag: 'span',
            name: 'requiredMark',
            cls: 'q-label__required-mark',
            hidden: true,
        },
    ],
};
