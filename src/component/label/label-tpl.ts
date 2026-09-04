import type { TemplateDecl } from '@/component-core';

/** 标签模板定义 */
export const LABEL_TPL: TemplateDecl = {
    tag: 'label',
    name: 'content',
    classes: 'q-label',
    children: [
        {
            tag: 'span',
            name: 'requiredMark',
            classes: 'q-label__required-mark hidden',
        },
    ],
};