import type { TemplateDecl } from '@/component-core';

/** 按钮模板定义 */
export const BUTTON_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-button',
    children: [
        {
            tag: 'div',
            name: 'content',
            classes: 'q-button__content',
            children: [
                {
                    tag: 'i',
                    name: 'icon',
                },
                {
                    tag: 'i',
                    name: 'loading',
                    classes: 'q-button__loading hidden',
                },
                {
                    tag: 'span',
                    name: 'text',
                },
            ],
        },
        {
            tag: 'i',
            name: 'dropIcon',
            classes: 'q-expand-arrow q-expand-arrow--collapsed hidden',
        },
    ],
};
